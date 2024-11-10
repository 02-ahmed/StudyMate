import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleAIFileManager } from "@google/generative-ai/server";

const systemPrompt = `You are a pdf summariser. You receive a pdf as an input and explain everything in as few words as possible`;

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

export async function POST(req) {
  const formData = await req.formData();
  let uploadedFile;

  // Find the first file in FormData
  for (const entry of formData.entries()) {
    const [key, value] = entry;
    if (value instanceof File) {
      uploadedFile = value;
      break; // Stop after finding the first file
    }
  }

  if (!uploadedFile) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const arrayBuffer = await uploadedFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResponse = await fileManager.uploadFile(buffer, {
    mimeType: "application/pdf",
    displayName: uploadedFile.name || "Uploaded PDF",
  });

  let model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: "application/json" },
  });

  console.log(
    `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
  );

  // Generate content using text and the URI reference for the uploaded file.
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    { text: "Summarise this" },
  ]);

  // Output the generated text to the console
  console.log(result.response.text());
  const summarised = result.response.text();

  return NextResponse(summarised);
}
