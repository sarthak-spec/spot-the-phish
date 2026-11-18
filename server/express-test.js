
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Express is working!");
});

const server = app.listen(5002, "127.0.0.1", () => {
  console.log("Express test running on http://127.0.0.1:5002");
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

server.on("close", () => {
  console.log("Express HTTP server was closed.");
});
