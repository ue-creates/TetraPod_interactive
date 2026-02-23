const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORSの設定を追加（TouchDesignerからの接続を弾かないようにするため）
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public', {
  extensions: ['html'] 
}));

// 設定の初期値
let config = {
  reactionColor: '#00ff00',
  shakeSensitivity: 80,
  displayDuration: 2000,
  djNameText: 'DJ TETRAPOD',
  displayRatio: 1.0
};

io.on('connection', (socket) => {
  console.log('クライアントが接続しました:', socket.id);
  
  // 接続時に現在の設定を送る
  socket.emit('configUpdate', config);

  // リアクションを受信 -> TouchDesignerを含む全クライアントへ転送
  socket.on('reaction', (data) => {
    io.emit('reactionTrigger', data);
  });

  // シェイクを受信 -> TouchDesignerを含む全クライアントへ転送
  socket.on('shake', (data) => {
    io.emit('shake', data); 
  });

  // 設定変更を受信 -> 全員へ共有
  socket.on('updateConfig', (newConfig) => {
    config = { ...config, ...newConfig };
    io.emit('configUpdate', config);
  });

  socket.on('disconnect', () => {
    console.log('クライアントが切断しました:', socket.id);
  });
});

// 環境変数 PORT があればそれを使い、なければ 10000 を使う（NeoShowcaseのNetwork Portに合わせる）
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`TetraPod server running on port ${port}`);
});