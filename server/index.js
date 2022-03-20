import "dotenv/config";
import express from "express";
import cors from "cors";
import rimraf from "rimraf";
import { authMiddleware } from "./lib/middlewares.js";
import { fileSender } from "./controllers/msg.js";
import { client } from "./lib/whatsapp.js";
///////
//app & middlewares baisicos
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3005;
///////

// endpoints

/**
 * endpoint para enviar archivos y mesajes junto
 * con el archivo si asi se quiere.
 * Recibe en el body un array de objetos y devuelve
 * el resultado de envio de mensajes y archivos por
 * separado.
 */
app.post("/api/send-files", authMiddleware, (req, res) => {
  try {
    const data = req.body;

    fileSender(client, data)
      .then((response) => {
        res.send(response);
      })
      .finally(() => {
        //borra los archivos despues de enviarlos
        const { pathname } = new URL(`./pdfs/`, import.meta.url);
        rimraf(pathname, (err) => {
          if (err) console.error(err);
        });
      });
  } catch (error) {
    res.json({ error: error, message: "error en el endpoint /api/send-files" });
  }
});

/**
 * endpoint para chequear si el bot esta activo
 */

app.get("/api/session-status", authMiddleware, async (req, res) => {
  try {
    const sessionStatus = await client.isLoggedIn();
    const data = await client.getConnectionState();

    res.send({ socketState: data, sessionStatus });
  } catch (error) {
    console.error(error, "error en el endpint /api/session-status");
    res.status(500).send("error en el endpint /api/session-status");
  }
});

/**
 * bot escuchando en el puerto 3005 o el que
 * se le asigne mediante la variable de ambiente
 */

app.listen(port, "localhost", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("running on: http://localhost:" + port);
  }
});
