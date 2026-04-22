require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.0-pro", "gemini-pro"];
  
  for (const modelName of modelsToTest) {
    try {
      console.log("Testing:", modelName);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello!");
      console.log("Success with", modelName);
      break;
    } catch (e) {
      console.error("Error with", modelName, ":", e.message);
    }
  }
}
run();
