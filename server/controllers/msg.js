import * as https from "https";
import * as fs from "fs";

/**
 * FileSender, esta clase hace el envio de arhivos y mensajes
 * se instacia con una instacia, valga la redundancia, del cliente
 * de whatsapp y con un objeto con los datos para hacer el envio
 * de archivos y mensajes, es obligatorio proveer todos los datos.
 * number: numero de telefono
 * client: instancia deñ cliente de whatsapp
 * message: mensaje a enviar
 * id: identificador
 * hasFiles: boolean, indica si hay archivos a enviar
 * arrOfUrls: array con las urls de descarga del archivo a enviar
 */
class FileSender {
  client;
  number;
  message;
  id;
  arrOfUrls;
  hasFiles;
  filePaths = [];

  constructor(client, { number, message, id, arrOfUrls, hasFiles }) {
    this.client = client;
    this.number = number;
    this.message = message;
    this.id = id;
    this.arrOfUrls = arrOfUrls;
    this.hasFiles = hasFiles;
  }

  /**
   * metodo que envia un archivo, se debe proveer
   * la ruta absoluta al archivo
   */

  async fileSender(filePath) {
    try {
      const result = await this.client.sendFile(
        this.number + "@c.us",
        filePath,
        "archivo"
      );
      return result;
    } catch (error) {
      console.error(error, "error en el fileSender");
    }
  }

  // envia el contenido del mensaje con el cual fue instaciado el sender

  async textSender() {
    try {
      const result = await this.client.sendText(
        this.number + "@c.us",
        this.message
      );
      return result;
    } catch (error) {
      console.error(error, "error en el textSender");
    }
  }

  // este metodo es el que debe ejecutarse para enviar
  // archivos/mesajes, retorna un objeto con el resultado
  // del envio de archivos y mensajes por separado

  async send() {
    if (this.hasFiles) {
      const globalResults = {
        files: [],
        messages: [],
      };
      const res = await this.textSender();
      const sendFileResult = await this.downloadFiles();
      globalResults.files.push(sendFileResult);
      globalResults.messages.push(res);
      return globalResults;
    }
    if (!this.hasFiles) {
      const globalResults = {
        files: [],
        messages: [],
      };
      const res = await this.textSender();
      globalResults.messages.push(res);
      return globalResults;
    }
  }

  /**
   * Metodo para descar archivos, este metodo es algo complejo,
   * devuelve un array con promesas por cada archivo a descargar
   */

  async downloadFiles() {
    //crea el directorio de descarga en base al id
    const dir = `./server/pdfs/${this.id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    // mapea el array de urls con el que se construyo la instacia del sender
    // y crea un write stream por aca archivo.
    const resultOfFileSend = this.arrOfUrls.map(async (url, index, arr) => {
      const file = fs.createWriteStream(`${dir}/${index}.pdf`);
      // por cada archivo se genera una nueva promesa
      const data = new Promise((resolve, reject) => {
        https.get(url, (res) => {
          res.pipe(file);
          file.on("error", (err) => {
            console.log(err);
            reject(err);
          });
          //cuando termina la descarga se llama al
          //fileSender para que envie el archivo
          file.on("finish", async () => {
            //se obtiene la ruta absoluta del archivo
            const { pathname } = new URL(
              `../pdfs/${this.id}/${index}.pdf`,
              import.meta.url
            );
            if (process.env.OS.includes("Windows")) {
              const windowsPath = pathname.substring(1);
              const result = await this.fileSender(windowsPath);
              resolve(result);
            } else {
              const result = await this.fileSender(pathname);
              resolve(result);
            }
          });
        });
      });
      return data;
    });
    const data = Promise.all(resultOfFileSend);

    return data;
  }
}

// esto es lo que expone el modulo, es una funcion
// que recibe una instacia del cliente de whatsapp y
// un array de objetos con las propiedades necesarias
// para instaciar al FileSender, mapea el array de objetos
// y genera una instacia de FileSender por cada uno.
// Devuelve un array de promesas, que contienen el resultado
// de cada una de las operaciones

export async function fileSender(client, data) {
  const arrayDePromises = data.map(async (clientNumber) => {
    if (
      clientNumber.id == undefined ||
      clientNumber.number == undefined ||
      clientNumber.message == undefined ||
      clientNumber.hasFiles == undefined
    ) {
      return new Promise((resolve) => {
        resolve({ error: "object is missing required properties" });
      });
    }
    const sender = new FileSender(client, clientNumber);
    const datos = await sender.send();
    return datos;
  });

  const readyData = Promise.all(arrayDePromises);
  return readyData;
}
