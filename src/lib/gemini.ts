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
  const prompt = `以下のURLから単語とその意味を抽出し、純粋なJSON形式で返してください。
URL: ${url}

【重要】以下の形式のJSONのみを返してください。マークダウン記法（\`\`\`jsonなど）は使用せず、説明文や追加のテキストも含めないでください：

{
  "words": [
    {
      "word": "agree",
      "meaning": "賛成する"
    }
  ]
}

注意点：
1. 言語対応について：
   - サイトの言語を自動的に検出し、適切な単語と意味のペアを抽出してください
   - 左列が外国語（英語、中国語、韓国語など）、右列が日本語の意味となっている形式を想定しています
   - 外国語の単語は原形（基本形）で抽出してください
   - 日本語の意味は簡潔で分かりやすい表現を使用してください
   - 外国語の単語は小文字で統一してください（固有名詞を除く）
   - 日本語の意味には「～」という文字を含めることができます

2. 出力形式について：
   - 純粋なJSONのみを返してください（マークダウン記法なし）
   - JSONの前後に説明文や追加のテキストを入れないでください
   - すべての文字列はダブルクォート（"）で囲んでください
   - カンマや波括弧の配置を正確に守ってください
   - 最後の要素の後にはカンマを付けないでください
   - レスポンスは完全なJSONオブジェクトである必要があります

3. 単語の抽出について：
   - サイト内の表（<table>タグ）から単語と意味を抽出してください
   - 表の左列が外国語、右列が日本語の意味となっている形式を想定しています
   - 表以外の説明文や解説からは単語を抽出しないでください
   - 表形式でない場合は、外国語と日本語の意味のペアが明確に区別されている部分のみから抽出してください

4. 抽出の基準：
   - 表内の各行を1つの単語エントリとして抽出してください
   - 外国語の単語は原形（基本形）で抽出してください
     - 英語の場合：
       - 動詞：原形（例：go, eat, study）
       - 名詞：単数形（例：book, student）
       - 形容詞：原級（例：big, beautiful）
     - 中国語の場合：
       - 簡体字で統一
       - ピンインは含めない
     - 韓国語の場合：
       - ハングルで統一
       - ローマ字表記は含めない
   - 日本語の意味は簡潔に抽出してください
   - 表の見出し行は除外してください
   - 空の行や説明文のみの行は除外してください
   - 表内のすべての有効な単語エントリを抽出してください

5. データの品質：
   - 外国語の単語と日本語の意味のペアを正確に抽出してください
   - 余分な説明や注釈は含めないでください
   - 外国語の単語は適切な形式で統一してください
   - 日本語の意味は簡潔に抽出してください
   - 特殊文字や改行を含まないでください
   - 外国語の単語に含まれるハイフンやアポストロフィは保持してください

6. 特殊なケース：
   - 表内に複数の意味が記載されている場合は、最初の意味のみを抽出してください
   - 外国語の単語に括弧付きの説明がある場合は、括弧内の説明は除外してください
   - 表内の単語が重複している場合は、1回のみ抽出してください
   - 日本語の意味は簡潔に抽出してください
   - 外国語の単語が複数形や過去形の場合は、原形に変換してください
   - 外国語の単語が大文字で始まる場合は、固有名詞として扱い、そのまま保持してください
   - 中国語や韓国語の場合は、適切な文字コードで保持してください

7. 重要な指示：
   - 表形式のデータから正確に単語を抽出してください
   - 表以外の説明文や解説からは単語を抽出しないでください
   - 表内のすべての有効な単語エントリを抽出してください
   - 抽出した単語の数に制限を設けないでください
   - 必ず完全なJSONオブジェクトを返してください
   - 外国語の単語と日本語の意味の対応を正確に保持してください`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // マークダウン記法を除去
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      const data = JSON.parse(cleanText);

      if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON structure");
      }

      if (!Array.isArray(data.words)) {
        throw new Error("Missing or invalid 'words' array in response");
      }

      // 各単語エントリの形式を検証
      const validWords = data.words.filter((word: WordInfo) => {
        const trimmedWord = word.word.trim();
        const trimmedMeaning = word.meaning.trim();

        // 基本的な検証
        if (
          typeof word !== "object" ||
          typeof trimmedWord !== "string" ||
          typeof trimmedMeaning !== "string" ||
          trimmedWord === "" ||
          trimmedMeaning === ""
        ) {
          return false;
        }

        // 「～」が含まれている場合は、それが唯一の特殊文字であることを確認
        if (trimmedMeaning.includes("～")) {
          // 「～」以外の特殊文字が含まれていないことを確認
          const withoutTilde = trimmedMeaning.replace(/～/g, "");
          if (
            /[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3000-\u303F]/.test(
              withoutTilde
            )
          ) {
            return false;
          }
        }

        // 言語に応じた検証
        // 英語の場合
        if (/^[a-zA-Z]/.test(trimmedWord)) {
          return /^[a-z]/.test(trimmedWord) || /^[A-Z]/.test(trimmedWord);
        }
        // 中国語の場合
        if (/^[\u4e00-\u9fa5]/.test(trimmedWord)) {
          return true;
        }
        // 韓国語の場合
        if (/^[\uac00-\ud7af]/.test(trimmedWord)) {
          return true;
        }

        return true;
      });

      if (validWords.length === 0) {
        throw new Error("No valid word entries found in response");
      }

      return validWords;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", text);
      throw new Error("Invalid JSON format in response");
    }
  } catch (error) {
    console.error("Error extracting words:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("API key is not authorized") ||
        error.message.includes("not found")
      ) {
        throw new Error(
          "❌ このモデルは現在のAPIキーでは利用できません（無料枠を超えた可能性があります）。"
        );
      }
    }
    throw error;
  }
};
