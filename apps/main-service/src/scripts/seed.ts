import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL in process.env:', process.env.DATABASE_URL);
  console.log('Seeding initial system data...');

  // 1. Seed Contests
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
      where: { id: c.title }, // This is a mock matching key to upsert safely
      create: c,
      update: c,
    }).catch(async () => {
      // If title isn't a unique key, just create directly
      await prisma.contest.create({ data: c });
    });
  }

  // 2. Seed Shop Items
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

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
