import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "@supabase/supabase-js"; // Supabase 클라이언트 import

// 2. Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL || 'https://aryfymqeyenwvfywinao.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeWZ5bXFleWVud3ZmeXdpbmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTQwNzUsImV4cCI6MjA2NDc3MDA3NX0.YOMv7Y2P3UoZwH9Glt7BGu9Uqqs8oYJe4qBtPz2DGZw';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("NerdyCatcher Socket Server is running!");
});

io.on("connection", (socket) => {
    console.log("🟢 새 클라이언트와 연결됐습니다.");

  // ESP32에서 'sensor-data' 이벤트를 받으면 실행
    socket.on("sensor-data", async (data) => {
        console.log("📡 ESP32에서 받은 데이터:", data);

        // 받은 데이터를 DB에 저장하는 로직
        const { error } = await supabase.from('sensor_data').insert({
            temperature: data.temperature,
            humidity: data.humidity,
            light_level: data.light_level,
            plant_id: data.plant_id // ESP32에서 plant_id도 함께 보내줘야 합니다.
        });

        if (error) {
            console.error("❌ Supabase 저장 실패:", error);
        } else {
            console.log("✅ Supabase 저장 성공");
            // 4. Flutter 앱 등 모든 클라이언트에게 새 데이터를 실시간으로 전송
            io.emit("new-data", data);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔌 클라이언트와 연결 해제됐습니다.");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 서버가 다음 포트에서 실행중입니다 : ${PORT}`);
});