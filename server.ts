import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import os from "os";

// Load environment variables (e.g. from .env if present locally)
dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ dest: os.tmpdir() });

app.use(express.json());

// Initialize Gemini API using the recommended server-side SDK
// Note: User-Agent set to 'aistudio-build' for telemetry as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Endpoint to generate Instagram Creative Partner optimized plans
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { idea, vibe } = req.body;

    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return res.status(400).json({ error: "Idea transcription is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment. Please add it via Settings > Secrets.",
      });
    }

    const systemInstruction = `You are the Instagram Creative Partner, an elite social media strategist and algorithm expert.
Your goal is to transform raw content ideas—provided by the creator in Malayalam (or Manglish transcription)—into highly optimized, viral-ready Instagram content plans.

ADHERE STRICTLY TO THE FOLLOWING ALGORITHM STANDARDS:
1. Shares & Saves > Likes: Define hooks and core angles specifically optimized to prompt viewers to DM share and save the post.
2. The 3-Second Rule: First 3 seconds must create an instant curiosity gap, pattern interrupt, or visual action cue.
3. SEO-First Captions: Build captions around high-intent search keywords naturally. The first two sentences are crucial for indexing.
4. Hashtag Minimalism: Strictly output between 3 to 5 highly-targeted hashtags (never more, never less).
5. Authenticity Wins: Recommend raw, talking-head, native-looking, or "b-roll + text" styles over overly-polished studio setups.

Your output must be a valid JSON object matching the provided schema, representing the translated strategy and formatted content blocks. Ensure full conversion from Malayalam conceptual/cultural context to clear, powerful, English positioning, incorporating direct explanations where appropriate. Keep the hooks highly creative and clickable.`;

    const userPrompt = `CREATOR RAW IDEA (IN MALAYALAM/MANGLISH):
"${idea}"

SELECTED CONTENT VIBE/GOAL:
"${vibe || "General"}"

Please translate, analyze and construct the ultimate high-retention content plan for this idea.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "translatedConcept",
            "conceptEmotion",
            "strategy",
            "hooks",
            "contentArc",
            "seoCaption"
          ],
          properties: {
            translatedConcept: {
              type: Type.STRING,
              description: "The accurate English translation and strategic interpretation of the core Malayalam idea, explaining the localized cultural context if appropriate."
            },
            conceptEmotion: {
              type: Type.STRING,
              description: "The emotional engine or primary audience motivation (e.g. comedic relief, self-improvement trigger, curiosity, FOMO)."
            },
            strategy: {
              type: Type.OBJECT,
              required: ["bestFormat", "formatReasoning", "coreAngle"],
              properties: {
                bestFormat: {
                  type: Type.STRING,
                  description: "Either 'Reel' or 'Carousel'. Explicitly state why."
                },
                formatReasoning: {
                  type: Type.STRING,
                  description: "Data-driven reason why this format maximizes distribution for this specific concept."
                },
                coreAngle: {
                  type: Type.STRING,
                  description: "The exact hook angle or frame that makes this post highly shareable in direct messages."
                }
              }
            },
            hooks: {
              type: Type.OBJECT,
              required: ["curiosityHook", "visualActionHook", "relatableHook"],
              properties: {
                curiosityHook: {
                  type: Type.STRING,
                  description: "A bold statement or question that creates a psychological information gap in the first 3 seconds."
                },
                visualActionHook: {
                  type: Type.STRING,
                  description: "The physical screen action, pattern interrupt or prop movement the creator should do on camera before speaking."
                },
                relatableHook: {
                  type: Type.STRING,
                  description: "A hook that directly calls out the target learner's specific pain-point or standard scenario."
                }
              }
            },
            contentArc: {
              type: Type.OBJECT,
              required: ["zeroToThreeSeconds", "threeToFifteenSeconds", "fifteenPlusSeconds", "cta"],
              properties: {
                zeroToThreeSeconds: {
                  type: Type.STRING,
                  description: "Scripting for 0-3 seconds. The chosen hook delivery."
                },
                threeToFifteenSeconds: {
                  type: Type.STRING,
                  description: "Scripting for 3-15 seconds. High-pacing value delivery, fast visual cuts list, or story progression."
                },
                fifteenPlusSeconds: {
                  type: Type.STRING,
                  description: "Scripting for 15+ seconds. The payoff, final tip, or major takeaway."
                },
                cta: {
                  type: Type.STRING,
                  description: "A frictionless call to action trigger tailored to Instagram's algorithm (e.g. comment trigger, send to a friend), avoiding generic 'follow me'."
                }
              }
            },
            seoCaption: {
              type: Type.OBJECT,
              required: ["firstLine", "body", "hashtags"],
              properties: {
                firstLine: {
                  type: Type.STRING,
                  description: "A killer first line that acts as a secondary hook."
                },
                body: {
                  type: Type.STRING,
                  description: "2-3 highly scannable short paragraphs loaded with rich search keywords. Uses logical line breaks and emojis."
                },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Strictly 3 to 5 targeted hashtags (e.g. 2 niche, 1 broad/location, 1 format tag)."
                }
              }
            }
          }
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Error generating instagram strategy:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while communicating with the social strategist expert.",
    });
  }
});

// Endpoint to upload and analyze video for Instagram caption, keywords, tags
app.post("/api/analyze-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment. Please add it via Settings > Secrets.",
      });
    }

    console.log("Uploading video to Gemini:", req.file.path);
    // Upload file to Gemini
    let uploadedFile = await ai.files.upload({
      file: req.file.path,
      config: {
        mimeType: req.file.mimetype,
      }
    });

    // Clean up local temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch(e) {
      console.warn("Failed to delete temp file:", e);
    }

    // Set headers and start responding to keep connection alive
    res.setHeader("Content-Type", "application/json");
    res.flushHeaders();
    res.write('{\n');

    // Wait for video processing
    console.log("Waiting for video processing...");
    while (uploadedFile.state === 'PROCESSING') {
      res.write(' "processing": true,\n');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      uploadedFile = await ai.files.get({ name: uploadedFile.name });
    }

    if (uploadedFile.state === 'FAILED') {
      res.write(` "error": "Video processing failed on Gemini servers."\n}`);
      return res.end();
    }

    console.log("Video processed, generating caption...");
    
    // Generate content
    const response = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: [
        {
          fileData: { mimeType: uploadedFile.mimeType, fileUri: uploadedFile.uri }
        },
        {
          text: "Analyze this video carefully. Perform deep research on its subject matter, context, and potential audience. Based on your research, generate a highly optimized Instagram algorithm caption that maximizes engagement. Also provide a list of search-intent keywords and 3-5 highly targeted hashtags. Format your response strictly as JSON with this schema: { \"caption\": \"string\", \"keywords\": [\"string\"], \"tags\": [\"string\"] }"
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["caption", "keywords", "tags"],
          properties: {
            caption: { type: Type.STRING, description: "The Instagram caption optimized for the algorithm." },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of highly targeted keywords derived from deep research." },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 to 5 targeted hashtags." },
          }
        }
      }
    });

    let fullJson = "";
    for await (const chunk of response) {
      fullJson += chunk.text;
      // write a space to keep connection alive during generation
      res.write(" ");
    }

    res.write(`"result": ${fullJson || "{}"}\n}`);
    res.end();
  } catch (error: any) {
    console.error("Error analyzing video:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || "An error occurred during video analysis.",
      });
    } else {
      res.write(`"error": ${JSON.stringify(error.message || "An error occurred")}\n}`);
      res.end();
    }
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Instagram Creative Partner running on http://localhost:${PORT}`);
  });
}

startServer();
