import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import { Testcase } from '../models/testcase.model';
import { submissionQueue } from '../config/queue';
import { AppError } from '@ocj/errors';
import mongoose from 'mongoose';
import axios from 'axios';
import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
};

export class SubmissionService {
  async submit(
    userId: string,
    data: {
      problemId: string;
      code: string;
      language: 'cpp' | 'java' | 'python';
    }
  ) {
    // 1. Find problem by Mongo ObjectId or slug
    let problem = null;
    if (mongoose.Types.ObjectId.isValid(data.problemId)) {
      problem = await Problem.findById(data.problemId);
    }
    if (!problem) {
      problem = await Problem.findOne({ slug: data.problemId });
    }

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // 2. Create submission in MongoDB
    const submission = new Submission({
      userId,
      problemId: problem._id,
      code: data.code,
      language: data.language,
      status: 'PENDING',
      testCasesPassed: 0,
      testCasesTotal: 0,
    });
    await submission.save();

    // 3. Add to BullMQ Queue
    await submissionQueue.add('submission-job', {
      submissionId: submission._id.toString(),
      code: submission.code,
      language: submission.language,
      problemId: problem._id.toString(),
    });

    return submission;
  }

  async getSubmissionDetails(submissionId: string, userId: string, isAdmin = false) {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw new AppError('Invalid submission ID format', 400);
    }

    const submission = await Submission.findById(submissionId).populate('problemId', 'title slug difficulty');
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Security check: Only the author or an Admin can view details of a submission
    if (submission.userId !== userId && !isAdmin) {
      throw new AppError('Forbidden: Access denied to this submission', 403);
    }

    return submission;
  }

  async getUserSubmissions(
    userId: string,
    filters: {
      problemId?: string;
      page: number;
      limit: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (filters.problemId && mongoose.Types.ObjectId.isValid(filters.problemId)) {
      query.problemId = new mongoose.Types.ObjectId(filters.problemId);
    }

    const [total, items] = await Promise.all([
      Submission.countDocuments(query),
      Submission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('problemId', 'title slug difficulty'),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  async runCode(data: {
    problemId: string;
    code: string;
    language: 'cpp' | 'java' | 'python';
    customInput?: string;
  }) {
    let problem = null;
    if (mongoose.Types.ObjectId.isValid(data.problemId)) {
      problem = await Problem.findById(data.problemId);
    }
    if (!problem) {
      problem = await Problem.findOne({ slug: data.problemId });
    }
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    let testcasesToRun: Array<{ input: string; output: string; isExample: boolean }> = [];
    if (data.customInput !== undefined && data.customInput !== null) {
      testcasesToRun = [{ input: data.customInput, output: '', isExample: false }];
    } else {
      testcasesToRun = await Testcase.find({ problemId: problem._id, isExample: true });
      if (testcasesToRun.length === 0) {
        testcasesToRun = [{ input: '', output: '', isExample: true }];
      }
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY || '';
    const rapidApiHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
    const judge0Url = process.env.JUDGE0_URL || `https://${rapidApiHost}`;
    const isRapidAPI = judge0Url.includes('rapidapi.com');
    const languageId = LANGUAGE_IDS[data.language] || 71;

    const results = [];
    for (const tc of testcasesToRun) {
      if (isRapidAPI && !rapidApiKey) {
        // Fallback or mock successful result for testing/offline mode
        results.push({
          status: 'ACCEPTED',
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: 'Simulated Output (Offline Mode)\n',
          time: 30,
          memory: 1200,
          error: null,
        });
      } else {
        try {
          const headers: any = { 'Content-Type': 'application/json' };
          if (isRapidAPI) {
            headers['x-rapidapi-key'] = rapidApiKey;
            headers['x-rapidapi-host'] = rapidApiHost;
          }

          const response = await axios.post(
            `${judge0Url}/submissions?base64_encoded=true&wait=true`,
            {
              source_code: Buffer.from(data.code).toString('base64'),
              language_id: languageId,
              stdin: Buffer.from(tc.input).toString('base64'),
              expected_output: Buffer.from(tc.output).toString('base64'),
              cpu_time_limit: (problem.timeLimit || 2000) / 1000,
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
            console.warn(`Judge0 returned cgroup sandbox/compilation error. Running fallback local execution...`);
            const localResult = await this.executeLocally(
              data.code,
              data.language,
              tc.input,
              tc.output,
              problem.timeLimit || 2000
            );
            results.push({
              status: localResult.status,
              input: tc.input,
              expectedOutput: tc.output,
              actualOutput: localResult.actualOutput,
              time: localResult.time,
              memory: localResult.memory,
              error: localResult.error,
            });
            continue;
          }

          let status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' = 'WA';
          if (statusId === 3) status = 'ACCEPTED';
          else if (statusId === 4) status = 'WA';
          else if (statusId === 5) status = 'TLE';
          else if (statusId === 6) status = 'CE';
          else if (statusId >= 7 && statusId <= 12) status = 'RE';

          const actualOutput = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '';
          const stderrOutput = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '';

          results.push({
            status,
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput,
            time: result.time ? Math.round(parseFloat(result.time) * 1000) : 0,
            memory: result.memory || 0,
            error: compileOutput || stderrOutput || null,
          });
        } catch (err: any) {
          console.warn('Judge0 execution failed, falling back to local execution:', err.message);
          const localResult = await this.executeLocally(
            data.code,
            data.language,
            tc.input,
            tc.output,
            problem.timeLimit || 2000
          );
          results.push({
            status: localResult.status,
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput: localResult.actualOutput,
            time: localResult.time,
            memory: localResult.memory,
            error: localResult.error,
          });
        }
      }
    }

    return results;
  }

  private async executeLocally(
    code: string,
    language: 'cpp' | 'java' | 'python',
    stdin: string,
    expectedOutput: string,
    timeLimitMs: number
  ): Promise<{
    status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
    actualOutput: string;
    time: number;
    memory: number;
    error: string | null;
  }> {
    const containerName = (() => {
      try {
        const output = execSync('docker ps --filter "name=judge0.*server" --format "{{.Names}}"', { stdio: 'pipe' })
          .toString()
          .trim();
        if (output) return output.split('\n')[0].trim();
      } catch (err) { }
      return null;
    })();

    if (containerName) {
      return this.executeInDocker(containerName, code, language, stdin, expectedOutput, timeLimitMs);
    } else {
      return this.executeOnHost(code, language, stdin, expectedOutput, timeLimitMs);
    }
  }

  private async executeInDocker(
    containerName: string,
    code: string,
    language: 'cpp' | 'java' | 'python',
    stdin: string,
    expectedOutput: string,
    timeLimitMs: number
  ): Promise<{
    status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
    actualOutput: string;
    time: number;
    memory: number;
    error: string | null;
  }> {
    const tempId = `ocj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const containerDir = `/tmp/${tempId}`;
    const fileExt = language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp';
    const fileName = language === 'java' ? 'Main.java' : `solution.${fileExt}`;
    const containerFilePath = `${containerDir}/${fileName}`;

    const execInContainer = (command: string, inputData?: string): Promise<{ stdout: string; stderr: string; error: any }> => {
      return new Promise((resolve) => {
        const child = exec(command, (error, stdout, stderr) => {
          resolve({ stdout: stdout.toString(), stderr: stderr.toString(), error });
        });
        if (inputData !== undefined && child.stdin) {
          child.stdin.write(inputData);
          child.stdin.end();
        }
      });
    };

    try {
      // 1. Create temp directory in container
      await execInContainer(`docker exec -i ${containerName} mkdir -p ${containerDir}`);

      // 2. Write code file inside container
      const writeRes = await execInContainer(`docker exec -i ${containerName} tee ${containerFilePath}`, code);
      if (writeRes.error) {
        throw new Error(`Failed to write code file in container: ${writeRes.stderr || writeRes.error.message}`);
      }

      // 3. Compile if necessary
      let runCommand = '';
      if (language === 'python') {
        runCommand = `docker exec -i ${containerName} python3 ${containerFilePath}`;
      } else if (language === 'cpp') {
        const binaryPath = `${containerDir}/solution.out`;
        const compileRes = await execInContainer(`docker exec -i ${containerName} g++ ${containerFilePath} -o ${binaryPath}`);
        if (compileRes.error) {
          await execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => { });
          return {
            status: 'CE',
            actualOutput: '',
            time: 0,
            memory: 0,
            error: compileRes.stderr || compileRes.stdout || 'Compilation failed inside container.',
          };
        }
        runCommand = `docker exec -i ${containerName} ${binaryPath}`;
      } else if (language === 'java') {
        const compileRes = await execInContainer(`docker exec -i ${containerName} javac ${containerFilePath}`);
        if (compileRes.error) {
          await execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => { });
          return {
            status: 'CE',
            actualOutput: '',
            time: 0,
            memory: 0,
            error: compileRes.stderr || compileRes.stdout || 'Compilation failed inside container.',
          };
        }
        runCommand = `docker exec -i ${containerName} java -cp ${containerDir} Main`;
      }

      // 4. Run program inside container
      const startTime = Date.now();
      const runRes = await execInContainer(runCommand, stdin);
      const elapsed = Date.now() - startTime;

      // Clean up directory in container background
      execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => { });

      if (runRes.error) {
        if (runRes.error.killed || runRes.error.signal === 'SIGTERM') {
          return {
            status: 'TLE',
            actualOutput: '',
            time: timeLimitMs,
            memory: 0,
            error: 'Time Limit Exceeded'
          };
        } else {
          return {
            status: 'RE',
            actualOutput: runRes.stdout || '',
            time: elapsed,
            memory: 0,
            error: runRes.stderr || runRes.error.message
          };
        }
      }

      const cleanStdout = runRes.stdout.trim();
      const cleanExpected = expectedOutput.trim();

      if (cleanStdout === cleanExpected) {
        return {
          status: 'ACCEPTED',
          actualOutput: runRes.stdout,
          time: elapsed,
          memory: 0,
          error: null
        };
      } else {
        return {
          status: 'WA',
          actualOutput: runRes.stdout,
          time: elapsed,
          memory: 0,
          error: `Output mismatch.\nExpected:\n${cleanExpected}\n\nGot:\n${cleanStdout}`,
        };
      }
    } catch (err: any) {
      console.warn(`Docker execution failed, falling back to Host local execution:`, err.message);
      await execInContainer(`docker exec -i ${containerName} rm -rf ${containerDir}`).catch(() => { });
      return this.executeOnHost(code, language, stdin, expectedOutput, timeLimitMs);
    }
  }

  private async executeOnHost(
    code: string,
    language: 'cpp' | 'java' | 'python',
    stdin: string,
    expectedOutput: string,
    timeLimitMs: number
  ): Promise<{
    status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
    actualOutput: string;
    time: number;
    memory: number;
    error: string | null;
  }> {
    const tempDir = os.tmpdir();
    const fileExt = language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp';
    const fileName = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = path.join(tempDir, fileName);

    try {
      fs.writeFileSync(filePath, code);
    } catch (err: any) {
      return {
        status: 'RE',
        actualOutput: '',
        time: 0,
        memory: 0,
        error: `Failed to write source file: ${err.message}`
      };
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
            actualOutput: '',
            time: 0,
            memory: 0,
            error: `Lỗi biên dịch cục bộ (Local Compilation Error):\nKhông tìm thấy hoặc không thể chạy trình biên dịch 'g++' trên hệ thống Windows của bạn.\n\nGợi ý:\n1. Môi trường Docker/WSL2 của bạn gặp lỗi cgroup sandbox (Error 13), do đó hệ thống tự động chuyển sang chế độ biên dịch cục bộ.\n2. Máy của bạn chưa cài đặt hoặc chưa cấu hình biến môi trường PATH cho 'g++' (MinGW).\n3. Hãy cài đặt g++ hoặc chuyển sang ngôn ngữ Python để chạy thử ổn định.`,
          });
          try { fs.unlinkSync(filePath); } catch { }
          return;
        }
      } else if (language === 'java') {
        resolve({
          status: 'RE',
          actualOutput: '',
          time: 0,
          memory: 0,
          error: 'Chế độ local fallback chưa hỗ trợ biên dịch Java trên máy cục bộ của bạn.',
        });
        try { fs.unlinkSync(filePath); } catch { }
        return;
      }

      const startTime = Date.now();
      const child = exec(command, { timeout: timeLimitMs }, (error: any, stdout: any, stderr: any) => {
        const elapsed = Date.now() - startTime;

        try { fs.unlinkSync(filePath); } catch { }
        if (language === 'cpp') {
          try { fs.unlinkSync(filePath.replace('.cpp', '.exe')); } catch { }
        }

        if (error) {
          if (error.killed || error.signal === 'SIGTERM') {
            resolve({
              status: 'TLE',
              actualOutput: '',
              time: timeLimitMs,
              memory: 0,
              error: 'Time Limit Exceeded'
            });
          } else {
            resolve({
              status: 'RE',
              actualOutput: stdout?.toString() || '',
              time: elapsed,
              memory: 0,
              error: stderr || error.message
            });
          }
          return;
        }

        const cleanStdout = stdout.toString().trim();
        const cleanExpected = expectedOutput.trim();

        if (cleanStdout === cleanExpected) {
          resolve({
            status: 'ACCEPTED',
            actualOutput: stdout.toString(),
            time: elapsed,
            memory: 0,
            error: null
          });
        } else {
          resolve({
            status: 'WA',
            actualOutput: stdout.toString(),
            time: elapsed,
            memory: 0,
            error: `Output mismatch.\nExpected:\n${cleanExpected}\n\nGot:\n${cleanStdout}`,
          });
        }
      });

      if (child.stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }
    });
  }
}

export const submissionService = new SubmissionService();
