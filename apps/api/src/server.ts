import { createServer } from "node:http";

import { env } from "./config/env.js";
import app from './app.js'

import { systemQueue } from "./queues/system.queue.js";

const server = createServer(app);

server.listen(env.API_PORT, () => {
  console.log("API SERVER IS RUNNING ON PORT: ", env.API_PORT);
})

// ==========================================
// CƠ CHẾ GRACEFUL SHUTDOWN
// ==========================================
let isShuttingDown = false;
type ShutdownSignal = "SIGINT" | "SIGTERM";

async function handleGracefulShutdown(signal: ShutdownSignal) {
  if (isShuttingDown) return; // Tránh xử lý trùng lặp nếu nhận nhiều tín hiệu liên tiếp
  isShuttingDown = true;

  console.log(`\n🛑 Nhận tín hiệu ${signal}. Bắt đầu quá trình Graceful Shutdown...`);

  // Ngừng nhận request mới 
  // Hoàn tất request đang chạy 
  // Đóng HTTP server
  // Hàm server.close() sẽ dừng nhận connection mới ngay lập tức, 
  // nhưng vẫn CHỜ các request đang xử lý dở dang (active connections) hoàn thành xong.

  server.close(async (err) => {
    if (err) {
      console.error('❌ Lỗi khi đóng HTTP server:', err);
      process.exit(1);
    }
    console.log('🔹 HTTP server: Đã đóng (Ngừng nhận request mới, hoàn tất request cũ).');

    try {
      // Sau này đóng Prisma và Redis
      // console.log('🔹 Bắt đầu ngắt kết nối các dịch vụ nền...');
      // await prisma.$disconnect();
      // await redis.quit();
      // console.log('🔹 Đã đóng toàn bộ kết nối database và bộ nhớ đệm.');
      await systemQueue.close();

      // Process kết thúc
      console.log('🏁 Graceful shutdown hoàn tất ổn thỏa. Tạm biệt! 👋');
      process.exit(0);
    } catch (error) {
      console.error('❌ Lỗi trong quá trình đóng kết nối nền:', error);
      process.exit(1);
    }
  });

  // Kế hoạch B (Force Close): Nếu sau 15 giây mà server vẫn chưa đóng được (do request bị kẹt),
  // bắt buộc phải cưỡng chế tắt process để không làm treo hệ thống deployment.
  setTimeout(() => {
    console.error('⚠️ Quá thời gian chờ (Timeout)! Cưỡng chế dừng process.');
    process.exit(1);
  }, 15000); // 15 giây timeout
}

// SIGINT là gì? - Khi bro nhấn: Ctrl + C - terminal gửi SIGINT tới Node process.
process.on('SIGINT', () => {
  // console.log('>>> ĐÃ NHẬN SIGINT');
  handleGracefulShutdown('SIGINT')
});

// SIGTERM là gì? - Docker hoặc cloud platform thường gửi SIGTERM khi muốn container/process dừng.
process.on('SIGTERM', () => {
  console.log('>>> ĐÃ NHẬN SIGTERM');
  handleGracefulShutdown('SIGTERM')
});
