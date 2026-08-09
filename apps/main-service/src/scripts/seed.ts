import '../config/env';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { Problem } from '../models/problem.model';
import { Testcase } from '../models/testcase.model';
import { hashPassword } from '../utils/password.util';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to MongoDB...');
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin';
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected.');

  console.log('Cleaning up existing data...');
  // Clear MySQL tables in order of dependency
  await prisma.report.deleteMany({});
  await prisma.commentLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.friendship.deleteMany({});
  await prisma.contestProblem.deleteMany({});
  await prisma.contestRegistration.deleteMany({});
  await prisma.contest.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.shopItem.deleteMany({});
  await prisma.problemIndexTag.deleteMany({});
  await prisma.problemIndex.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.user.deleteMany({});

  // Clear MongoDB collections
  await Problem.deleteMany({});
  await Testcase.deleteMany({});
  console.log('Clean up done.');

  // 1. Seed Users
  console.log('Seeding users...');
  const defaultPassword = await hashPassword('password123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password_hash: defaultPassword,
      role: 'ADMIN',
      elo_rating: 1500,
    },
  });

  const tester = await prisma.user.create({
    data: {
      email: 'tester@example.com',
      username: 'tester',
      password_hash: defaultPassword,
      role: 'USER',
      elo_rating: 1200,
    },
  });

  const luffy = await prisma.user.create({
    data: {
      email: 'luffy@example.com',
      username: 'luffy',
      password_hash: defaultPassword,
      role: 'USER',
      elo_rating: 1600,
    },
  });

  const naruto = await prisma.user.create({
    data: {
      email: 'naruto@example.com',
      username: 'naruto',
      password_hash: defaultPassword,
      role: 'USER',
      elo_rating: 1450,
    },
  });

  const sasuke = await prisma.user.create({
    data: {
      email: 'sasuke@example.com',
      username: 'sasuke',
      password_hash: defaultPassword,
      role: 'USER',
      elo_rating: 1400,
    },
  });

  // 2. Seed Friendships (Social)
  console.log('Seeding friendships...');
  await prisma.friendship.createMany({
    data: [
      { sender_id: tester.id, receiver_id: luffy.id, status: 'ACCEPTED' },
      { sender_id: tester.id, receiver_id: naruto.id, status: 'ACCEPTED' },
      { sender_id: sasuke.id, receiver_id: tester.id, status: 'PENDING' },
    ],
  });

  // 3. Seed Shop Items
  console.log('Seeding shop items...');
  const itemPurple = await prisma.shopItem.create({
    data: {
      name: 'Khung Neon Tím Siêu Cấp',
      description: 'Khung trang trí avatar với hiệu ứng viền LED Neon tím rực rỡ.',
      price: 250,
      item_type: 'AVATAR_FRAME',
      asset_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
    },
  });

  const itemCyber = await prisma.shopItem.create({
    data: {
      name: 'Giao Diện Cyberpunk Dark Mode',
      description: 'Chủ đề nền tối huyền ảo mang phong cách tương lai Cyberpunk.',
      price: 500,
      item_type: 'THEME',
      asset_url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=150',
    },
  });

  // Equiping item for tester
  await prisma.inventoryItem.create({
    data: {
      user_id: tester.id,
      item_id: itemPurple.id,
      is_equipped: true,
    },
  });

  // 4. Seed Tags
  console.log('Seeding tags...');
  const tagDP = await prisma.tag.create({
    data: { name: 'Quy Hoạch Động', slug: 'dynamic-programming', color: '#ef4444' },
  });
  const tagGreedy = await prisma.tag.create({
    data: { name: 'Tham Lam', slug: 'greedy', color: '#f59e0b' },
  });
  const tagMath = await prisma.tag.create({
    data: { name: 'Toán Học', slug: 'math', color: '#10b981' },
  });

  // 5. Helper function to seed problem & testcases
  const seedProblem = async (problemData: any, testcasesData: any[], tagsList: any[]) => {
    console.log(`Creating problem: ${problemData.title} in MongoDB...`);
    const p = new Problem(problemData);
    await p.save();

    // Sync problem_index (MySQL)
    const probIdx = await prisma.problemIndex.create({
      data: {
        mongo_problem_id: p._id.toString(),
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
      },
    });

    // Link Tags
    for (const t of tagsList) {
      await prisma.problemIndexTag.create({
        data: {
          mongo_problem_id: probIdx.mongo_problem_id,
          tag_id: t.id,
        },
      });
    }

    // Seed Testcases (MongoDB)
    const tcs = testcasesData.map(tc => ({ ...tc, problemId: p._id }));
    await Testcase.insertMany(tcs);

    return probIdx;
  };

  // Two Sum (Math)
  const probTwoSum = await seedProblem(
    {
      title: 'Two Sum',
      slug: 'two-sum',
      description: '<p>Cho một mảng số nguyên <code>nums</code> và một số nguyên <code>target</code>, hãy trả về chỉ số của hai số sao cho tổng của chúng bằng <code>target</code>.</p>',
      difficulty: 'EASY',
      timeLimit: 2000,
      memoryLimit: 256,
      starterCodes: {
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {0, 1};\n    }\n};`,
        java: `import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{0, 1};\n    }\n}`,
        python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        return [0, 1]`,
      }
    },
    [
      { isExample: true, input: '4\n2 7 11 15\n9', output: '0 1' },
      { isExample: true, input: '3\n3 2 4\n6', output: '1 2' },
      { isExample: false, input: '2\n3 3\n6', output: '0 1' }
    ],
    [tagMath]
  );

  // Fibonacci (DP)
  const probFib = await seedProblem(
    {
      title: 'Fibonacci Number',
      slug: 'fibonacci',
      description: '<p>Tính số Fibonacci thứ <code>n</code>. Chuỗi Fibonacci bắt đầu với <code>F(0) = 0</code>, <code>F(1) = 1</code>, và <code>F(n) = F(n-1) + F(n-2)</code>.</p>',
      difficulty: 'EASY',
      timeLimit: 2000,
      memoryLimit: 256,
      starterCodes: {
        cpp: `class Solution {\npublic:\n    int fib(int n) {\n        return 0;\n    }\n};`,
        java: `class Solution {\n    public int fib(int n) {\n        return 0;\n    }\n}`,
        python: `class Solution:\n    def fib(self, n: int) -> int:\n        return 0`,
      }
    },
    [
      { isExample: true, input: '2', output: '1' },
      { isExample: true, input: '4', output: '3' },
      { isExample: false, input: '10', output: '55' }
    ],
    [tagDP]
  );

  // 6. Seed Contests
  console.log('Seeding contests...');
  const now = new Date();
  const weekStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); 
  const weekEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); 

  const activeContest = await prisma.contest.create({
    data: {
      title: 'Weekly Code Arena #1 (Đang diễn ra)',
      description: 'Giải đấu hàng tuần thử thách kỹ năng tối ưu thuật toán.',
      start_time: weekStart,
      end_time: weekEnd,
    },
  });

  // Link problem to contest
  await prisma.contestProblem.create({
    data: {
      contest_id: activeContest.id,
      mongo_problem_id: probTwoSum.mongo_problem_id,
      points: 100,
      order: 1,
    },
  });

  // Registrations
  await prisma.contestRegistration.createMany({
    data: [
      { contest_id: activeContest.id, user_id: tester.id },
      { contest_id: activeContest.id, user_id: luffy.id },
      { contest_id: activeContest.id, user_id: naruto.id },
    ],
  });

  // 7. Seed Comments (Discussions)
  console.log('Seeding comments...');
  const rootComment = await prisma.comment.create({
    data: {
      target_id: probTwoSum.mongo_problem_id,
      target_type: 'PROBLEM',
      user_id: luffy.id,
      content: 'Bài này có thể tối ưu bằng cách dùng HashMap để tìm target - nums[i] trong O(N) thôi các bạn nhé!',
    },
  });

  await prisma.comment.create({
    data: {
      target_id: probTwoSum.mongo_problem_id,
      target_type: 'PROBLEM',
      user_id: tester.id,
      content: 'Cảm ơn luffy nhé, cách dùng hash map chạy cực nhanh!',
      parent_id: rootComment.id,
    },
  });

  // 8. Seed Reports
  console.log('Seeding reports...');
  await prisma.report.createMany({
    data: [
      {
        user_id: tester.id,
        problem_id: probTwoSum.mongo_problem_id,
        type: 'TYPO',
        content: 'Đề bài Two Sum phần giải thích ví dụ bị sai chính tả chữ "Kết quả" viết thành "Kêt quả".',
        status: 'PENDING',
      },
      {
        user_id: naruto.id,
        type: 'BUG',
        content: 'Trình chấm của hệ thống đôi lúc trả về lỗi ETIMEDOUT khi kết nối tới Queue Worker.',
        status: 'RESOLVED',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
