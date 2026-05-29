import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { Queue } from 'bullmq';
import { connectMongoDB } from '../config/mongoose';
import { redisOptions } from '../config/redis';
import { Problem } from '../models/problem.model';
import { Testcase } from '../models/testcase.model';
import { Submission } from '../models/submission.model';
import { startSubmissionWorker } from '../workers/submission.worker';

// 1. Setup environment variables from .env.docker
const dockerEnvPath = path.resolve(__dirname, '../../../../.env.docker');
if (fs.existsSync(dockerEnvPath)) {
  const dockerEnv = dotenv.parse(fs.readFileSync(dockerEnvPath));
  Object.keys(dockerEnv).forEach((key) => {
    process.env[key] = dockerEnv[key];
  });
}

// Override connection settings for running on the host machine
process.env.MONGO_URI = 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JUDGE0_URL = 'https://ce.judge0.com';
process.env.RAPIDAPI_KEY = ''; // Force direct Judge0 connection bypassing RapidAPI

console.log('--- E2E TEST CONFIGURATION ---');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('JUDGE0_URL:', process.env.JUDGE0_URL);

async function runE2ETests() {
  try {
    // 2. Connect to DB
    await connectMongoDB();

    // 3. Setup test data
    console.log('\nCleaning up old test problem...');
    await Problem.deleteOne({ slug: 'multiply-two-numbers' });
    
    console.log('Creating a test Problem: "Multiply Two Numbers"...');
    const problem = new Problem({
      title: 'Multiply Two Numbers',
      slug: 'multiply-two-numbers',
      description: 'Given two integers a and b, output their product.',
      difficulty: 'EASY',
      timeLimit: 2000,
      memoryLimit: 256,
      starterCodes: {
        python: 'import sys\n# your code here',
        cpp: '',
        java: ''
      }
    });
    const savedProblem = await problem.save();
    console.log('Problem created with Mongo ID:', savedProblem._id);

    // Delete old testcases
    await Testcase.deleteMany({ problemId: savedProblem._id });

    console.log('Adding Testcases...');
    const tc1 = new Testcase({
      problemId: savedProblem._id,
      isExample: true,
      input: '5 6\n',
      output: '30\n'
    });
    await tc1.save();

    const tc2 = new Testcase({
      problemId: savedProblem._id,
      isExample: false,
      input: '-4 10\n',
      output: '-40\n'
    });
    await tc2.save();
    console.log('Testcases added successfully.');

    // 4. Start the Worker (from submission.worker.ts)
    console.log('\nStarting Submission Worker...');
    startSubmissionWorker();

    // 5. Test 1: Submitting CORRECT python code
    console.log('\n--- TEST CASE 1: Submitting CORRECT Code (Expect ACCEPTED) ---');
    const correctCode = `import sys
input_data = sys.stdin.read().split()
if input_data:
    a = int(input_data[0])
    b = int(input_data[1])
    print(a * b)
`;
    const submissionCorrect = new Submission({
      userId: 'test-user-id',
      problemId: savedProblem._id,
      code: correctCode,
      language: 'python',
      status: 'PENDING',
      testCasesPassed: 0,
      testCasesTotal: 2
    });
    await submissionCorrect.save();
    console.log('Submission created with Mongo ID:', submissionCorrect._id);

    // Push job to BullMQ
    const submissionQueue = new Queue('submission_queue', { connection: redisOptions });
    console.log('Pushing Job for Correct Submission to BullMQ Queue...');
    await submissionQueue.add('evaluate', {
      submissionId: submissionCorrect._id.toString(),
      code: correctCode,
      language: 'python',
      problemId: savedProblem._id.toString()
    });

    // Wait and check result
    console.log('Waiting for evaluation...');
    let evaluatedCorrect: any = null;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      evaluatedCorrect = await Submission.findById(submissionCorrect._id);
      if (evaluatedCorrect && evaluatedCorrect.status !== 'PENDING' && evaluatedCorrect.status !== 'PROCESSING') {
        break;
      }
      console.log(`Checking status... Current: ${evaluatedCorrect?.status}`);
    }

    console.log('\nVERDICT FOR TEST 1:');
    console.log('Status:', evaluatedCorrect.status);
    console.log('Passed:', evaluatedCorrect.testCasesPassed, '/', evaluatedCorrect.testCasesTotal);
    console.log('Time limit (ms):', evaluatedCorrect.executionTime);
    console.log('Memory used:', evaluatedCorrect.memoryUsed);
    console.log('Error message:', evaluatedCorrect.errorMessage);

    if (evaluatedCorrect.status !== 'ACCEPTED') {
      throw new Error(`Test 1 Failed! Expected ACCEPTED but got ${evaluatedCorrect.status}`);
    }
    console.log('TEST 1 SUCCESSFUL!');

    // 6. Test 2: Submitting INCORRECT python code (Wrong Answer)
    console.log('\n--- TEST CASE 2: Submitting INCORRECT Code (Expect WA) ---');
    const incorrectCode = `import sys
# Bug: Adds instead of multiplying
input_data = sys.stdin.read().split()
if input_data:
    a = int(input_data[0])
    b = int(input_data[1])
    print(a + b)
`;
    const submissionIncorrect = new Submission({
      userId: 'test-user-id',
      problemId: savedProblem._id,
      code: incorrectCode,
      language: 'python',
      status: 'PENDING',
      testCasesPassed: 0,
      testCasesTotal: 2
    });
    await submissionIncorrect.save();
    console.log('Submission created with Mongo ID:', submissionIncorrect._id);

    console.log('Pushing Job for Incorrect Submission to BullMQ Queue...');
    await submissionQueue.add('evaluate', {
      submissionId: submissionIncorrect._id.toString(),
      code: incorrectCode,
      language: 'python',
      problemId: savedProblem._id.toString()
    });

    console.log('Waiting for evaluation...');
    let evaluatedIncorrect: any = null;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      evaluatedIncorrect = await Submission.findById(submissionIncorrect._id);
      if (evaluatedIncorrect && evaluatedIncorrect.status !== 'PENDING' && evaluatedIncorrect.status !== 'PROCESSING') {
        break;
      }
      console.log(`Checking status... Current: ${evaluatedIncorrect?.status}`);
    }

    console.log('\nVERDICT FOR TEST 2:');
    console.log('Status:', evaluatedIncorrect.status);
    console.log('Passed:', evaluatedIncorrect.testCasesPassed, '/', evaluatedIncorrect.testCasesTotal);
    console.log('Error message:', evaluatedIncorrect.errorMessage);

    if (evaluatedIncorrect.status !== 'WA') {
      throw new Error(`Test 2 Failed! Expected WA but got ${evaluatedIncorrect.status}`);
    }
    console.log('TEST 2 SUCCESSFUL!');

    console.log('\n=======================================');
    console.log('ALL E2E JUDGE0 TESTS PASSED SUCCESSFULLY!');
    console.log('=======================================');

  } catch (error) {
    console.error('\nE2E Test Execution Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runE2ETests();
