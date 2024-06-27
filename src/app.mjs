import express from "express";
import ollama from "ollama";
import fs from "fs/promises";

const ollamaUrl = "http://localhost:11434/api/generate"; // Replace with your Ollama server URL

const emailFolderUri = new URL(
  "../email/management/Inbox/cur/",
  import.meta.url
);

async function findMail() {
  const emailFolderPath = emailFolderUri.pathname;
  //console.log(emailFolderPath);
  const storedEmails = await fs.readdir(emailFolderPath);
  //console.log(storedEmails);
  return storedEmails;
}

async function readMail(storedEmails) {
  storedEmails = await findMail();
  const emailUri = new URL(storedEmails.pop(), emailFolderUri);
  const emailContent = await fs.readFile(emailUri.pathname, "utf-8");
  console.log(emailContent);
}
readMail();

const app = express(); // Create an Express application instance
// Enable JSON body parsing
app.use(express.json());

const port = process.env.PORT || 3000; // Get port from environment variable or use default 3000

app.get("/", (req, res) => {
  res.send("Hello World!"); // Respond to root path (/) with "Hello World!"
});

app.get("/email", (req, res) => {});

app.post("/send-to-ollama", async (req, res) => {
  try {
    const message = req.body.message; // Extract message from request body

    if (!message) {
      return res.status(400).send("Missing message in request body");
    }

    const model = req.body.model || "tinyllama"; // Model to use (defaults to llama3)

    const ollamaRequest = {
      model,
      messages: [{ role: "user", content: message }],
    };

    const response = await ollama.chat(ollamaRequest, ollamaUrl); // Send request to Ollama

    res.json(response); // Send Ollama response back to client
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending message to Ollama server");
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
