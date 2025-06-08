import express from "express";
import http from "http";
import cors from "cors";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js"; // Supabase 클라이언트 import

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL || 'https://aryfymqeyenwvfywinao.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeWZ5bXFleWVud3ZmeXdpbmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTQwNzUsImV4cCI6MjA2NDc3MDA3NX0.YOMv7Y2P3UoZwH9Glt7BGu9Uqqs8oYJe4qBtPz2DGZw';
const supabase = createClient(supabaseUrl, supabaseKey); //Supabase와 실제 연결이 이루어지는 부분

const app = express();
const server = http.createServer(app); //Express.js로 웹서버 만듦
const wss = new WebSocket.Server({ server }); // WebSocket 서버 생성

// 서버가 요청을 제대로 처리하기 위한 중간 설정들
app.use(cors()); //CORS 정책 적용
app.use(express.json()); // JSON 형식의 요청 본문을 서버가 이해할 수 있도록 설정

// 서버가 잘 살아있는지 확인하기 위한 테스트 경로
// 웹 브라우저에서 서버 주소로 접속했을때 이 메시지가 보이면 서버가 정상 동작 중인 것
app.get("/", (req, res) => {
  res.send("NerdyCatcher WebSocket Server is running!");
});

// 실시간 통신 메인 로직
// ESP32나 Flutter 앱 같은 클라이언트가 서버에 접속할 때마다 이 안의 코드가 실행됨
wss.on("connection", (ws) => {
  console.log("🟢 WebSocket 클라이언트 연결됨");

  // ESP32에서 JSON 형식의 데이터를 받으면 실행
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString()); // 받은 문자열 데이터를 JSON으로 파싱
      console.log("📡 ESP32에서 받은 데이터:", data);

      // 받은 데이터를 DB에 저장하는 로직
      const { error } = await supabase.from("sensor_data").insert({
        temperature: data.temperature,
        humidity: data.humidity,
        light_level: data.light_level,
        plant_id: data.plant_id // 어떤 식물(화분)의 데이터인지
      });

      if (error) {
        console.error("❌ Supabase 저장 실패:", error);
      } else {
        console.log("✅ Supabase 저장 성공");
        // Flutter 앱 등 모든 클라이언트에게 새 데이터를 실시간으로 전송
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (err) {
      console.error("❗ JSON 파싱 에러:", err);
    }
  });

  // 연결 해제 시 로그 출력
  ws.on("close", () => {
    console.log("🔌 클라이언트와 연결 해제됐습니다.");
  });
});

// 필요한 모든 설정과 규칙을 기반으로 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 서버가 다음 포트에서 실행중입니다 : ${PORT}`);
});