import fs from "fs/promises";
import { simpleParser } from "mailparser";

const emailFolderUri = new URL(
  "../../email/management/Inbox/new/",
  import.meta.url
);

async function findMail() {
  const emailFolderPath = emailFolderUri.pathname;
  //console.log(emailFolderPath);
  const storedEmails = await fs.readdir(emailFolderPath);
  //console.log(storedEmails);
  return storedEmails;
}

export async function readMail(storedEmails) {
  storedEmails = await findMail();
  const emailUri = new URL(storedEmails.pop(), emailFolderUri);
  const emailContent = await fs.readFile(emailUri.pathname, "utf-8");
  //console.log(emailContent);

  const parsedEmail = await simpleParser(emailContent);
  const textBody = parsedEmail.text;
  //console.log(textBody);
  return textBody;
}

async function sendToOllama(data) {
  try {
    data = await readMail();
    //console.log(data);

    const messageForOllama = {
      message: "¿Podrías extraer los datos de contacto de este email?: " + data,
    };
    const response = await axios.post(
      "http://localhost:3000/send-to-ollama",
      messageForOllama
    );
    console.log("Ollama response:", response.data);
  } catch (error) {
    console.error("Error sending data to Ollama:", error);
  }
}
