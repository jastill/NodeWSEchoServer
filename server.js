// https://github.com/websockets/ws
const WebSocket = require('ws');

function heartbeat() {
  this.isAlive = true;
  console.log('pong');
}

// Start a local websocket server
const wss = new WebSocket.Server({ port: 8080 });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Setup the socket once connected
wss.on('connection', function connection(ws) {
  
  ws.on('error', console.error);
  ws.on('pong', heartbeat);

  ws.on('message', function message(data, isBinary) {
    console.log(data)
    wss.clients.forEach(function each(client) {

      // Dont' echo to the sender.
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});