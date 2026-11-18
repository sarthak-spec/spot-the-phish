
import http from "node:http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Node.js HTTP server is working!");
});

server.listen(5001, "127.0.0.1", () => {
  console.log("Test server running on http://127.0.0.1:5001");
});
