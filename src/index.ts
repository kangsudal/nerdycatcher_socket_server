import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || 'https://aryfymqeyenwvfywinao.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeWZ5bXFleWVud3ZmeXdpbmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTQwNzUsImV4cCI6MjA2NDc3MDA3NX0.YOMv7Y2P3UoZwH9Glt7BGu9Uqqs8oYJe4qBtPz2DGZw';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.get("/", (req, res) => {
  res.send("NerdyCatcher Socket.IO Server is running!");
});

io.on("connection", (socket) => {
  console.log("🟢 Socket.IO 클라이언트 연결됨:", socket.id);

  socket.on("sensor-data", async (data) => {
    console.log("📡 ESP32에서 받은 데이터:", data);
    const { error } = await supabase.from("sensor_data").insert({ /* ... */ });
    if (!error) io.emit("new-data", data);
  });

  socket.on("disconnect", () => {
    console.log("🔌 클라이언트와 연결 해제됐습니다:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 서버가 다음 포트에서 실행중입니다 : ${PORT}`);
});