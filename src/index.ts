import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Flutter 앱에서 접근 가능하게
  },
});

app.use(cors());
app.use(express.json());

// 기본 라우터 확인용
app.get("/", (req, res) => {
  res.send("NerdyCatcher Socket Server is running!");
});

// 소켓 연결 처리
io.on("connection", (socket) => {
  console.log("🟢 새 클라이언트와 연결됐습니다.");

  socket.on("sensor-data", (data) => {
    console.log("📡 ESP32에서 받은 데이터:", data);
    // 나중에 여기서 Supabase에 저장할 수 있음
  });

  socket.on("disconnect", () => {
    console.log("🔌 클라이언트와 연결 해제됐습니다.");
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 서버가 다음 포트에서 실행중입니다 : ${PORT}`);
});
