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

// 修復関数がコメントアウトされているため、エラーが発生しています。修復関数を再度有効化します。
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

    // JSON構文の検証
    try {
      JSON.parse(repairedJson);
    } catch (parseError) {
      throw new Error(
        `修復後のJSONが無効です: ${parseError.message}`
      );
    }

    return repairedJson;
  } catch (error) {
    console.error("JSON repair error:", error);
    throw new Error("JSONの修復に失敗しました");
  }
};

export const extractWordsFromUrl = async (url: string): Promise<WordInfo[]> => {
  const prompt = `以下のURLから英単語と日本語の意味のリストを抽出し、純粋なJSON形式で返してください。\nURL: ${url}\n\n【重要】以下の形式のJSONのみを返してください。マークダウン記法（\`\`\`jsonなど）は使用せず、説明文や追加のテキストも含めないでください：\n\n{\n  \"words\": [\n    {\n      \"word\": \"agree\",\n      \"meaning\": \"賛成する\"\n    }\n  ]\n}\n\n注意点：\n1. 出力形式について：\n   - 純粋なJSONのみを返してください（マークダウン記法なし）\n   - JSONの前後に説明文や追加のテキストを入れないでください\n   - すべての文字列はダブルクォート（\"）で囲んでください\n   - カンマや波括弧の配置を正確に守ってください\n   - 最後の要素の後にはカンマを付けないでください\n   - レスポンスは完全なJSONオブジェクトである必要があります\n   - 各単語エントリーは必ず完全な形で出力してください（途中で切れないように）\n   - 必ず最後に \"]} で終わるようにしてください\n   - 各エントリーは必ず \"word\" と \"meaning\" の両方のプロパティを持つこと\n   - サイト内に存在する単語のみを抽出してください。サイトにない単語を生成しないでください。\n   - サイト内のすべての単語を抽出してください。\n\n2. 単語の抽出について：\n   - サイト内の表（<table>タグ）から単語と意味を抽出してください\n   - 表の左列が英単語、右列が日本語の意味となっている形式を想定しています\n   - 表以外の説明文や解説からは単語を抽出しないでください\n   - 表形式でない場合は、英単語と日本語の意味のペアが明確に区別されている部分のみから抽出してください\n   - サイト内のすべての有効な単語エントリーを抽出してください\n\n3. 抽出の基準：\n   - 表内の各行を1つの単語エントリとして抽出してください\n   - 英単語は原形（基本形）で抽出してください\n   - 日本語の意味は簡潔に抽出してください\n   - 表の見出し行は除外してください\n   - 空の行や説明文のみの行は除外してください\n   - 各エントリーは必ず完全な形で出力してください\n\n4. データの品質：\n   - 英単語と日本語の意味のペアを正確に抽出してください\n   - 余分な説明や注釈は含めないでください\n   - 特殊文字や改行を含まないでください\n   - 各エントリーは必ず完全な形で出力してください\n\n5. 出力の完全性：\n   - サイト内のすべての単語を漏れなく抽出してください。\n   - 抽出結果が途中で切れることがないようにしてください。\n   - 必要に応じて複数回に分けて抽出を行い、すべての単語を収集してください。\n   - 抽出結果が多い場合は、JSONの配列を分割して複数のレスポンスに分けることを検討してください。\n\n6. 抽出の精度向上：\n   - サイト内のすべてのHTML要素を解析し、単語と意味のペアを見逃さないようにしてください。\n   - 特に、<table>タグ以外のリスト形式（<ul>や<ol>）や段落（<p>）内にある単語と意味のペアも抽出してください。\n   - ページ全体をスクロールして、動的に読み込まれるコンテンツも含めて抽出してください。\n   - 必要に応じて、ページのHTML構造を詳細に解析して、すべての単語を抽出してください。\n   - ページ内の隠れた要素や非表示の要素も含めて解析してください。\n   - JavaScriptで動的に生成されるコンテンツも含めて抽出してください。\n   - ページ内のすべてのセクションを個別に解析し、単語が含まれる可能性のあるすべての部分を確認してください。\n   - ページのロード後に追加で読み込まれるデータ（例: AjaxリクエストやAPIレスポンス）も含めて解析してください。`;

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
      // JSON.parseの前に構文エラーを修正
      let fixedText = cleanText;

      // 必要に応じてJSONの開始と終了を補完
      if (!fixedText.startsWith('{"words":[')) {
        fixedText = '{"words":[' + fixedText;
      }
      if (!fixedText.endsWith("]}")) {
        const lastValidIndex = fixedText.lastIndexOf("},");
        if (lastValidIndex !== -1) {
          fixedText = fixedText.substring(0, lastValidIndex + 1) + "]}";
        } else {
          fixedText = '{"words":[]}';
        }
      }

      // 修復後のJSONをGeminiでさらに修正
      try {
        fixedText = await repairJsonWithGemini(fixedText);
      } catch (repairError) {
        console.error(
          "Gemini repair failed, falling back to basic repair...",
          repairError
        );
      }

      // 修復後のJSONを解析
      const parsed = JSON.parse(fixedText);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.words)
      ) {
        throw new Error(
          "Invalid JSON structure: missing or invalid 'words' array"
        );
      }

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
