import path from "path";
import { randomInt } from "crypto";

import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.get("/api/random", (_: Request, res: Response) => {
  res.json(randomInt(100).toString());
});

app.use(express.static(path.join(__dirname, "../..", "client", "dist")));
app.use((_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../..", "client", "dist", "index.html"));
});

// Start server on port 8080
app.listen(8080, () => {
  console.log("Server started on port 8080");
});
