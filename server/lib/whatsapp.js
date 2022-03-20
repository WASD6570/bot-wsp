import { create, Whatsapp } from "venom-bot";
import * as fs from "fs";
import { sendMail } from "../lib/nodemailer.js";

/**
 * chekea si hay token guardado localmente
 * si no hay token requiere escanear el
 * codigo en la terminal
 */

const TOKEN_DIR = "./tokens";
const TOKEN_PATH = TOKEN_DIR + "/session-wa.json";
let browserSessionToken = null;

if (fs.existsSync(TOKEN_PATH)) {
  browserSessionToken = JSON.parse(fs.readFileSync(TOKEN_PATH));
}

/**
 * simula un navegador e instacia el bot para
 * poder empezar a interactuar con el mismo.
 * el tercer parametro de la funcion create
 * es el listener que manda el mail con la info
 * de la session status
 */
export async function login() {
  try {
    const client = await create(
      "session-wa",
      undefined,
      async (sessionStatus, session) => {
        await sendMail(sessionStatus);
      },
      {
        folderNameToken: "tokens", //folder name when saving tokens
        createPathFileToken: true,
        headless: true,
        browserSessionToken: browserSessionToken,
      }
    );

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
/**
 * instacia del cliente y el navegador emulado lista para usar
 */

const client = await login();

/**
 * metodos utilitarios deñ cliente para obtener cambios en el
 * status del client
 */

client.onStateChange(async (state) => {
  console.log("State changed: ", state);
  await sendMail(state);
  // force whatsapp take over
  if ("CONFLICT".includes(state)) client.useHere();
  // detect disconnect on whatsapp
  if ("UNPAIRED".includes(state)) {
    console.log("logout");
  }
});

let time = 0;
client.onStreamChange(async (state) => {
  console.log("State Connection Stream: " + state);
  await sendMail(state);
  clearTimeout(time);
  if (state === "DISCONNECTED" || state === "SYNCING") {
    time = setTimeout(async () => {
      await sendMail(state);
      client.close();
    }, 80000);
  }
});

/**
 * no se soporta la atencion por llamadas
 */

// function to detect incoming call
client.onIncomingCall(async (call) => {
  console.log(call);
  client.sendText(
    call.peerJid,
    "Disculpe las molestias, no podemos atender llamadas"
  );
});

export { client };
