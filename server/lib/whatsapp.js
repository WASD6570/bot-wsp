import { create, Whatsapp } from "venom-bot";
import * as fs from "fs";

const TOKEN_DIR = "./tokens";
const TOKEN_PATH = TOKEN_DIR + "/session-wa.json";
let browserSessionToken = null;

if (fs.existsSync(TOKEN_PATH)) {
  browserSessionToken = JSON.parse(fs.readFileSync(TOKEN_PATH));
}

// function start(client) {
//   client.onMessage(async (message) => {
//     if (message.body === "enviar" && message.isGroupMsg === false) {
//       try {
//         const result = await client.sendFile(
//           message.from,
//           path,
//           "test",
//           "test de envio"
//         );
//         console.log({ result });
//       } catch (error) {
//         console.log({ error }, "error when sending");
//       }
//     }
//   });
// }

export async function login() {
  try {
    const client = await create({
      session: "session-wa",
      folderNameToken: "tokens", //folder name when saving tokens
      createPathFileToken: true,
      headless: true,
      browserSessionToken: browserSessionToken,
    });

    const result = client.getSessionTokenBrowser();
    await fs.promises.mkdir(TOKEN_DIR, { recursive: true });
    fs.writeFile(TOKEN_PATH, JSON.stringify(result), (err) => {
      if (err) console.log(err, "error en el write");
    });
    return client;
  } catch (error) {
    console.log(error, "error en el login");
  }
}
