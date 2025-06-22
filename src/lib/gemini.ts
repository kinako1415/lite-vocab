import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// 環境変数から API キーを取得
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Gemini API key is not set in environment variables");
}
// API クライアント初期化
const genAI = new GoogleGenerativeAI(apiKey);

export const translateWord = async (
  text: string,
  targetLanguage: string = "ja"
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // 言語コードに基づいて言語名を取得
    const getLanguageName = (langCode: string): string => {
      const languages: { [key: string]: string } = {
        ja: "Japanese",
        en: "English",
        ko: "Korean",
        zh: "Chinese",
        "zh-cn": "Chinese (Simplified)",
        "zh-tw": "Chinese (Traditional)",
        es: "Spanish",
        fr: "French",
        de: "German",
        it: "Italian",
        pt: "Portuguese",
        ru: "Russian",
        ar: "Arabic",
        hi: "Hindi",
        th: "Thai",
        vi: "Vietnamese",
      };
      return languages[langCode.toLowerCase()] || "Japanese";
    };

    const targetLangName = getLanguageName(targetLanguage);

    const prompt = `Translate the following word to ${targetLangName}. Provide only the translation result without any additional explanation.
Word: ${text}`;

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
      return "❌ This model is not available with the current API key (possibly exceeded free quota).";
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

// 多言語対応のプロンプト生成
const getMultilingualPrompts = (targetLanguage: string) => {
  const prompts: { [key: string]: {
    repairInstruction: string;
    importantNote: string;
    repairRules: string[];
    incompleteJsonLabel: string;
  } } = {
    ja: {
      repairInstruction: "以下の不完全なJSONを修復してください。",
      importantNote: "【重要】このJSONは語彙単語とその意味のリストを含んでいます。以下の形式でのみ返してください：",
      repairRules: [
        "末尾の不完全なエントリーを削除",
        "すべてのエントリーに「word」と「meaning」が必要",
        "無効な文字とエスケープシーケンスを修正",
        "余分なカンマと括弧を削除",
        "純粋なJSONのみ返す（説明やマークダウンなし）",
        "文字列は二重引用符で囲む",
        "改行とタブ文字を適切にエスケープ"
      ],
      incompleteJsonLabel: "不完全なJSON："
    },
    en: {
      repairInstruction: "Please repair the following incomplete JSON.",
      importantNote: "【IMPORTANT】This JSON contains a list of vocabulary words and their meanings. Return ONLY in this format:",
      repairRules: [
        "Remove incomplete entries at the end",
        "Every entry must have both \"word\" and \"meaning\"",
        "Fix invalid characters and escape sequences",
        "Remove extra commas and brackets",
        "Return pure JSON only (no explanations or markdown)",
        "Strings must be enclosed in double quotes",
        "Properly escape newlines and tab characters"
      ],
      incompleteJsonLabel: "Incomplete JSON:"
    },
    ko: {
      repairInstruction: "다음의 불완전한 JSON을 수정해주세요.",
      importantNote: "【중요】이 JSON은 어휘 단어와 그 의미의 목록을 포함합니다. 다음 형식으로만 반환해주세요:",
      repairRules: [
        "끝부분의 불완전한 항목 제거",
        "모든 항목에 \"word\"와 \"meaning\"이 필요",
        "잘못된 문자와 이스케이프 시퀀스 수정",
        "불필요한 쉼표와 괄호 제거",
        "순수한 JSON만 반환 (설명이나 마크다운 없음)",
        "문자열은 이중 따옴표로 묶기",
        "개행과 탭 문자를 적절히 이스케이프"
      ],
      incompleteJsonLabel: "불완전한 JSON:"
    },
    zh: {
      repairInstruction: "请修复以下不完整的JSON。",
      importantNote: "【重要】此JSON包含词汇单词及其含义的列表。仅以以下格式返回：",
      repairRules: [
        "删除末尾的不完整条目",
        "每个条目必须同时包含\"word\"和\"meaning\"",
        "修复无效字符和转义序列",
        "删除多余的逗号和括号",
        "仅返回纯JSON（无说明或markdown）",
        "字符串必须用双引号括起来",
        "正确转义换行符和制表符"
      ],
      incompleteJsonLabel: "不完整的JSON："
    },
    es: {
      repairInstruction: "Por favor, repare el siguiente JSON incompleto.",
      importantNote: "【IMPORTANTE】Este JSON contiene una lista de palabras de vocabulario y sus significados. Devuelva SOLO en este formato:",
      repairRules: [
        "Eliminar entradas incompletas al final",
        "Cada entrada debe tener \"word\" y \"meaning\"",
        "Corregir caracteres inválidos y secuencias de escape",
        "Eliminar comas y corchetes extra",
        "Devolver solo JSON puro (sin explicaciones o markdown)",
        "Las cadenas deben estar entre comillas dobles",
        "Escapar correctamente saltos de línea y caracteres de tabulación"
      ],
      incompleteJsonLabel: "JSON incompleto:"
    },
    fr: {
      repairInstruction: "Veuillez réparer le JSON incomplet suivant.",
      importantNote: "【IMPORTANT】Ce JSON contient une liste de mots de vocabulaire et leurs significations. Retournez SEULEMENT dans ce format:",
      repairRules: [
        "Supprimer les entrées incomplètes à la fin",
        "Chaque entrée doit avoir \"word\" et \"meaning\"",
        "Corriger les caractères invalides et les séquences d'échappement",
        "Supprimer les virgules et crochets supplémentaires",
        "Retourner uniquement du JSON pur (pas d'explications ou markdown)",
        "Les chaînes doivent être entre guillemets doubles",
        "Échapper correctement les sauts de ligne et caractères de tabulation"
      ],
      incompleteJsonLabel: "JSON incomplet:"
    },
    de: {
      repairInstruction: "Bitte reparieren Sie das folgende unvollständige JSON.",
      importantNote: "【WICHTIG】Dieses JSON enthält eine Liste von Vokabelwörtern und deren Bedeutungen. Geben Sie NUR in diesem Format zurück:",
      repairRules: [
        "Unvollständige Einträge am Ende entfernen",
        "Jeder Eintrag muss \"word\" und \"meaning\" haben",
        "Ungültige Zeichen und Escape-Sequenzen reparieren",
        "Zusätzliche Kommas und Klammern entfernen",
        "Nur reines JSON zurückgeben (keine Erklärungen oder Markdown)",
        "Strings müssen in Anführungszeichen stehen",
        "Zeilenumbrüche und Tabulatoren richtig escapen"
      ],
      incompleteJsonLabel: "Unvollständiges JSON:"
    }
  };

  // デフォルトは英語
  return prompts[targetLanguage] || prompts.en;
};

// より強固なJSON修復機能
const repairJsonWithGemini = async (
  incompleteJson: string,
  targetLanguage: string = "en",
  attemptNumber: number = 1
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = getMultilingualPrompts(targetLanguage);
    
    const repairPrompt = `${prompt.repairInstruction}

${prompt.importantNote}

{"words":[{"word":"example","meaning":"meaning in target language"}]}

Repair rules:
${prompt.repairRules.map((rule: string, index: number) => `${index + 1}. ${rule}`).join('\n')}

${prompt.incompleteJsonLabel}
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
        throw new Error("Valid words array not found");
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
      throw new Error("words array not found");
    }

    console.log(
      `JSON repair successful (attempt ${attemptNumber}): extracted ${parsed.words.length} words`
    );
    return repairedJson;
  } catch (error) {
    console.error(`JSON repair error (attempt ${attemptNumber}):`, error);

    // 最大3回まで再試行
    if (attemptNumber < 3) {
      console.log(`Retrying JSON repair... (${attemptNumber + 1}/3)`);
      return repairJsonWithGemini(incompleteJson, targetLanguage, attemptNumber + 1);
    }

    throw new Error(`Failed to repair JSON (attempted ${attemptNumber} times)`);
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

export const extractWordsFromUrl = async (
  url: string,
  sourceLanguage: string = "auto",
  targetLanguage: string = "ja"
): Promise<WordInfo[]> => {
  console.log(
    `Starting word extraction: ${url} (${sourceLanguage} → ${targetLanguage})`
  );

  // 言語設定に基づいてプロンプトを生成
  const getLanguageInstructions = (sourceLang: string, targetLang: string) => {
    const languages: { [key: string]: string } = {
      auto: "auto-detect",
      en: "English",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ar: "Arabic",
      hi: "Hindi",
      th: "Thai",
      vi: "Vietnamese",
    };

    const sourceLanguageName = languages[sourceLang] || "auto-detect";
    const targetLanguageName = languages[targetLang] || "Japanese";

    // プロンプトの多言語対応
    const prompts: { [key: string]: {
      extractionInstruction: string;
      importantNote: string;
      extractionRules: string[];
      technicalInstructions: string[];
    } } = {
      ja: {
        extractionInstruction: sourceLang === "auto" 
          ? `以下のURLから重要な語彙単語とその意味を抽出してください。ソース言語を自動検出し、意味を${targetLanguageName}に翻訳してください。サイトの内容を理解し、その主題に関連する重要な単語のみを抽出してください。`
          : `以下のURLから${sourceLanguageName}の重要な語彙単語とその${targetLanguageName}の意味を抽出してください。サイトの内容を理解し、その主題に関連する重要な単語のみを抽出してください。`,
        importantNote: "【重要】以下の形式でのみJSONを返してください：",
        extractionRules: [
          "サイト上のテーブル、リスト、段落から語彙単語と意味のペアを抽出",
          "サイトの主題や内容に直接関連する単語のみを抽出（関連性の低い一般的な単語は除外）",
          "学習者にとって価値のある単語を優先（「the」「and」などの基本単語は除外）",
          "専門用語、キーコンセプト、特徴的な表現を優先して抽出",
          "各エントリーは「word」と「meaning」の両方を完全に含める",
          "純粋なJSONのみ返す（マークダウンや説明なし）",
          "サイトに実際に存在する単語のみ抽出（架空の単語は作らない）",
          "レスポンスが長くなる場合は、有効なJSONで終わらせる",
          "辞書や語彙リストの場合は、見出し語を「word」として抽出"
        ],
        technicalInstructions: [
          "ページ全体をスキャンし、サイトのテーマと内容を理解する",
          "サイトの主題を特定し、関連性の高い単語のみをフィルタリング",
          "動的コンテンツとAjax読み込みデータを含める",
          "非表示および見えない要素を含める",
          "テーブル形式、リスト形式、段落形式をサポート",
          "データが大きい場合は分割可能だが、各分割は有効なJSONで終了"
        ]
      },
      en: {
        extractionInstruction: sourceLang === "auto"
          ? `Extract important vocabulary words and their meanings from the following URL. Detect the source language automatically and translate meanings to ${targetLanguageName}. Understand the content of the site and extract only words that are relevant to the main topic.`
          : `Extract important ${sourceLanguageName} vocabulary words and their ${targetLanguageName} meanings from the following URL. Understand the content of the site and extract only words that are relevant to the main topic.`,
        importantNote: "【IMPORTANT】Return ONLY JSON in this format:",
        extractionRules: [
          "Extract vocabulary word and meaning pairs from tables, lists, and paragraphs on the site",
          "Extract ONLY words that are directly relevant to the site's main topic or content (exclude common words with low relevance)",
          "Prioritize words that have value for learners (exclude basic words like 'the', 'and', etc.)",
          "Prioritize technical terms, key concepts, and distinctive expressions",
          "Each entry must be complete with both \"word\" and \"meaning\"",
          "Return pure JSON only (no markdown or explanations)",
          "Extract only words that actually exist on the site (don't create imaginary words)",
          "If response becomes long, ensure it ends with valid JSON",
          "For dictionary or vocabulary list sites, extract headwords as 'word'"
        ],
        technicalInstructions: [
          "Scan the entire page and understand the site's theme and content",
          "Identify the site's main topic and filter for high-relevance vocabulary only",
          "Include dynamic content and Ajax-loaded data",
          "Include hidden and invisible elements",
          "Support table format, list format, and paragraph format",
          "If data is large, it can be split but each split must end with valid JSON"
        ]
      },
      ko: {
        extractionInstruction: sourceLang === "auto"
          ? `다음 URL에서 중요한 어휘 단어와 의미를 추출하세요. 소스 언어를 자동으로 감지하고 의미를 ${targetLanguageName}로 번역하세요. 사이트의 내용을 이해하고 주제와 관련된 중요한 단어만 추출하세요.`
          : `다음 URL에서 중요한 ${sourceLanguageName} 어휘 단어와 ${targetLanguageName} 의미를 추출하세요. 사이트의 내용을 이해하고 주제와 관련된 중요한 단어만 추출하세요.`,
        importantNote: "【중요】다음 형식으로만 JSON을 반환하세요:",
        extractionRules: [
          "사이트의 테이블, 목록, 단락에서 어휘 단어와 의미 쌍 추출",
          "사이트의 주제나 내용과 직접 관련된 단어만 추출 (관련성이 낮은 일반적인 단어 제외)",
          "학습자에게 가치 있는 단어 우선 ('the', 'and' 등과 같은 기본 단어 제외)",
          "전문 용어, 핵심 개념 및 특징적인 표현을 우선 추출",
          "각 항목은 \"word\"와 \"meaning\" 모두 완전히 포함",
          "순수한 JSON만 반환 (마크다운이나 설명 없음)",
          "사이트에 실제로 존재하는 단어만 추출 (가상의 단어 생성 금지)",
          "응답이 길어지면 유효한 JSON으로 끝내기",
          "사전이나 어휘 목록 사이트의 경우 표제어를 'word'로 추출"
        ],
        technicalInstructions: [
          "전체 페이지를 스캔하고 사이트의 테마와 내용 이해",
          "사이트의 주제를 파악하고 관련성이 높은 단어만 필터링",
          "동적 콘텐츠와 Ajax 로드 데이터 포함",
          "숨겨진 요소와 보이지 않는 요소 포함",
          "테이블 형식, 목록 형식, 단락 형식 지원",
          "데이터가 크면 분할 가능하지만 각 분할은 유효한 JSON으로 종료"
        ]
      },
      zh: {
        extractionInstruction: sourceLang === "auto"
          ? `从以下URL提取重要的词汇和它们的含义。自动检测源语言并将含义翻译成${targetLanguageName}。理解网站内容，仅提取与主题相关的重要单词。`
          : `从以下URL提取重要的${sourceLanguageName}词汇和它们的${targetLanguageName}含义。理解网站内容，仅提取与主题相关的重要单词。`,
        importantNote: "【重要】仅以以下格式返回JSON：",
        extractionRules: [
          "从网站的表格、列表和段落中提取词汇和含义对",
          "仅提取与网站主题或内容直接相关的单词（排除相关性低的常见词）",
          "优先提取对学习者有价值的单词（排除'the'、'and'等基础词汇）",
          "优先提取专业术语、关键概念和特色表达",
          "每个条目必须同时完整包含\"word\"和\"meaning\"",
          "仅返回纯JSON（无Markdown或解释）",
          "仅提取网站上实际存在的单词（不创造虚构单词）",
          "如果响应变长，确保以有效的JSON结尾",
          "对于词典或词汇列表网站，将标题词提取为'word'"
        ],
        technicalInstructions: [
          "扫描整个页面并理解网站主题和内容",
          "识别网站主题并仅过滤出高相关性的词汇",
          "包括动态内容和Ajax加载的数据",
          "包括隐藏和不可见元素",
          "支持表格格式、列表格式和段落格式",
          "如果数据较大，可以分割，但每个分割必须以有效的JSON结尾"
        ]
      }
    };

    const prompt = prompts[targetLang] || prompts.en;

    return {
      sourceLanguageName,
      targetLanguageName,
      extractionPrompt: prompt.extractionInstruction,
      importantNote: prompt.importantNote,
      extractionRules: prompt.extractionRules,
      technicalInstructions: prompt.technicalInstructions
    };
  };

  const { targetLanguageName, extractionPrompt, importantNote, extractionRules } = getLanguageInstructions(
    sourceLanguage,
    targetLanguage
  );

  // まず小さなサンプルで抽出を試す
  const samplePrompt = `${extractionPrompt}
URL: ${url}

${importantNote}
{"words":[{"word":"agree","meaning":"meaning in ${targetLanguageName}"}]}

Extraction rules:
1. Extract vocabulary word and meaning pairs from tables, lists, or content on the site
2. Extract only the first 20 entries as a sample
3. Focus ONLY on words that are directly relevant to the main topic of the site
4. Prioritize specialized terminology, key concepts, and characteristic expressions
5. Exclude common words, general terms, and words with low learning value
6. Each entry must contain both "word" and "meaning"
7. Return pure JSON only (no markdown or explanations)
8. Exclude incomplete entries
9. Extract only words that actually exist on the site (don't create imaginary words)
10. If source language is auto-detect, identify the language and extract accordingly`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // サンプル抽出
    console.log("Executing sample extraction...");
    const sampleResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: samplePrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    const sampleResponse = sampleResult.response.text().trim();
    console.log("Sample response:", sampleResponse.substring(0, 200) + "...");

    // サンプルのJSONを解析して形式を確認
    let sampleWords: WordInfo[] = [];
    try {
      const cleanSample = basicJsonRepair(sampleResponse);
      const parsedSample = JSON.parse(cleanSample);
      sampleWords = parsedSample.words || [];
      console.log(`Sample extraction successful: ${sampleWords.length} words`);
    } catch (sampleError) {
      console.error("Error in sample extraction:", sampleError);
      // サンプルが失敗した場合は基本的な修復を試す
      try {
        const repairedSample = await repairJsonWithGemini(sampleResponse, targetLanguage);
        const parsedSample = JSON.parse(repairedSample);
        sampleWords = parsedSample.words || [];
        console.log(`Sample repair successful: ${sampleWords.length} words`);
      } catch (repairError) {
        console.error("Sample repair also failed:", repairError);
        throw new Error(
          "Sample extraction failed. Please check the site format."
        );
      }
    }

    if (sampleWords.length === 0) {
      throw new Error(
        "Could not extract words from the site. Please check the site format."
      );
    }

    // 全体抽出（分割を考慮したプロンプト）
    console.log("Executing full extraction...");
    const { technicalInstructions } = getLanguageInstructions(sourceLanguage, targetLanguage);
    
    const fullPrompt = `${extractionPrompt} Extract ALL vocabulary words and their meanings from the following URL and return in pure JSON format.
URL: ${url}

${importantNote}
{"words":[{"word":"agree","meaning":"meaning in ${targetLanguageName}"}]}

Extraction rules:
${extractionRules.map((rule: string, index: number) => `${index + 1}. ${rule}`).join('\n')}

Technical instructions:
${technicalInstructions.map((instruction: string) => `- ${instruction}`).join('\n')}`;

    const fullResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192, // より大きなレスポンスを許可
      },
    });

    const fullResponse = fullResult.response.text().trim();
    console.log("Full response length:", fullResponse.length);
    console.log("Full response start:", fullResponse.substring(0, 100) + "...");
    console.log(
      "Full response end:",
      "..." + fullResponse.substring(Math.max(0, fullResponse.length - 100))
    );

    // 段階的なJSON解析
    let allWords: WordInfo[] = [];

    try {
      // まず基本修復を試す
      const basicFixed = basicJsonRepair(fullResponse);
      console.log("Length after basic repair:", basicFixed.length);

      const parsed = JSON.parse(basicFixed);
      allWords = parsed.words || [];
      console.log(
        `Basic repair successful: extracted ${allWords.length} words`
      );
    } catch (basicError) {
      console.error("Error in basic repair:", basicError);

      try {
        // Geminiによる修復を試す
        console.log("Trying Gemini repair...");
        const geminiFixed = await repairJsonWithGemini(fullResponse, targetLanguage);
        const parsed = JSON.parse(geminiFixed);
        allWords = parsed.words || [];
        console.log(
          `Gemini repair successful: extracted ${allWords.length} words`
        );
      } catch (geminiError) {
        console.error("Error in Gemini repair:", geminiError);

        // 最後の手段：部分的な抽出
        console.log("Trying partial extraction...");
        try {
          const partialResponse = fullResponse.substring(0, 3000); // 安全な範囲で切り取り
          const partialFixed = basicJsonRepair(partialResponse);
          const parsed = JSON.parse(partialFixed);
          allWords = parsed.words || [];
          console.log(
            `Partial extraction successful: extracted ${allWords.length} words (partial)`
          );
        } catch (partialError) {
          console.error("Partial extraction also failed:", partialError);

          // サンプル結果を返す
          console.log("Returning sample results");
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
