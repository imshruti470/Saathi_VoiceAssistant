require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const natural = require("natural");
const nodemailer = require("nodemailer");
const { SummarizerManager } = require("node-summarizer");
const { spawn } = require("child_process"); // ✅ Import child_process for Python execution

const app = express();
const port = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/transcriptions";

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Transcription Schema
const TranscriptionSchema = new mongoose.Schema({
    text: String,
    analysis: Object,
    summary: String,
    createdAt: { type: Date, default: Date.now },
});
const Transcription = mongoose.model("Transcription", TranscriptionSchema);

app.use(cors());
app.use(express.json());

// ✅ **Correct Initialization of BrillPOSTagger**
const lexicon = new natural.Lexicon("EN", "N");
const ruleSet = new natural.RuleSet("EN");
const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

// 📌 **Function to Analyze Text**
async function analyzeText(text) {
    if (!text) return {};

    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);

    // ✅ Extract action items (verbs)
    const taggedWords = tagger.tag(tokens);

    const actionItems = taggedWords.taggedWords
        .filter(word => word.tag.startsWith("VB")) // Extracting verbs (e.g., submit, review, approve)
        .map(word => word.token);

    // ✅ Extract Keywords using Python YAKE
    const keywords = await extractKeywordsFromPython(text);

    return {
        wordCount: tokens.length,
        tokens,
        actionItems,
        keywords
    };
}

// 📌 **Function to Extract Keywords Using Python YAKE**
async function extractKeywordsFromPython(text) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn("python", ["extract_keywords.py"]);

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                console.error(`Python process exited with code ${code}: ${errorOutput}`);
                return reject("Error processing keywords");
            }
            try {
                const result = JSON.parse(output);
                resolve(result.keywords || []);
            } catch (error) {
                console.error("Error parsing JSON from Python:", error);
                reject("Error processing keywords");
            }
        });

        // ✅ Ensure Python script receives text properly
        pythonProcess.stdin.write(JSON.stringify({ text }) + "\n");
        pythonProcess.stdin.end();
    });
}

// 📌 **Function to Summarize Text**
function summarizeText(text) {
    try {
        const summarizer = new SummarizerManager(text, 3);
        const summary = summarizer.getSummaryByFrequency().summary;
        return summary || "No summary available";
    } catch (error) {
        console.error("Error summarizing text:", error);
        return "Error generating summary";
    }
}

// 📌 **Save and Analyze Transcription**
app.post("/save-transcript", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        const analysis = await analyzeText(text);
        const summary = summarizeText(text);

        const newTranscription = new Transcription({ text, analysis, summary });
        await newTranscription.save();

        res.json({ message: "Transcription saved!", text, analysis, summary });
    } catch (error) {
        console.error("Error saving transcript:", error);
        res.status(500).json({ error: "Failed to save transcript" });
    }
});

// 📌 **Fetch the latest transcription**
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

// 📌 **Send Email with Summary**
app.post("/send-email", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const latestTranscription = await Transcription.findOne().sort({ createdAt: -1 });
        if (!latestTranscription) return res.status(404).json({ error: "No transcription found" });

        const { summary } = latestTranscription;

        // ✅ Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
            }
        });

        // ✅ Email Options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Meeting Summary",
            text: `Here is your meeting summary:\n\n${summary}`
        };

        // ✅ Send Email
        await transporter.sendMail(mailOptions);

        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

// ✅ **Start Server**
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
