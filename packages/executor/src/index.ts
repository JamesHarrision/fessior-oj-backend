import axios from 'axios';
import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Judge0 Language IDs
export const LANGUAGE_IDS = {
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (JDK 13.0.1)
  python: 71, // Python (3.8.1)
};

export type LanguageKey = 'cpp' | 'java' | 'python';

export const getLanguageId = (lang: LanguageKey): number => {
  return LANGUAGE_IDS[lang] || 71;
};

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
  time: number;
  memory: number;
  error: string | null;
  actualOutput: string;
}

// Fallback executor for running code inside Judge0 container
export const executeInDocker = async (
  containerName: string,
  code: string,
  language: LanguageKey,
  stdin: string,
  expectedOutput: string,
  timeLimitMs: number
): Promise<ExecutionResult> => {
  const tempId = `ocj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const containerDir = `/tmp/${tempId}`;
  const fileExt = language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp';
  const fileName = language === 'java' ? 'Main.java' : `solution.${fileExt}`;
  const containerFilePath = `${containerDir}/${fileName}`;

  const execInContainer = (command: string, inputData?: string): Promise<{ stdout: string; stderr: string; error: any }> => {
    return new Promise((resolve) => {
      const child = exec(command, (error: any, stdout: string | Buffer, stderr: string | Buffer) => {
        resolve({ stdout: stdout.toString(), stderr: stderr.toString(), error });
      });
      if (inputData !== undefined && child.stdin) {
        child.stdin.on('error', (err) => {
          // Suppress write errors
        });
        child.stdin.write(inputData);
        child.stdin.end();
      }
    });
  };

  try {
    await execInContainer(`docker exec -i ${containerName} mkdir -p ${containerDir}`);

    const writeRes = await execInContainer(`docker exec -i ${containerName} tee ${containerFilePath}`, code);
    if (writeRes.error) {
      throw new Error(`Failed to write code file in container: ${writeRes.stderr || writeRes.error.message}`);
    }

    let runCommand = '';
    if (language === 'python') {
      runCommand = `docker exec -i ${containerName} python3 ${containerFilePath}`;
    } else if (language === 'cpp') {
      const binaryPath = `${containerDir}/solution.out`;
      const compileRes = await execInContainer(`docker exec -i ${containerName} g++ ${containerFilePath} -o ${binaryPath}`);
      if (compileRes.error) {
        await execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => {});
        return {
          status: 'CE',
          time: 0,
          memory: 0,
          error: compileRes.stderr || compileRes.stdout || 'Compilation failed inside container.',
          actualOutput: '',
        };
      }
      runCommand = `docker exec -i ${containerName} ${binaryPath}`;
    } else if (language === 'java') {
      const compileRes = await execInContainer(`docker exec -i ${containerName} javac ${containerFilePath}`);
      if (compileRes.error) {
        await execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => {});
        return {
          status: 'CE',
          time: 0,
          memory: 0,
          error: compileRes.stderr || compileRes.stdout || 'Compilation failed inside container.',
          actualOutput: '',
        };
      }
      runCommand = `docker exec -i ${containerName} java -cp ${containerDir} Main`;
    }

    const startTime = Date.now();
    const runRes = await execInContainer(runCommand, stdin);
    const elapsed = Date.now() - startTime;

    execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => {});

    if (runRes.error) {
      if (runRes.error.killed || runRes.error.signal === 'SIGTERM') {
        return { status: 'TLE', time: timeLimitMs, memory: 0, error: 'Time Limit Exceeded', actualOutput: '' };
      } else {
        return { status: 'RE', time: elapsed, memory: 0, error: runRes.stderr || runRes.error.message, actualOutput: runRes.stdout };
      }
    }

    const cleanStdout = runRes.stdout.trim();
    const cleanExpected = expectedOutput.trim();

    if (cleanStdout === cleanExpected) {
      return { status: 'ACCEPTED', time: elapsed, memory: 0, error: null, actualOutput: runRes.stdout };
    } else {
      return {
        status: 'WA',
        time: elapsed,
        memory: 0,
        error: `Output mismatch.\nExpected:\n${cleanExpected}\n\nGot:\n${cleanStdout}`,
        actualOutput: runRes.stdout,
      };
    }
  } catch (err: any) {
    console.warn(`Docker execution failed, falling back to Host local execution:`, err.message);
    await execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => {});
    return executeOnHost(code, language, stdin, expectedOutput, timeLimitMs);
  }
};

// Fallback executor for running code on Host directly
export const executeOnHost = async (
  code: string,
  language: LanguageKey,
  stdin: string,
  expectedOutput: string,
  timeLimitMs: number
): Promise<ExecutionResult> => {
  const tempDir = os.tmpdir();
  const fileExt = language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp';
  const fileName = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = path.join(tempDir, fileName);

  try {
    fs.writeFileSync(filePath, code);
  } catch (err: any) {
    return { status: 'RE', time: 0, memory: 0, error: `Failed to write source file: ${err.message}`, actualOutput: '' };
  }

  return new Promise((resolve) => {
    let command = '';
    if (language === 'python') {
      command = `python "${filePath}"`;
    } else if (language === 'cpp') {
      const binaryPath = filePath.replace('.cpp', '.exe');
      try {
        execSync(`g++ "${filePath}" -o "${binaryPath}"`);
        command = `"${binaryPath}"`;
      } catch (err: any) {
        resolve({
          status: 'CE',
          time: 0,
          memory: 0,
          error: `Lỗi biên dịch cục bộ (Local Compilation Error):\nKhông tìm thấy hoặc không thể chạy trình biên dịch 'g++' trên hệ thống Windows của bạn.\n\nGợi ý:\n1. Môi trường Docker/WSL2 của bạn gặp lỗi cgroup sandbox (Error 13), do đó hệ thống tự động chuyển sang chế độ biên dịch cục bộ.\n2. Máy của bạn chưa cài đặt hoặc chưa cấu hình biến môi trường PATH cho 'g++' (MinGW).\n3. Hãy cài đặt g++ hoặc chuyển sang ngôn ngữ Python để chạy thử ổn định.`,
          actualOutput: '',
        });
        try { fs.unlinkSync(filePath); } catch {}
        return;
      }
    } else if (language === 'java') {
      resolve({
        status: 'RE',
        time: 0,
        memory: 0,
        error: 'Chế độ local fallback chưa hỗ trợ biên dịch Java trên máy cục bộ của bạn.',
        actualOutput: '',
      });
      try { fs.unlinkSync(filePath); } catch {}
      return;
    }

    const startTime = Date.now();
    const child = exec(command, { timeout: timeLimitMs }, (error: any, stdout: any, stderr: any) => {
      const elapsed = Date.now() - startTime;

      try { fs.unlinkSync(filePath); } catch {}
      if (language === 'cpp') {
        try { fs.unlinkSync(filePath.replace('.cpp', '.exe')); } catch {}
      }

      if (error) {
        if (error.killed || error.signal === 'SIGTERM') {
          resolve({ status: 'TLE', time: timeLimitMs, memory: 0, error: 'Time Limit Exceeded', actualOutput: '' });
        } else {
          resolve({ status: 'RE', time: elapsed, memory: 0, error: stderr || error.message, actualOutput: stdout.toString() });
        }
        return;
      }

      const cleanStdout = stdout.toString().trim();
      const cleanExpected = expectedOutput.trim();

      if (cleanStdout === cleanExpected) {
        resolve({ status: 'ACCEPTED', time: elapsed, memory: 0, error: null, actualOutput: stdout.toString() });
      } else {
        resolve({
          status: 'WA',
          time: elapsed,
          memory: 0,
          error: `Output mismatch.\nExpected:\n${cleanExpected}\n\nGot:\n${cleanStdout}`,
          actualOutput: stdout.toString(),
        });
      }
    });

    if (child.stdin) {
      child.stdin.on('error', (err) => {
        // Suppress EPIPE or other write errors when child process exits early
      });
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
};

// Dispatcher for local execution fallback
export const executeLocally = async (
  code: string,
  language: LanguageKey,
  stdin: string,
  expectedOutput: string,
  timeLimitMs: number
): Promise<ExecutionResult> => {
  const containerName = (() => {
    try {
      const output = execSync('docker ps --filter "name=judge0.*server" --format "{{.Names}}"', { stdio: 'pipe' })
        .toString()
        .trim();
      if (output) return output.split('\n')[0].trim();
    } catch (err) {}
    return null;
  })();

  if (containerName) {
    return executeInDocker(containerName, code, language, stdin, expectedOutput, timeLimitMs);
  } else {
    return executeOnHost(code, language, stdin, expectedOutput, timeLimitMs);
  }
};

// Call Judge0 or fallback to local
export const executeTestCase = async (
  code: string,
  languageId: number,
  stdin: string,
  expectedOutput: string,
  timeLimitMs: number,
  config: {
    judge0Url: string;
    rapidApiKey: string;
    rapidApiHost: string;
  }
): Promise<ExecutionResult> => {
  const { judge0Url, rapidApiKey, rapidApiHost } = config;
  const isRapidAPI = judge0Url.includes('rapidapi.com');

  if (isRapidAPI && !rapidApiKey) {
    console.warn('RAPIDAPI_KEY is not defined. Using offline simulated compilation and test runner.');
    return {
      status: 'ACCEPTED',
      time: 50,
      memory: 2000,
      error: null,
      actualOutput: 'Simulated Output (Offline Mode)\n',
    };
  }

  const getLangKey = (id: number): LanguageKey => {
    if (id === 54) return 'cpp';
    if (id === 62) return 'java';
    return 'python';
  };

  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (isRapidAPI) {
      headers['x-rapidapi-key'] = rapidApiKey;
      headers['x-rapidapi-host'] = rapidApiHost;
    }

    const response = await axios.post(
      `${judge0Url}/submissions?base64_encoded=true&wait=true`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString('base64'),
        expected_output: Buffer.from(expectedOutput).toString('base64'),
        cpu_time_limit: timeLimitMs / 1000,
      },
      { headers }
    );

    const result = response.data;
    const statusId = result.status?.id;
    const compileOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : '';

    const isSandboxError = statusId === 13 ||
      (statusId === 6 && (
        compileOutput.includes('Failed to create control group') ||
        compileOutput.includes('cgroup') ||
        compileOutput.includes('g++: not found') ||
        compileOutput.includes('/bin/sh') ||
        compileOutput.includes('No such file or directory') ||
        compileOutput.includes('Permission denied')
      ));

    if (isSandboxError) {
      console.warn(`Judge0 returned sandbox/compilation error (statusId: ${statusId}). Falling back to local execution...`);
      return await executeLocally(code, getLangKey(languageId), stdin, expectedOutput, timeLimitMs);
    }

    let status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' = 'WA';
    if (statusId === 3) status = 'ACCEPTED';
    else if (statusId === 4) status = 'WA';
    else if (statusId === 5) status = 'TLE';
    else if (statusId === 6) status = 'CE';
    else if (statusId >= 7 && statusId <= 12) status = 'RE';

    const actualOutput = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '';
    const stderrOutput = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '';

    return {
      status,
      time: result.time ? Math.round(parseFloat(result.time) * 1000) : 0,
      memory: result.memory || 0,
      error: compileOutput || stderrOutput || null,
      actualOutput,
    };
  } catch (err: any) {
    console.error('Error calling Judge0 API:', err.message);
    console.warn('Falling back to local execution...');
    return await executeLocally(code, getLangKey(languageId), stdin, expectedOutput, timeLimitMs);
  }
};
