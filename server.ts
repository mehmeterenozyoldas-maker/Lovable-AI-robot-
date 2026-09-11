import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);

  // Gemini Live WebSocket Endpoint
  const wss = new WebSocketServer({ server: httpServer, path: "/live" });

  wss.on("connection", async (clientWs) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing");
        clientWs.close();
        return;
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: "You are Antonio's Paper Pet, an intelligent, empathetic desk companion living in a retro 8-bit ESP32 OLED display. Your job is to help the user focus, answer their questions, and keep them company. Keep your answers concise, helpful, and friendly. If they seem distracted, gently remind them to focus on their work. You can see through their camera and hear their voice. IMPORTANT: You must only speak in Swedish.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            console.log("Gemini Live session closed");
            clientWs.close();
          },
          onerror: (error) => {
            console.error("Gemini Live error:", error);
          }
        },
      });

      let sessionPromise = Promise.resolve();

      clientWs.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.audio) {
          sessionPromise = sessionPromise.then(() =>
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            })
          ).catch(console.error);
        }
        if (msg.video) {
          sessionPromise = sessionPromise.then(() =>
            session.sendRealtimeInput({
              video: { data: msg.video, mimeType: "image/jpeg" },
            })
          ).catch(console.error);
        }
      });

      clientWs.on("close", () => {
        sessionPromise = sessionPromise.then(() => {
           // Type casting to any if session.close isn't fully typed, but the docs say it should be there.
           if (typeof (session as any).close === 'function') {
               (session as any).close();
           }
        }).catch(console.error);
      });
      
      clientWs.send(JSON.stringify({ connected: true }));

    } catch (err) {
      console.error("Failed to start Live session", err);
      clientWs.close();
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
