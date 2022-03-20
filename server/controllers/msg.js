import * as https from "https";
import * as fs from "fs";
export class FileSender {
  client;
  number;
  message;
  id;
  arrOfUrls;
  hasFiles;
  resultOfSend = [];
  filePaths = [];

  constructor(client, { number, message, id, arrOfUrls, hasFiles }) {
    this.client = client;
    this.number = number;
    this.message = message;
    this.id = id;
    this.arrOfUrls = arrOfUrls;
    this.hasFiles = hasFiles;
  }

  getResults() {
    return this.resultOfSend;
  }

  async fileSender(filePath) {
    try {
      const result = await this.client.sendFile(
        this.number + "@c.us",
        filePath,
        "lag"
      );
      return result;
    } catch (error) {
      console.error(error, "error en el fileSender");
    }
  }

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

  send() {
    const r = new Promise(async (resolve, reject) => {
      const globalResults = {
        files: [],
        messages: [],
      };
      const res = await this.textSender();
      if (this.hasFiles) {
        const sendFileResult = await this.downloadFiles();
        globalResults.files.push(sendFileResult);
      }
      globalResults.messages.push(res);
      resolve(globalResults);
    });
    return r;
  }

  downloadFiles() {
    const dir = `./server/pdfs/${this.id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    const datos = new Promise((resolve, reject) => {
      const resultArray = [];
      this.arrOfUrls.map((url, index, arr) => {
        const file = fs.createWriteStream(`${dir}/${index}.pdf`);
        https.get(url, (res) => {
          res.pipe(file);
          file.on("error", (err) => {
            console.log(err);
            reject(err);
          });

          file.on("finish", async () => {
            const { pathname } = new URL(
              `../pdfs/${this.id}/${index}.pdf`,
              import.meta.url
            );
            const a = await this.fileSender(pathname);
            resultArray.push(a);
            if (resultArray.length == index + 1) resolve(resultArray);
          });
        });
      });
    });
    return datos;
  }
}
