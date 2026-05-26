/**
 * Script kiểm tra nhanh dữ liệu MongoDB để debug
 * Cách chạy: node check_db.js
 */
const mongoose = require('mongoose');

const mongoUri = 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin';

const ProblemSchema = new mongoose.Schema({}, { strict: false });
const TestcaseSchema = new mongoose.Schema({}, { strict: false });
const SubmissionSchema = new mongoose.Schema({}, { strict: false });

const Problem = mongoose.model('Problem', ProblemSchema, 'problems');
const Testcase = mongoose.model('Testcase', TestcaseSchema, 'testcases');
const Submission = mongoose.model('Submission', SubmissionSchema, 'submissions');

async function check() {
  await mongoose.connect(mongoUri);
  console.log('--- KẾT QUẢ KIỂM TRA MONGODB ---');

  const problems = await Problem.find({});
  console.log(`\n1. Số lượng Problems: ${problems.length}`);
  problems.forEach(p => {
    console.log(`   - ID: ${p._id} | Slug: ${p.slug} | Title: ${p.title}`);
  });

  const testcases = await Testcase.find({});
  console.log(`\n2. Số lượng Testcases: ${testcases.length}`);
  testcases.forEach(t => {
    console.log(`   - ID: ${t._id} | ProblemId: ${t.problemId} | isExample: ${t.isExample}`);
  });

  const submissions = await Submission.find({});
  console.log(`\n3. Số lượng Submissions: ${submissions.length}`);
  submissions.forEach(s => {
    console.log(`   - ID: ${s._id} | ProblemId: ${s.problemId} | Status: ${s.status} | Err: ${s.errorMessage || 'none'}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
