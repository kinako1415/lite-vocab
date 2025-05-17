import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// 環境変数から API キーを取得
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Gemini API key is not set in environment variables");
}
// API クライアント初期化
const genAI = new GoogleGenerativeAI(apiKey);

export const translateWord = async (text: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `以下の単語を日本語に翻訳してください。翻訳結果のみを出力してください。
単語: ${text}`;

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

type WordInfo = {
  word: string;
  meaning: string;
  partOfSpeech?: string; // 品詞情報を追加
  example?: string; // 例文を追加
  difficulty?: string; // 難易度を追加
};

export const extractWordsFromUrl = async (url: string): Promise<WordInfo[]> => {
  const prompt = `
以下のURLから単語とその意味を抽出し、構造化されたデータとして返してください。
URL: ${url}

以下の形式のJSONで返してください：
{
  "words": [
    {
      "word": "単語（英語）",
      "meaning": "意味（日本語）",
      "partOfSpeech": "品詞（名詞/動詞/形容詞など）",
      "example": "例文（英語）",
      "difficulty": "難易度（初級/中級/上級）"
    }
  ]
}

注意点：
1. 単語の抽出について：
   - このサイトで紹介されている単語を抽出し、その日本語訳を提供してください
   - 品詞情報を必ず含めてください
   - 可能な場合は、その単語を使用した例文も含めてください
   - 単語の難易度を判定してください（初級/中級/上級）

2. 抽出の基準：
   - 学習に値する重要な単語を抽出してください
   - 一般的な使用頻度の高い単語を優先してください
   - 文法的に重要な単語（例：助動詞、前置詞など）も含めてください
   - 最低10個以上の単語を抽出してください

3. データの品質：
   - 意味は簡潔で分かりやすく説明してください
   - 例文は実用的で理解しやすいものを選んでください
   - 品詞の判定は正確に行ってください
   - 難易度は一般的な英語学習の基準に基づいて判定してください

4. 出力形式：
   - 必ずJSON形式で返してください
   - すべてのフィールド（word, meaning, partOfSpeech, example, difficulty）を含めてください
   - 文字化けを防ぐため、適切なエンコーディングを使用してください

5. 特殊なケース：
   - 動詞の場合は、基本的な形（原形）を抽出してください
   - 名詞の場合は、単数形を基本とし、必要に応じて複数形も含めてください
   - 形容詞の場合は、基本的な形を抽出し、比較級や最上級の情報も含めてください
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON文字列を抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response");
    }

    const jsonStr = jsonMatch[0];
    const data = JSON.parse(jsonStr);

    if (!Array.isArray(data.words)) {
      throw new Error("Invalid response format");
    }

    return data.words;
  } catch (error) {
    console.error("Error extracting words:", error);
    throw error;
  }
};
