import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// 環境変数から API キーを取得
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Gemini API key is not set in environment variables");
}
// API クライアント初期化
const genAI = new GoogleGenerativeAI(apiKey);

export type TranslationDirection = "word-to-meaning" | "meaning-to-word";

export const translateWord = async (
  text: string,
  direction: TranslationDirection
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt =
      direction === "word-to-meaning"
        ? `以下の単語を日本語に翻訳してください。翻訳結果のみを出力してください。
単語: ${text}`
        : `以下の日本語の意味を英語の単語に翻訳してください。翻訳結果のみを出力してください。
意味: ${text}`;

    // プロンプトを送信
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    return translatedText;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Translation error:", errorMessage);
    if (
      errorMessage.includes("API key is not authorized") ||
      errorMessage.includes("not found")
    ) {
      return "❌ このモデルは現在のAPIキーでは利用できません（無料枠を超えた可能性があります）。";
    }
    throw error;
  }
};
