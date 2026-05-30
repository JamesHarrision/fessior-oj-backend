import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { Problem } from '../models/problem.model';
import { Testcase } from '../models/testcase.model';
import { hashPassword } from '../utils/password.util';

const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL in process.env:', process.env.DATABASE_URL);
  
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin';
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected successfully!');

  console.log('Seeding initial system data...');

  // 0. Seed Users (MySQL)
  console.log('Seeding default users...');
  const testerHash = await hashPassword('password123');
  const adminHash = await hashPassword('admin123');

  await prisma.user.upsert({
    where: { email: 'tester@example.com' },
    update: {},
    create: {
      email: 'tester@example.com',
      username: 'tester',
      password_hash: testerHash,
      role: 'USER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password_hash: adminHash,
      role: 'ADMIN',
    },
  });

  // 1. Seed Contests (MySQL)
  const now = new Date();
  const weekStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const weekEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

  const nextWeekStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  const contests = [
    {
      title: 'Weekly Code Arena #1 (Đang diễn ra)',
      description: 'Giải đấu hàng tuần thử thách kỹ năng tối ưu thuật toán và cấu trúc dữ liệu cơ bản.',
      start_time: weekStart,
      end_time: weekEnd,
    },
    {
      title: 'Weekly Code Arena #2 (Sắp diễn ra)',
      description: 'Cạnh tranh sòng phẳng với các đối thủ hàng đầu về chủ đề Quy Hoạch Động.',
      start_time: nextWeekStart,
      end_time: nextWeekEnd,
    },
  ];

  for (const c of contests) {
    await prisma.contest.upsert({
      where: { id: c.title },
      create: c,
      update: c,
    }).catch(async () => {
      await prisma.contest.create({ data: c }).catch(() => {});
    });
  }

  // 2. Seed Shop Items (MySQL)
  const shopItems = [
    {
      name: 'Khung Neon Tím Siêu Cấp',
      description: 'Khung trang trí avatar với hiệu ứng viền LED Neon tím rực rỡ.',
      price: 250,
      item_type: 'AVATAR_FRAME',
      asset_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
    },
    {
      name: 'Giao Diện Cyberpunk Dark Mode',
      description: 'Chủ đề nền tối huyền ảo mang phong cách tương lai Cyberpunk.',
      price: 500,
      item_type: 'THEME',
      asset_url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=150',
    },
    {
      name: 'Khung Hoàng Kim Đấu Sĩ',
      description: 'Khung mạ vàng dành riêng cho các Coders đạt thứ hạng cao.',
      price: 400,
      item_type: 'AVATAR_FRAME',
      asset_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    },
  ];

  for (const item of shopItems) {
    const existing = await prisma.shopItem.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.shopItem.create({ data: item });
    }
  }

  // Helper function to seed problem & testcases
  const seedProblem = async (problemData: any, testcasesData: any[]) => {
    let p = await Problem.findOne({ slug: problemData.slug });
    if (!p) {
      console.log(`Creating sample ${problemData.title} problem in MongoDB...`);
      p = new Problem(problemData);
      await p.save();
    }

    // Sync problem_index (MySQL)
    await prisma.problemIndex.upsert({
      where: { mongo_problem_id: p._id.toString() },
      create: {
        mongo_problem_id: p._id.toString(),
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
      },
      update: {
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
      }
    });

    // Seed Testcases (MongoDB)
    const existingTcs = await Testcase.find({ problemId: p._id });
    if (existingTcs.length === 0) {
      console.log(`Creating testcases for ${problemData.title} in MongoDB...`);
      const tcs = testcasesData.map(tc => ({ ...tc, problemId: p._id }));
      await Testcase.insertMany(tcs);
    }
  };

  // Two Sum
  await seedProblem(
    {
      title: 'Two Sum',
      slug: 'two-sum',
      description: '<p>Cho một mảng số nguyên <code>nums</code> và một số nguyên <code>target</code>, hãy trả về chỉ số của hai số sao cho tổng của chúng bằng <code>target</code>.</p><p>Ví dụ: <code>nums = [2, 7, 11, 15]</code>, <code>target = 9</code> -> Kết quả: <code>[0, 1]</code></p>',
      difficulty: 'EASY',
      timeLimit: 2000,
      memoryLimit: 256,
      starterCodes: {
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Viết code của bạn ở đây
        return {0, 1};
    }
};`,
        java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Viết code của bạn ở đây
        return new int[]{0, 1};
    }
}`,
        python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Viết code của bạn ở đây
        return [0, 1]`,
      }
    },
    [
      { isExample: true, input: '4\n2 7 11 15\n9', output: '0 1' },
      { isExample: true, input: '3\n3 2 4\n6', output: '1 2' },
      { isExample: false, input: '2\n3 3\n6', output: '0 1' }
    ]
  );

  // Check Prime
  await seedProblem(
    {
      title: 'Check Prime',
      slug: 'check-prime',
      description: '<p>Cho số nguyên dương <code>n</code>, kiểm tra xem <code>n</code> có phải là số nguyên tố hay không. Trả về <code>1</code> nếu đúng, ngược lại trả về <code>0</code>.</p>',
      difficulty: 'EASY',
      timeLimit: 2000,
      memoryLimit: 256,
      starterCodes: {
        cpp: `class Solution {
public:
    int isPrime(int n) {
        // Viết code của bạn ở đây
        return 0;
    }
};`,
        java: `class Solution {
    public int isPrime(int n) {
        // Viết code của bạn ở đây
        return 0;
    }
}`,
        python: `class Solution:
    def isPrime(self, n: int) -> int:
        # Viết code của bạn ở đây
        return 0`,
      }
    },
    [
      { isExample: true, input: '5', output: '1' },
      { isExample: true, input: '4', output: '0' },
      { isExample: false, input: '13', output: '1' }
    ]
  );

  // Fibonacci
  await seedProblem(
    {
      title: 'Fibonacci Number',
      slug: 'fibonacci',
      description: '<p>Tính số Fibonacci thứ <code>n</code>. Chuỗi Fibonacci bắt đầu với <code>F(0) = 0</code>, <code>F(1) = 1</code>, và <code>F(n) = F(n-1) + F(n-2)</code>.</p>',
      difficulty: 'EASY',
      timeLimit: 2000,
      memoryLimit: 256,
      starterCodes: {
        cpp: `class Solution {
public:
    int fib(int n) {
        // Viết code của bạn ở đây
        return 0;
    }
};`,
        java: `class Solution {
    public int fib(int n) {
        // Viết code của bạn ở đây
        return 0;
    }
}`,
        python: `class Solution:
    def fib(self, n: int) -> int:
        # Viết code của bạn ở đây
        return 0`,
      }
    },
    [
      { isExample: true, input: '2', output: '1' },
      { isExample: true, input: '4', output: '3' },
      { isExample: false, input: '10', output: '55' }
    ]
  );

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
