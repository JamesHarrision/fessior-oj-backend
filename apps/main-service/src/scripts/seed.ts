import dotenv from 'dotenv';
dotenv.config();
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
  await prisma.roadmapSessionProblem.deleteMany({});
  await prisma.roadmapSession.deleteMany({});
  await prisma.roadmapPhase.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.notification.deleteMany({});
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

  const itemTitle = await prisma.shopItem.create({
    data: {
      name: 'Danh Hiệu: Coder Mất Ngủ',
      description: 'Danh hiệu dành cho những chiến thần cày code xuyên đêm.',
      price: 150,
      item_type: 'TITLE',
      asset_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150',
    },
  });

  const itemBadge = await prisma.shopItem.create({
    data: {
      name: 'Huy Hiệu Rồng Lửa',
      description: 'Huy hiệu rực lửa, thể hiện sức mạnh của người chiến thắng.',
      price: 300,
      item_type: 'BADGE',
      asset_url: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=150',
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
  const tagDP = await prisma.tag.create({ data: { name: 'Quy Hoạch Động', slug: 'dynamic-programming', color: '#ef4444' } });
  const tagGreedy = await prisma.tag.create({ data: { name: 'Tham Lam', slug: 'greedy', color: '#f59e0b' } });
  const tagMath = await prisma.tag.create({ data: { name: 'Toán Học', slug: 'math', color: '#10b981' } });
  const tagString = await prisma.tag.create({ data: { name: 'Chuỗi', slug: 'string', color: '#3b82f6' } });
  const tagGraph = await prisma.tag.create({ data: { name: 'Đồ Thị', slug: 'graph', color: '#8b5cf6' } });
  const tagArray = await prisma.tag.create({ data: { name: 'Mảng', slug: 'array', color: '#ec4899' } });
  const tagBacktracking = await prisma.tag.create({ data: { name: 'Quay Lui', slug: 'backtracking', color: '#6366f1' } });

  // 5. Helper function to seed problem & testcases
  const seedProblem = async (problemData: any, testcasesData: any[], tagsList: any[]) => {
    console.log(`Creating problem: ${problemData.title} in MongoDB...`);
    const p = new Problem(problemData);
    await p.save();

    const probIdx = await prisma.problemIndex.create({
      data: {
        mongo_problem_id: p._id.toString(),
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
      },
    });

    for (const t of tagsList) {
      await prisma.problemIndexTag.create({
        data: { mongo_problem_id: probIdx.mongo_problem_id, tag_id: t.id },
      });
    }

    const tcs = testcasesData.map(tc => ({ ...tc, problemId: p._id }));
    await Testcase.insertMany(tcs);
    return probIdx;
  };

  // Two Sum (Array, Math)
  const probTwoSum = await seedProblem(
    {
      title: 'Two Sum',
      slug: 'two-sum',
      description: '<p>Cho một mảng số nguyên <code>nums</code> và một số nguyên <code>target</code>, hãy trả về chỉ số của hai số sao cho tổng của chúng bằng <code>target</code>.</p>',
      difficulty: 'EASY',
      timeLimit: 2000, memoryLimit: 256,
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
    [tagMath, tagArray]
  );

  // Fibonacci (DP)
  const probFib = await seedProblem(
    {
      title: 'Fibonacci Number',
      slug: 'fibonacci',
      description: '<p>Tính số Fibonacci thứ <code>n</code>. Chuỗi Fibonacci bắt đầu với <code>F(0) = 0</code>, <code>F(1) = 1</code>, và <code>F(n) = F(n-1) + F(n-2)</code>.</p>',
      difficulty: 'EASY',
      timeLimit: 2000, memoryLimit: 256,
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

  // Valid Parentheses (String)
  const probValidParentheses = await seedProblem(
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: '<p>Cho một chuỗi chỉ chứa các ký tự <code>(</code>, <code>)</code>, <code>{</code>, <code>}</code>, <code>[</code>, <code>]</code>. Xác định xem chuỗi đó có hợp lệ hay không.</p>',
      difficulty: 'EASY',
      timeLimit: 1000, memoryLimit: 256,
      starterCodes: {
        cpp: `#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};`,
        java: `class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`,
        python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        return False`,
      }
    },
    [
      { isExample: true, input: '()', output: 'true' },
      { isExample: true, input: '()[]{}', output: 'true' },
      { isExample: false, input: '(]', output: 'false' }
    ],
    [tagString]
  );

  // Number of Islands (Graph)
  const probIslands = await seedProblem(
    {
      title: 'Number of Islands',
      slug: 'number-of-islands',
      description: '<p>Cho một lưới 2D gồm các <code>1</code> (đất) và <code>0</code> (nước), hãy đếm số lượng hòn đảo. Một hòn đảo được bao quanh bởi nước và được tạo ra bằng cách kết nối các vùng đất kề nhau theo chiều ngang hoặc dọc.</p>',
      difficulty: 'MEDIUM',
      timeLimit: 2000, memoryLimit: 256,
      starterCodes: {
        cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};`,
        java: `class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}`,
        python: `class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        return 0`,
      }
    },
    [
      { isExample: true, input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1' },
      { isExample: true, input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', output: '3' }
    ],
    [tagGraph, tagArray]
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

  // 9. Seed Roadmaps
  console.log('Seeding roadmaps...');
  await prisma.roadmap.create({
    data: {
      user_id: tester.id,
      title: 'Nhập Môn Thuật Toán Căn Bản',
      description: 'Lộ trình cơ bản được tạo sẵn để ôn tập kiến thức mảng và chuỗi.',
      is_active: true,
      is_shared: true,
      phases: {
        create: [
          {
            title: 'Tuần 1: Cấu trúc mảng',
            description: 'Làm quen với mảng và con trỏ.',
            order: 0,
            sessions: {
              create: [
                {
                  title: 'Ngày 1: Two Sum',
                  description: 'Giải bài Two Sum kinh điển',
                  date: new Date(),
                  is_completed: false,
                  order: 0,
                  problems: {
                    create: [{ mongo_problem_id: probTwoSum.mongo_problem_id }]
                  }
                }
              ]
            }
          }
        ]
      }
    }
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
