import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  fs.writeFileSync("test.txt", "hello world");
  const uploadedFile = await ai.files.upload({ file: "test.txt", config: { mimeType: "text/plain" } });
  console.log("Uploaded file:", uploadedFile);
  let fileInfo = await ai.files.get({ name: uploadedFile.name });
  console.log("File info:", fileInfo);
}
run();
