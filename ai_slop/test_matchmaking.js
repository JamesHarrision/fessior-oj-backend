/**
 * Script mô phỏng 2 người chơi kết nối Socket.io và tìm trận Solo 1vs1
 * Cách chạy: 
 * 1. Mở terminal tại thư mục ai_slop
 * 2. Chạy: npm install socket.io-client
 * 3. Chạy: node test_matchmaking.js
 */

const { io } = require("socket.io-client");

// Thay thế JWT Token của 2 user thật lấy được từ API đăng ký/đăng nhập
const PLAYER_1_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZjM3ZTc3Ni0wMDg3LTRiMzktYWU3Ni1mOTIxMjk5MmZkMzUiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3OTgwMjYyMCwiZXhwIjoxNzc5ODAzNTIwfQ.FQnuNfQoAGyrlNo-mIdNtKl4rRlAlWpK6ZRALCJWlF4";

const PLAYER_2_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDMyNjM2NC05MmVmLTQ4OTUtODFhYi0wNjdlNTQ5NGEzMGYiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3OTgwMjYzOCwiZXhwIjoxNzc5ODAzNTM4fQ.qo2RrKQ6_nVxtPhQb3el7UnXE_rGVLxvsGWV2itqC8A";

const SOCKET_URL = "http://localhost:6868";

function connectPlayer(name, token) {
  console.log(`[${name}] Đang kết nối đến socket...`);
  const socket = io(SOCKET_URL, {
    auth: { token: token }
  });

  socket.on("connect", () => {
    console.log(`[${name}] Đã kết nối thành công! Socket ID: ${socket.id}`);

    // Gửi yêu cầu tham gia hàng chờ tìm trận
    console.log(`[${name}] Đang yêu cầu tìm trận (join-queue)...`);
    socket.emit("join-queue");
  });

  socket.on("queue-status", (data) => {
    console.log(`[${name}] Trạng thái hàng chờ:`, data);
  });

  socket.on("match-found", (data) => {
    console.log(`\n🎉 [${name}] ĐÃ TÌM THẤY TRẬN ĐẤU!`);
    console.log(`   - Match ID: ${data.matchId}`);
    console.log(`   - Đối thủ: ${data.player1.username} vs ${data.player2.username}`);
    console.log(`   - Bài toán: ${data.problem.title} (${data.problem.difficulty})`);
    console.log(`   - Thử thách bắt đầu! Nộp code giải bài qua HTTP POST /api/v1/submissions`);
  });

  socket.on("rival-submission", (data) => {
    console.log(`⚡ [${name}] Thông báo: Đối thủ vừa nộp bài! Trạng thái: ${data.status} (Số testcase đúng: ${data.testCasesPassed}/${data.testCasesTotal})`);
  });

  socket.on("match-ended", (data) => {
    console.log(`\n🏆 [${name}] TRẬN ĐẤU KẾT THÚC!`);
    console.log(`   - Người thắng cuộc: ${data.winnerId}`);
    console.log(`   - Cập nhật ELO:`, data.eloUpdates);

    // Ngắt kết nối sau khi hoàn thành
    socket.disconnect();
  });

  socket.on("error", (error) => {
    console.error(`❌ [${name}] Lỗi:`, error);
  });

  socket.on("connect_error", (err) => {
    console.error(`❌ [${name}] Lỗi kết nối: ${err.message}`);
  });

  return socket;
}

// Chạy mô phỏng tìm trận
if (PLAYER_1_TOKEN === "ĐIỀN_TOKEN_PLAYER_1_VÀO_ĐÂY" || PLAYER_2_TOKEN === "ĐIỀN_TOKEN_PLAYER_2_VÀO_ĐÂY") {
  console.log("⚠️ Vui lòng đăng ký/đăng nhập 2 tài khoản qua HTTP API, lấy Access Token và điền vào script này để bắt đầu chạy kiểm thử realtime.");
} else {
  const socket1 = connectPlayer("Player 1", PLAYER_1_TOKEN);
  const socket2 = connectPlayer("Player 2", PLAYER_2_TOKEN);
}
