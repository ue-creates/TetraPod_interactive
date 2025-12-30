const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// 設定の初期値
let config = {
  reactionColor: '#00ff00',
  shakeSensitivity: 80,
  displayDuration: 1000
};

io.on('connection', (socket) => {
  // 接続時に現在の設定を送る
  socket.emit('configUpdate', config);

  // リアクションを受信 -> 画面1, 2へ転送
  socket.on('reaction', (data) => {
    // data = { id: 1~4 }
    io.emit('reactionTrigger', data);
  });

  // シェイクを受信 -> 画面3へ転送
  socket.on('shake', (data) => {
    // data = { intensity: number }
    io.emit('shakeTrigger', data);
  });

  // 設定変更を受信 -> 全員へ共有
  socket.on('updateConfig', (newConfig) => {
    config = { ...config, ...newConfig };
    io.emit('configUpdate', config);
  });
});

// 環境変数 PORT があればそれを使い、なければ 3000 を使う
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`TetraPod server running on port ${port}`);
});