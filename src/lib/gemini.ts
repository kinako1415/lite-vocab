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

// より強固なJSON修復機能
const repairJsonWithGemini = async (
  incompleteJson: string,
  attemptNumber: number = 1
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const repairPrompt = `以下の不完全なJSONを修復してください。

【重要】このJSONは英単語と日本語の意味のリストです。以下の形式でのみ返してください：

{"words":[{"word":"example","meaning":"例"}]}

修復ルール：
1. 最後のエントリーが不完全な場合は除外してください
2. すべてのエントリーは必ず "word" と "meaning" の両方を持つこと
3. 不正な文字やエスケープシーケンスを修正してください
4. 余分なカンマや波括弧を除去してください
5. 純粋なJSONのみを返してください（説明文やマークダウン記法なし）
6. 文字列は必ずダブルクォートで囲んでください
7. 改行文字やタブ文字を適切にエスケープしてください

不完全なJSON:
${incompleteJson.substring(0, 4000)}${
      incompleteJson.length > 4000 ? "..." : ""
    }`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: repairPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    });

    const response = await result.response;
    let repairedJson = response
      .text()
      .trim()
      .replace(/```json\n?|\n?```/g, "")
      .replace(/^[^{]*/, "") // JSON開始前の余分なテキストを除去
      .replace(/[^}]*$/, "}") // JSON終了後の余分なテキストを除去
      .trim();

    // 基本的な構造確認と修正
    if (!repairedJson.startsWith('{"words":[')) {
      const wordsIndex = repairedJson.indexOf('"words":[');
      if (wordsIndex !== -1) {
        repairedJson = '{"words":[' + repairedJson.substring(wordsIndex + 8);
      } else {
        throw new Error("有効な words 配列が見つかりません");
      }
    }

    if (!repairedJson.endsWith("]}")) {
      // 最後の完全なエントリーまでを取得
      const lastCompleteEntry = repairedJson.lastIndexOf('"}');
      if (lastCompleteEntry !== -1) {
        repairedJson = repairedJson.substring(0, lastCompleteEntry + 2) + "]}";
      } else {
        repairedJson = '{"words":[]}';
      }
    }

    // JSON構文の検証
    const parsed = JSON.parse(repairedJson);
    if (!parsed.words || !Array.isArray(parsed.words)) {
      throw new Error("words配列が見つかりません");
    }

    console.log(
      `JSON修復成功 (試行${attemptNumber}): ${parsed.words.length}個の単語を抽出`
    );
    return repairedJson;
  } catch (error) {
    console.error(`JSON修復エラー (試行${attemptNumber}):`, error);

    // 最大3回まで再試行
    if (attemptNumber < 3) {
      console.log(`JSON修復を再試行します... (${attemptNumber + 1}/3)`);
      return repairJsonWithGemini(incompleteJson, attemptNumber + 1);
    }

    throw new Error(`JSONの修復に失敗しました (${attemptNumber}回試行)`);
  }
};

// 基本的なJSON修復（Geminiを使わない軽量版）
const basicJsonRepair = (text: string): string => {
  let fixed = text.trim();

  // マークダウン記法を除去
  fixed = fixed.replace(/```json\n?|\n?```/g, "").trim();

  // JSON開始前の余分なテキストを除去
  const jsonStart = fixed.indexOf('{"words":[');
  if (jsonStart > 0) {
    fixed = fixed.substring(jsonStart);
  } else if (!fixed.startsWith('{"words":[')) {
    fixed = '{"words":[' + fixed;
  }

  // 不完全な最後のエントリーを除去
  const lastCompleteEntry = fixed.lastIndexOf('"}');
  if (lastCompleteEntry !== -1) {
    fixed = fixed.substring(0, lastCompleteEntry + 2);
    if (!fixed.endsWith("]}")) {
      fixed += "]}";
    }
  } else {
    fixed = '{"words":[]}';
  }

  // 余分なカンマを除去
  fixed = fixed.replace(/,(\s*[\]}])/g, "$1");

  return fixed;
};

export const extractWordsFromUrl = async (url: string): Promise<WordInfo[]> => {
  console.log(`単語抽出を開始: ${url}`);

  // まず小さなサンプルで抽出を試す
  const samplePrompt = `以下のURLから英単語と日本語の意味のリストのサンプル（最初の20個程度）を抽出し、純粋なJSON形式で返してください。
URL: ${url}

【重要】以下の形式のJSONのみを返してください：
{"words":[{"word":"agree","meaning":"賛成する"}]}

抽出ルール：
1. サイト内の表やリストから英単語と日本語の意味のペアを抽出
2. 最初の20個程度のエントリーのみを抽出
3. 各エントリーは必ず "word" と "meaning" の両方を含む
4. 純粋なJSONのみを返す（マークダウン記法や説明文なし）
5. 不完全なエントリーは除外
6. サイトに存在する単語のみを抽出（想像で単語を作らない）`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // サンプル抽出
    console.log("サンプル抽出を実行中...");
    const sampleResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: samplePrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    const sampleResponse = sampleResult.response.text().trim();
    console.log(
      "サンプルレスポンス:",
      sampleResponse.substring(0, 200) + "..."
    );

    // サンプルのJSONを解析して形式を確認
    let sampleWords: WordInfo[] = [];
    try {
      const cleanSample = basicJsonRepair(sampleResponse);
      const parsedSample = JSON.parse(cleanSample);
      sampleWords = parsedSample.words || [];
      console.log(`サンプル抽出成功: ${sampleWords.length}個の単語`);
    } catch (sampleError) {
      console.error("サンプル抽出でエラー:", sampleError);
      // サンプルが失敗した場合は基本的な修復を試す
      try {
        const repairedSample = await repairJsonWithGemini(sampleResponse);
        const parsedSample = JSON.parse(repairedSample);
        sampleWords = parsedSample.words || [];
        console.log(`サンプル修復成功: ${sampleWords.length}個の単語`);
      } catch (repairError) {
        console.error("サンプル修復も失敗:", repairError);
        throw new Error(
          "サンプル抽出に失敗しました。サイトの形式を確認してください。"
        );
      }
    }

    if (sampleWords.length === 0) {
      throw new Error(
        "サイトから単語を抽出できませんでした。サイトの形式を確認してください。"
      );
    }

    // 全体抽出（分割を考慮したプロンプト）
    console.log("全体抽出を実行中...");
    const fullPrompt = `以下のURLから英単語と日本語の意味のリストをすべて抽出し、純粋なJSON形式で返してください。
URL: ${url}

【重要】以下の形式のJSONのみを返してください：
{"words":[{"word":"agree","meaning":"賛成する"}]}

抽出ルール：
1. サイト内のすべての表、リスト、段落から英単語と日本語の意味のペアを抽出
2. サイト内のすべての単語を漏れなく抽出（300個以上ある場合もすべて含める）
3. 各エントリーは必ず完全な形で出力（"word"と"meaning"の両方を含む）
4. 純粋なJSONのみを返す（マークダウン記法や説明文なし）
5. 最後まで完全に抽出を完了する
6. サイトに存在する単語のみを抽出（想像で単語を作らない）
7. レスポンスが長くなる場合は、必ず有効なJSONで終わること

技術的指示：
- ページ全体をスキャンし、すべてのHTMLコンテンツを解析
- 動的コンテンツやAjaxで読み込まれるデータも含める
- 隠れた要素や非表示の要素も含める
- 表形式、リスト形式、段落形式すべてに対応
- データが大量の場合は分割しても構わないが、各分割は有効なJSONで終わること`;

    const fullResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192, // より大きなレスポンスを許可
      },
    });

    const fullResponse = fullResult.response.text().trim();
    console.log("フルレスポンス長:", fullResponse.length);
    console.log("フルレスポンス先頭:", fullResponse.substring(0, 100) + "...");
    console.log(
      "フルレスポンス末尾:",
      "..." + fullResponse.substring(Math.max(0, fullResponse.length - 100))
    );

    // 段階的なJSON解析
    let allWords: WordInfo[] = [];

    try {
      // まず基本修復を試す
      const basicFixed = basicJsonRepair(fullResponse);
      console.log("基本修復後の長さ:", basicFixed.length);

      const parsed = JSON.parse(basicFixed);
      allWords = parsed.words || [];
      console.log(`基本修復成功: ${allWords.length}個の単語を抽出`);
    } catch (basicError) {
      console.error("基本修復でエラー:", basicError);

      try {
        // Geminiによる修復を試す
        console.log("Geminiによる修復を試行中...");
        const geminiFixed = await repairJsonWithGemini(fullResponse);
        const parsed = JSON.parse(geminiFixed);
        allWords = parsed.words || [];
        console.log(`Gemini修復成功: ${allWords.length}個の単語を抽出`);
      } catch (geminiError) {
        console.error("Gemini修復でエラー:", geminiError);

        // 最後の手段：部分的な抽出
        console.log("部分的な抽出を試行中...");
        try {
          const partialResponse = fullResponse.substring(0, 3000); // 安全な範囲で切り取り
          const partialFixed = basicJsonRepair(partialResponse);
          const parsed = JSON.parse(partialFixed);
          allWords = parsed.words || [];
          console.log(
            `部分抽出成功: ${allWords.length}個の単語を抽出（部分的）`
          );
        } catch (partialError) {
          console.error("部分抽出も失敗:", partialError);

          // サンプル結果を返す
          console.log("サンプル結果を返します");
          allWords = sampleWords;
        }
      }
    }

    // 結果の検証とフィルタリング
    const validWords = allWords.filter((entry) => {
      if (!entry || typeof entry !== "object") return false;
      if (typeof entry.word !== "string" || !entry.word.trim()) return false;
      if (typeof entry.meaning !== "string" || !entry.meaning.trim())
        return false;
      return true;
    });

    if (validWords.length === 0) {
      throw new Error("有効な単語エントリーが見つかりませんでした");
    }

    console.log(`最終結果: ${validWords.length}個の有効な単語を抽出`);

    // 重複を除去
    const uniqueWords = validWords.filter(
      (word, index, array) =>
        array.findIndex(
          (w) => w.word.toLowerCase() === word.word.toLowerCase()
        ) === index
    );

    console.log(`重複除去後: ${uniqueWords.length}個のユニークな単語`);
    return uniqueWords;
  } catch (error) {
    console.error("単語抽出でエラー:", error);
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
