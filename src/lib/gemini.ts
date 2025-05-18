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

// JSONの修復をGeminiに依頼する関数
const repairJsonWithGemini = async (
  incompleteJson: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const repairPrompt = `以下の不完全なJSONを修復してください。特に最後の部分が切れている可能性があります。
修復の際は以下の点に注意してください：
1. 最後のエントリーが不完全な場合は、適切に閉じてください
2. すべてのエントリーが "word" と "meaning" の両方のプロパティを持つようにしてください
3. 最後に "]} で終わるようにしてください
4. 純粋なJSONのみを返してください（マークダウン記法なし）
5. 最後のエントリーが不完全な場合は、そのエントリーを除外してください
6. 既存の完全なエントリーはすべて保持してください

不完全なJSON:
${incompleteJson}

修復後のJSONは以下の形式である必要があります：
{
  "words": [
    {
      "word": "example",
      "meaning": "例"
    }
  ]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: repairPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });
    const response = await result.response;
    const repairedJson = response
      .text()
      .trim()
      .replace(/```json\n?|\n?```/g, "")
      .trim();

    // 修復後のJSONの基本構造を確認
    if (
      !repairedJson.startsWith('{"words":[') ||
      !repairedJson.endsWith("]}")
    ) {
      throw new Error("修復後のJSONの形式が不正です");
    }

    return repairedJson;
  } catch (error) {
    console.error("JSON repair error:", error);
    throw new Error("JSONの修復に失敗しました");
  }
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
1. 出力形式について：
   - 純粋なJSONのみを返してください（マークダウン記法なし）
   - JSONの前後に説明文や追加のテキストを入れないでください
   - すべての文字列はダブルクォート（"）で囲んでください
   - カンマや波括弧の配置を正確に守ってください
   - 最後の要素の後にはカンマを付けないでください
   - レスポンスは完全なJSONオブジェクトである必要があります
   - 各単語エントリーは必ず完全な形で出力してください（途中で切れないように）
   - 必ず最後に "]} で終わるようにしてください
   - 各エントリーは必ず "word" と "meaning" の両方のプロパティを持つこと
   - できるだけ多くの有効な単語を抽出してください

2. 単語の抽出について：
   - サイト内の表（<table>タグ）から単語と意味を抽出してください
   - 表の左列が外国語、右列が日本語の意味となっている形式を想定しています
   - 表以外の説明文や解説からは単語を抽出しないでください
   - 表形式でない場合は、外国語と日本語の意味のペアが明確に区別されている部分のみから抽出してください
   - すべての有効な単語エントリーを抽出してください

3. 抽出の基準：
   - 表内の各行を1つの単語エントリとして抽出してください
   - 外国語の単語は原形（基本形）で抽出してください
   - 日本語の意味は簡潔に抽出してください
   - 表の見出し行は除外してください
   - 空の行や説明文のみの行は除外してください
   - 各エントリーは必ず完全な形で出力してください

4. データの品質：
   - 外国語の単語と日本語の意味のペアを正確に抽出してください
   - 余分な説明や注釈は含めないでください
   - 特殊文字や改行を含まないでください
   - 各エントリーは必ず完全な形で出力してください`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });
    const response = await result.response;
    const text = response.text().trim();
    console.log("Raw response:", text);

    // マークダウン記法を除去
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      // 最初のJSON解析を試みる
      try {
        const parsed = JSON.parse(cleanText);
        if (
          parsed &&
          typeof parsed === "object" &&
          Array.isArray(parsed.words)
        ) {
          const validWords = parsed.words.filter(
            (entry: { word: string; meaning: string }) => {
              if (!entry || typeof entry !== "object") return false;
              if (typeof entry.word !== "string" || !entry.word.trim())
                return false;
              if (typeof entry.meaning !== "string" || !entry.meaning.trim())
                return false;
              return true;
            }
          );
          if (validWords.length > 0) {
            return validWords;
          }
        }
      } catch (initialParseError) {
        console.log(
          "Initial parse failed, attempting repair...",
          initialParseError
        );
      }

      // JSONの修復を試みる
      let fixedText = cleanText;

      // 1. 基本的な構造チェックと修復
      if (!fixedText.startsWith('{"words":[')) {
        fixedText = '{"words":[' + fixedText;
      }

      // 2. Geminiを使用してJSONを修復
      try {
        fixedText = await repairJsonWithGemini(fixedText);
      } catch (repairError) {
        console.error(
          "Gemini repair failed, falling back to basic repair...",
          repairError
        );
        // 基本的な修復を試みる
        if (!fixedText.endsWith("]}")) {
          // 最後の完全なエントリーを探す
          const lastCompleteEntry = fixedText.lastIndexOf("},");
          if (lastCompleteEntry !== -1) {
            // 最後の完全なエントリーまでを保持
            fixedText = fixedText.substring(0, lastCompleteEntry + 1) + "]}";
          } else {
            // 完全なエントリーが見つからない場合は、空の配列を返す
            fixedText = '{"words":[]}';
          }
        }
      }

      // 3. 修復後のJSONを解析
      const parsed = JSON.parse(fixedText);

      // 4. 基本的な構造チェック
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.words)
      ) {
        throw new Error(
          "Invalid JSON structure: missing or invalid 'words' array"
        );
      }

      // 5. 各単語エントリーの検証
      const validWords = parsed.words.filter(
        (entry: { word: string; meaning: string }) => {
          if (!entry || typeof entry !== "object") return false;
          if (typeof entry.word !== "string" || !entry.word.trim())
            return false;
          if (typeof entry.meaning !== "string" || !entry.meaning.trim())
            return false;
          return true;
        }
      );

      if (validWords.length === 0) {
        throw new Error("No valid word entries found in the response");
      }

      return validWords;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed to parse text:", cleanText);
      if (parseError instanceof SyntaxError) {
        throw new Error(
          `JSONの形式が不正です: ${parseError.message}\n応答が途中で切れている可能性があります。`
        );
      }
      throw parseError;
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
