import express from "express";
import cors from "cors";
import { login } from "./lib/whatsapp.js";
const app = express();
app.use(cors());
app.use(express.json());

login();

app.get("/", async (req, res) => {
  try {
    res.json({ message: "ok" });
  } catch (error) {
    res.json({ message: "error" });
  }
});

app.listen(3005, "localhost", () =>
  console.log("running on: http://localhost:" + 3005)
);
