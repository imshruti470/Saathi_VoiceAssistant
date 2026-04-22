require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { google } = require("googleapis");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const port = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/transcriptions";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const upload = multer({ dest: 'uploads/' });


mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error(" MongoDB Connection Error:", err));


const TranscriptionSchema = new mongoose.Schema({
    text: String,
    analysis: Object,
    summary: String,
    createdAt: { type: Date, default: Date.now, expires: 7200 }, // Auto-delete after 2 hours (7200 seconds)
});
const Transcription = mongoose.model("Transcription", TranscriptionSchema);

app.use(cors());
app.use(express.json());


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeWithGemini(text) {
    if (!text) return { summary: "No text provided", analysis: { wordCount: 0, tokens: [], actionItems: [], keywords: [] } };

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Analyze the following meeting transcript.
Provide the output as a JSON object with the following exact structure:
{
  "summary": "A concise summary of the meeting",
  "actionItems": [
    {
       "task": "Action item description",
       "deadline": "ISO 8601 formatted date if mentioned, otherwise null"
    }
  ],
  "keywords": ["keyword1", "keyword2"]
}
Current Date/Time context for resolving relative dates (like 'tomorrow' or 'next Tuesday'): ${new Date().toISOString()}
Do not include markdown formatting like \`\`\`json. Just the raw JSON object.

Transcript:
${text}`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Remove potential markdown blocks
        if (responseText.startsWith("\`\`\`json")) {
            responseText = responseText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
        } else if (responseText.startsWith("\`\`\`")) {
            responseText = responseText.replace(/\`\`\`/g, "").trim();
        }

        const data = JSON.parse(responseText);

        return {
            summary: data.summary || "No summary available",
            analysis: {
                wordCount: text.split(" ").length,
                tokens: text.split(" "),
                actionItems: data.actionItems || [],
                keywords: data.keywords || []
            }
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            summary: "Error generating summary. Please check your API key.",
            analysis: { wordCount: 0, tokens: [], actionItems: [], keywords: [] }
        };
    }
}


app.post("/save-transcript", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        const { summary, analysis } = await analyzeWithGemini(text);

        const newTranscription = new Transcription({ text, analysis, summary });
        await newTranscription.save();

        res.json({ message: "Transcription saved!", text, analysis, summary });
    } catch (error) {
        console.error("Error saving transcript:", error);
        res.status(500).json({ error: "Failed to save transcript" });
    }
});


app.get("/latest-transcript", async (req, res) => {
    try {
        const latestTranscription = await Transcription.findOne().sort({ createdAt: -1 });
        if (!latestTranscription) return res.status(404).json({ error: "No transcription found" });

        res.json(latestTranscription);
    } catch (error) {
        console.error("Error fetching latest transcription:", error);
        res.status(500).json({ error: "Failed to retrieve latest transcription" });
    }
});


app.post("/upload-audio", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No audio file provided" });

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const mimeType = req.file.mimetype;
        const audioPath = req.file.path;
        const audioData = fs.readFileSync(audioPath).toString("base64");

        const prompt = `Transcribe the following audio file. Then, provide the output as a JSON object with the following exact structure:
{
  "transcript": "Full transcription of the audio",
  "summary": "A concise summary of the meeting",
  "actionItems": ["Action item 1", "Action item 2"],
  "keywords": ["keyword1", "keyword2"]
}
Do not include markdown formatting like \`\`\`json. Just the raw JSON object.`;

        let result;
        try {
            result = await model.generateContent([
                prompt,
                { inlineData: { mimeType: mimeType, data: audioData } }
            ]);
        } catch (err) {
            if (err.message && err.message.includes("0 Frames found") && mimeType.startsWith("video/")) {
                console.log("Video has 0 frames. Retrying as audio/mp4...");
                result = await model.generateContent([
                    prompt,
                    { inlineData: { mimeType: "audio/mp4", data: audioData } }
                ]);
            } else {
                throw err;
            }
        }

        let responseText = result.response.text().trim();
        if (responseText.startsWith("\`\`\`json")) {
            responseText = responseText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
        } else if (responseText.startsWith("\`\`\`")) {
            responseText = responseText.replace(/\`\`\`/g, "").trim();
        }

        const data = JSON.parse(responseText);

        const text = data.transcript || "Transcription failed";
        const analysis = {
            wordCount: text.split(" ").length,
            tokens: text.split(" "),
            actionItems: data.actionItems || [],
            keywords: data.keywords || []
        };
        const summary = data.summary || "No summary available";

        const newTranscription = new Transcription({ text, analysis, summary });
        await newTranscription.save();

        // clean up uploaded file
        fs.unlinkSync(audioPath);

        res.json({ message: "Audio processed successfully!", text, analysis, summary });
    } catch (error) {
        console.error("Error processing audio:", error);
        res.status(500).json({ error: "Failed to process audio" });
    }
});

app.get("/download-pdf", async (req, res) => {
    try {
        const latestTranscription = await Transcription.findOne().sort({ createdAt: -1 });
        if (!latestTranscription) return res.status(404).json({ error: "No transcription found" });

        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=Meeting_Summary.pdf");
        doc.pipe(res);

        doc.fontSize(20).text("Meeting Summary", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text("Summary:");
        doc.fontSize(12).text(latestTranscription.summary);
        doc.moveDown();

        if (latestTranscription.analysis && latestTranscription.analysis.keywords) {
            doc.fontSize(14).text("Keywords:");
            doc.fontSize(12).text(latestTranscription.analysis.keywords.join(", "));
            doc.moveDown();
        }

        if (latestTranscription.analysis && latestTranscription.analysis.actionItems) {
            doc.fontSize(14).text("Action Items:");
            latestTranscription.analysis.actionItems.forEach(item => {
                const taskStr = typeof item === 'object' ? `${item.task} ${item.deadline ? '(Due: ' + new Date(item.deadline).toLocaleDateString() + ')' : ''}` : item;
                doc.fontSize(12).text(`• ${taskStr}`);
            });
        }

        doc.end();
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

app.post("/send-email", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const latestTranscription = await Transcription.findOne().sort({ createdAt: -1 });
        if (!latestTranscription) return res.status(404).json({ error: "No transcription found" });

        const { summary, analysis, createdAt } = latestTranscription;
        const keywords = analysis?.keywords?.join(", ") || "None";
        const actionItems = analysis?.actionItems?.map(item => {
            const taskStr = typeof item === 'object' ? `${item.task} ${item.deadline ? '(Due: ' + new Date(item.deadline).toLocaleDateString() + ')' : ''}` : item;
            return `<li>${taskStr}</li>`;
        }).join("") || "<li>None</li>";
        
        const dateObj = createdAt ? new Date(createdAt) : new Date();
        const formattedDate = dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

        const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <div style="background: linear-gradient(135deg, #1a1a2e, #0b0f19); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #00f2fe; margin: 0; font-size: 24px;">Smart Voice Assistant</h1>
                </div>
                
                <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #1a1a2e; margin-top: 0;">Meeting Summary</h2>
                    <p style="color: #666; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
                    
                    <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; color: #4facfe; margin-top: 30px;">Executive Summary</h3>
                    <p>${summary}</p>
                    
                    <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; color: #4facfe; margin-top: 30px;">Action Items</h3>
                    <ul style="padding-left: 20px;">${actionItems}</ul>
                    
                    <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; color: #4facfe; margin-top: 30px;">Key Topics</h3>
                    <p>${keywords}</p>
                    
                    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
                    
                    <div style="text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <p style="color: #555; font-size: 15px; margin-bottom: 20px;">
                            This meeting was automatically transcribed, analyzed, and organized by <strong>Smart Voice Assistant</strong>.
                        </p>
                        <a href="http://localhost:3000">
                            <img src="cid:smart_voice_ad" alt="Transform your meetings with AI" style="width: 100%; max-width: 500px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
                        </a>
                        <div style="margin-top: 25px;">
                            <a href="http://localhost:3000" style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: #0b0f19; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Transform Your Meetings Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Meeting Insights - Smart Voice Assistant",
            html: htmlContent,
            attachments: [
                {
                    filename: 'smart_voice_ad.png',
                    path: path.join(__dirname, 'assets', 'smart_voice_ad.png'),
                    cid: 'smart_voice_ad'
                }
            ]
        };


        await transporter.sendMail(mailOptions);

        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});


app.get("/auth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events']
    });
    res.json({ url });
});

app.get("/oauth2callback", async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        res.redirect("http://localhost:3000/transcription?auth=success");
    } catch (error) {
        console.error("Error getting tokens:", error);
        res.redirect("http://localhost:3000/transcription?auth=error");
    }
});

app.post("/sync-calendar", async (req, res) => {
    try {
        const latestTranscription = await Transcription.findOne().sort({ createdAt: -1 });
        if (!latestTranscription || !latestTranscription.analysis.actionItems) {
            return res.status(404).json({ error: "No action items to sync" });
        }

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        let syncedCount = 0;

        for (const item of latestTranscription.analysis.actionItems) {
            if (typeof item === 'object' && item.task && item.deadline) {
                const event = {
                    summary: item.task,
                    description: "Auto-generated from Smart Voice Assistant.",
                    start: {
                        dateTime: item.deadline,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    end: {
                        dateTime: new Date(new Date(item.deadline).getTime() + 60*60*1000).toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                };
                await calendar.events.insert({
                    calendarId: 'primary',
                    resource: event,
                });
                syncedCount++;
            }
        }
        
        if (syncedCount === 0) {
            return res.status(400).json({ message: "No action items with deadlines were found to sync." });
        }

        res.json({ message: `Successfully synced ${syncedCount} events to Google Calendar.` });
    } catch (error) {
        console.error("Error syncing to calendar:", error);
        res.status(500).json({ error: "Failed to sync to calendar. Make sure you authenticated first." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
