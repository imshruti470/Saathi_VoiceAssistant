require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Key starts with:", apiKey.substring(0, 5));
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Models:", data.models ? data.models.map(m => m.name) : data);
  } catch(e) {
    console.error(e);
  }
}
run();
