import express from "express";
import axios from "axios";
import { readMail } from "./utils/readMail.mjs";

const ollamaUrl = "https://ollama.godspeed.moe/api/chat";

const ollamaModel = "stablelm-zephyr";

const app = express(); // Create an Express application instance
// Enable JSON body parsing
app.use(express.json());

const port = process.env.PORT || 3000; // Get port from environment variable or use default 3000

app.get("/", (req, res) => {
  res.send("Hello World!"); // Respond to root path (/) with "Hello World!"
});

app.get("/email", async (req, res) => {
  try {
    const textBody = await readMail();
    res.status(200).json({ status: "success", msg: textBody });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error", msg: "Internal server error." });
  }
});

app.post("/send-to-ollama", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const requestBody = {
    model: ollamaModel,
    messages: [{ role: "user", content: message }],
    stream: false,
  };

  try {
    console.log("Sending request to Ollama:", requestBody);

    const response = await axios.post(ollamaUrl, requestBody, {
      headers: { "Content-Type": "application/json" }, // Ensure Content-Type is set
    });

    console.log("Response from Ollama:", response.data);

    if (
      response.data &&
      response.data.message &&
      response.data.message.content
    ) {
      res.status(200).json({ response: response.data });
    } else {
      res.status(204).json({ message: "No content in response" });
    }
  } catch (error) {
    console.error(
      "Error posting message:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

app.get("/process-email", async (req, res) => {
  try {
    const emailText = await readMail();
    //const prompt = "¿Puedes generar una respuesta de texto a este email?: ";
    const prompt = "¿Me das los nombres de las personas involucradas en esta conversación?: ";
    const combinedMessage = prompt + emailText; // Combine prompt and email text

    // Call the /send-to-ollama route using its path and pass the combinedMessage as a parameter
    const ollamaResponse = await axios.post(
      "http://localhost:3000/send-to-ollama",
      {
        message: combinedMessage,
      }
    );

    if (ollamaResponse.status === 200) {
      res.json({
        message: combinedMessage,
        ollamaResponse: ollamaResponse.data,
      });
    } else {
      res
        .status(ollamaResponse.status)
        .json({ error: ollamaResponse.data.message });
    }
  } catch (error) {
    console.error("Error processing email:", error);
    res.status(500).json({ error: "Error processing email" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is listening on port ${port}`);
});
