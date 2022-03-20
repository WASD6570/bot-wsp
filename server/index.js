import express from "express";
import cors from "cors";
import { login } from "./lib/whatsapp.js";
import { FileSender } from "./controllers/msg.js";
const app = express();
app.use(cors());
app.use(express.json());

const client = await login();

async function wrapperDePromises(data) {
  const arrayDePromises = data.map(async (clientNumber) => {
    const sender = new FileSender(client, clientNumber);
    const datos = await sender.send();
    return datos;
  });
  const ready = await Promise.all(arrayDePromises);
  return ready;
}

app.post("/api/send-files", async (req, res) => {
  try {
    const data = req.body;

    const response = await wrapperDePromises(data);
    res.send(response);
  } catch (error) {
    res.json({ error: error, message: "error en el endpoint /api/send-files" });
  }
});

app.listen(3005, "localhost", () =>
  console.log("running on: http://localhost:" + 3005)
);
