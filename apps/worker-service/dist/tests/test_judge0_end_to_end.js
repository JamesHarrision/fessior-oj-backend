"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const bullmq_1 = require("bullmq");
const mongoose_2 = require("../config/mongoose");
const redis_1 = require("../config/redis");
const problem_model_1 = require("../models/problem.model");
const testcase_model_1 = require("../models/testcase.model");
const submission_model_1 = require("../models/submission.model");
const submission_worker_1 = require("../workers/submission.worker");
// 1. Setup environment variables from .env.docker
const dockerEnvPath = path_1.default.resolve(__dirname, '../../../../.env.docker');
if (fs_1.default.existsSync(dockerEnvPath)) {
    const dockerEnv = dotenv_1.default.parse(fs_1.default.readFileSync(dockerEnvPath));
    Object.keys(dockerEnv).forEach((key) => {
        process.env[key] = dockerEnv[key];
    });
}
// Override connection settings for running on the host machine
process.env.MONGO_URI = 'mongodb://mongoadmin:mongosecret@127.0.0.1:27017/ocj_database?authSource=admin';
process.env.REDIS_HOST = '127.0.0.1';
process.env.REDIS_PORT = '6379';
process.env.JUDGE0_URL = 'http://127.0.0.1:2358';
process.env.RAPIDAPI_KEY = ''; // Force direct Judge0 connection bypassing RapidAPI
console.log('--- E2E TEST CONFIGURATION ---');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('JUDGE0_URL:', process.env.JUDGE0_URL);
async function runE2ETests() {
    try {
        // 2. Connect to DB
        await (0, mongoose_2.connectMongoDB)();
        // 3. Setup test data
        console.log('\nCleaning up old test problem...');
        await problem_model_1.Problem.deleteOne({ slug: 'multiply-two-numbers' });
        console.log('Creating a test Problem: "Multiply Two Numbers"...');
        const problem = new problem_model_1.Problem({
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
        await testcase_model_1.Testcase.deleteMany({ problemId: savedProblem._id });
        console.log('Adding Testcases...');
        const tc1 = new testcase_model_1.Testcase({
            problemId: savedProblem._id,
            isExample: true,
            input: '5 6\n',
            output: '30\n'
        });
        await tc1.save();
        const tc2 = new testcase_model_1.Testcase({
            problemId: savedProblem._id,
            isExample: false,
            input: '-4 10\n',
            output: '-40\n'
        });
        await tc2.save();
        console.log('Testcases added successfully.');
        // 4. Start the Worker (from submission.worker.ts)
        console.log('\nStarting Submission Worker...');
        (0, submission_worker_1.startSubmissionWorker)();
        // 5. Test 1: Submitting CORRECT python code
        console.log('\n--- TEST CASE 1: Submitting CORRECT Code (Expect ACCEPTED) ---');
        const correctCode = `import sys
input_data = sys.stdin.read().split()
if input_data:
    a = int(input_data[0])
    b = int(input_data[1])
    print(a * b)
`;
        const submissionCorrect = new submission_model_1.Submission({
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
        const submissionQueue = new bullmq_1.Queue('submission_queue', { connection: redis_1.redisOptions });
        console.log('Pushing Job for Correct Submission to BullMQ Queue...');
        await submissionQueue.add('evaluate', {
            submissionId: submissionCorrect._id.toString(),
            code: correctCode,
            language: 'python',
            problemId: savedProblem._id.toString()
        });
        // Wait and check result
        console.log('Waiting for evaluation...');
        let evaluatedCorrect = null;
        for (let i = 0; i < 15; i++) {
            await new Promise((r) => setTimeout(r, 1000));
            evaluatedCorrect = await submission_model_1.Submission.findById(submissionCorrect._id);
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
        const submissionIncorrect = new submission_model_1.Submission({
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
        let evaluatedIncorrect = null;
        for (let i = 0; i < 15; i++) {
            await new Promise((r) => setTimeout(r, 1000));
            evaluatedIncorrect = await submission_model_1.Submission.findById(submissionIncorrect._id);
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
    }
    catch (error) {
        console.error('\nE2E Test Execution Error:', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
}
runE2ETests();
