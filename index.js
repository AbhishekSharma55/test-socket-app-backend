const WebSocket = require('ws');
const tempData = require('./data.js');
const zlib = require('zlib');
const dotenv = require('dotenv');

dotenv.config();
const URL = process.env.URL || 'ws://localhost:8080';
console.log(URL);
// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log(`WebSocket server is running on ${URL}`);
});

// Handle WebSocket server events
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Handle messages received from the client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    
    // Check if the message is "send data"
    if (message.toString() === 'SENDDATATOFRONTEND') {
      // Compress and send the JSON data to the client
      const jsonString = JSON.stringify({
        type: 'data',
        payload: tempData
      });
      
      zlib.gzip(jsonString, (err, compressed) => {
        if (!err) {
          ws.send(compressed, { binary: true });
        } else {
          console.error('Compression error:', err);
          // Fallback to uncompressed data if compression fails
          ws.send(jsonString);
        }
      });
    } else {
      // Echo other messages back to the client
      ws.send(`Server received: ${message}`);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });

  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');
});

// Graceful shutdown of the WebSocket server
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});
