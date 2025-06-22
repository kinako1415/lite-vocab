import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import * as cheerio from "cheerio";

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
  const prompts: {
    [key: string]: {
      repairInstruction: string;
      importantNote: string;
      repairRules: string[];
      incompleteJsonLabel: string;
    };
  } = {
    ja: {
      repairInstruction: "以下の不完全なJSONを修復してください。",
      importantNote:
        "【重要】このJSONは語彙単語とその意味のリストを含んでいます。以下の形式でのみ返してください：",
      repairRules: [
        "末尾の不完全なエントリーを削除",
        "すべてのエントリーに「word」と「meaning」が必要",
        "無効な文字とエスケープシーケンスを修正",
        "余分なカンマと括弧を削除",
        "純粋なJSONのみ返す（説明やマークダウンなし）",
        "文字列は二重引用符で囲む",
        "改行とタブ文字を適切にエスケープ",
      ],
      incompleteJsonLabel: "不完全なJSON：",
    },
    en: {
      repairInstruction: "Please repair the following incomplete JSON.",
      importantNote:
        "【IMPORTANT】This JSON contains a list of vocabulary words and their meanings. Return ONLY in this format:",
      repairRules: [
        "Remove incomplete entries at the end",
        'Every entry must have both "word" and "meaning"',
        "Fix invalid characters and escape sequences",
        "Remove extra commas and brackets",
        "Return pure JSON only (no explanations or markdown)",
        "Strings must be enclosed in double quotes",
        "Properly escape newlines and tab characters",
      ],
      incompleteJsonLabel: "Incomplete JSON:",
    },
    ko: {
      repairInstruction: "다음의 불완전한 JSON을 수정해주세요.",
      importantNote:
        "【중요】이 JSON은 어휘 단어와 그 의미의 목록을 포함합니다. 다음 형식으로만 반환해주세요:",
      repairRules: [
        "끝부분의 불완전한 항목 제거",
        '모든 항목에 "word"와 "meaning"이 필요',
        "잘못된 문자와 이스케이프 시퀀스 수정",
        "불필요한 쉼표와 괄호 제거",
        "순수한 JSON만 반환 (설명이나 마크다운 없음)",
        "문자열은 이중 따옴표로 묶기",
        "개행과 탭 문자를 적절히 이스케이프",
      ],
      incompleteJsonLabel: "불완전한 JSON:",
    },
    zh: {
      repairInstruction: "请修复以下不完整的JSON。",
      importantNote:
        "【重要】此JSON包含词汇单词及其含义的列表。仅以以下格式返回：",
      repairRules: [
        "删除末尾的不完整条目",
        '每个条目必须同时包含"word"和"meaning"',
        "修复无效字符和转义序列",
        "删除多余的逗号和括号",
        "仅返回纯JSON（无说明或markdown）",
        "字符串必须用双引号括起来",
        "正确转义换行符和制表符",
      ],
      incompleteJsonLabel: "不完整的JSON：",
    },
    es: {
      repairInstruction: "Por favor, repare el siguiente JSON incompleto.",
      importantNote:
        "【IMPORTANTE】Este JSON contiene una lista de palabras de vocabulario y sus significados. Devuelva SOLO en este formato:",
      repairRules: [
        "Eliminar entradas incompletas al final",
        'Cada entrada debe tener "word" y "meaning"',
        "Corregir caracteres inválidos y secuencias de escape",
        "Eliminar comas y corchetes extra",
        "Devolver solo JSON puro (sin explicaciones o markdown)",
        "Las cadenas deben estar entre comillas dobles",
        "Escapar correctamente saltos de línea y caracteres de tabulación",
      ],
      incompleteJsonLabel: "JSON incompleto:",
    },
    fr: {
      repairInstruction: "Veuillez réparer le JSON incomplet suivant.",
      importantNote:
        "【IMPORTANT】Ce JSON contient une liste de mots de vocabulaire et leurs significations. Retournez SEULEMENT dans ce format:",
      repairRules: [
        "Supprimer les entrées incomplètes à la fin",
        'Chaque entrée doit avoir "word" et "meaning"',
        "Corriger les caractères invalides et les séquences d'échappement",
        "Supprimer les virgules et crochets supplémentaires",
        "Retourner uniquement du JSON pur (pas d'explications ou markdown)",
        "Les chaînes doivent être entre guillemets doubles",
        "Échapper correctement les sauts de ligne et caractères de tabulation",
      ],
      incompleteJsonLabel: "JSON incomplet:",
    },
    de: {
      repairInstruction:
        "Bitte reparieren Sie das folgende unvollständige JSON.",
      importantNote:
        "【WICHTIG】Dieses JSON enthält eine Liste von Vokabelwörtern und deren Bedeutungen. Geben Sie NUR in diesem Format zurück:",
      repairRules: [
        "Unvollständige Einträge am Ende entfernen",
        'Jeder Eintrag muss "word" und "meaning" haben',
        "Ungültige Zeichen und Escape-Sequenzen reparieren",
        "Zusätzliche Kommas und Klammern entfernen",
        "Nur reines JSON zurückgeben (keine Erklärungen oder Markdown)",
        "Strings müssen in Anführungszeichen stehen",
        "Zeilenumbrüche und Tabulatoren richtig escapen",
      ],
      incompleteJsonLabel: "Unvollständiges JSON:",
    },
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
${prompt.repairRules
  .map((rule: string, index: number) => `${index + 1}. ${rule}`)
  .join("\n")}

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
      return repairJsonWithGemini(
        incompleteJson,
        targetLanguage,
        attemptNumber + 1
      );
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

// NEW FUNCTION
const getDomStructureHints = async (url: string): Promise<string[]> => {
  try {
    console.log(`Fetching HTML for DOM analysis: ${url}`);
    // Use a user-agent to avoid simple bot blockers
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    if (!response.ok) {
      console.error(
        `Failed to fetch URL for DOM analysis: ${response.statusText}`
      );
      return [];
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const selectorScores: { [key: string]: number } = {};

    // Score selectors based on tag, class, and content
    $("*").each((i, el) => {
      const element = $(el);
      let score = 0;
      const tagName = el.tagName.toLowerCase();

      // Score based on tag type
      if (["ul", "ol", "dl", "table"].includes(tagName)) score += 5;
      if (["article", "main"].includes(tagName)) score += 2;
      if (["section", "div"].includes(tagName)) score += 1;

      // Score based on class names
      const classes = (element.attr("class") || "").toLowerCase();
      if (/word|vocab|term|lemma|lexicon/.test(classes)) score += 10;
      if (/list|grid|item|entry/.test(classes)) score += 5;
      if (/lesson|quiz|card/.test(classes)) score += 5;

      // Score based on having multiple children (likely a list)
      if (element.children().length > 3) score += 3;

      // Combine tag and class for a more specific selector
      const classSelector = classes
        .split(" ")
        .filter((c) => c)
        .map((c) => `.${c}`)
        .join("");
      const fullSelector = `${tagName}${classSelector}`;

      if (score > 0) {
        selectorScores[fullSelector] =
          (selectorScores[fullSelector] || 0) + score;
      }
    });

    // Get the top-scoring selectors
    const hints = Object.entries(selectorScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 5) // Take top 5
      .map(([selector]) => selector);

    console.log("Generated DOM hints:", hints);
    return hints;
  } catch (error) {
    console.error("Error during DOM analysis:", error);
    return [];
  }
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
    const prompts: {
      [key: string]: {
        extractionInstruction: string;
        importantNote: string;
        extractionRules: string[];
        technicalInstructions: string[];
      };
    } = {
      ja: {
        extractionInstruction:
          sourceLang === "auto"
            ? `以下のURLから学習用として紹介されている**外国語の単語のみ**を抽出してください。ソース言語を自動検出し、意味を${targetLanguageName}に翻訳してください。`
            : `以下のURLから学習用として紹介されている**${sourceLanguageName}の単語のみ**とその${targetLanguageName}の意味を抽出してください。`,
        importantNote: "【重要】以下の形式でのみJSONを返してください：",
        extractionRules: [
          "**単一の単語のみ**を対象（複合語・慣用句・文章は除外）",
          "**学習コンテンツ内で明示的に教える単語**のみ抽出（記事の文章中の語は除外）",
          "語学学習サイト：レッスン内容、単語カード、語彙リスト内の単語",
          "ニュースサイト：語彙解説コーナー、難単語の注釈付き部分の単語",
          "ブログ・教材サイト：語彙学習セクション、単語説明部分の単語",
          "辞書・語彙サイト：見出し語として掲載されている単語",
          "【除外対象】ナビゲーション、広告、メニュー、サイト名、著者名、日付",
          "【除外対象】基本語（the, and, is, が, の, と, で等）",
          "【除外対象】サイトのUI用語（ログイン、検索、ホーム等）",
          "【除外対象】一般的な文章内での単語（学習対象として特別に示されていない語）",
          "各エントリーは「word」（単語）と「meaning」（意味）の両方を完全に含める",
          "純粋なJSONのみ返す（マークダウンや説明なし）",
        ],
        technicalInstructions: [
          "学習コンテンツの特定：<article>、<main>、.vocabulary、.wordlist、.lesson等のタグ・クラス内を優先",
          "単語と意味のペア識別：定義、翻訳、例文が併記されている単語を抽出",
          "学習レベル表示のある単語：初級、中級、TOEIC、JLPT等のレベル表示がある語彙",
          "語彙学習の文脈：「今日の単語」「重要単語」「キーワード」等で紹介される語",
          "フラッシュカード形式：単語カード、クイズ形式で提示されている語彙",
          "語彙注釈：本文中で＊や※で注釈説明されている専門用語・難語",
        ],
      },
      en: {
        extractionInstruction:
          sourceLang === "auto"
            ? `Extract ONLY the **foreign language vocabulary words** that are explicitly taught as learning content on the following URL. Detect the source language automatically and translate meanings to ${targetLanguageName}.`
            : `Extract ONLY the **${sourceLanguageName} vocabulary words** that are explicitly taught as learning content on the following URL and their ${targetLanguageName} meanings.`,
        importantNote: "【IMPORTANT】Return ONLY JSON in this format:",
        extractionRules: [
          "Target **single words only** (exclude compound phrases, idioms, sentences)",
          "Extract ONLY words **explicitly taught in educational content** (exclude words from general article text)",
          "Language learning sites: words from lessons, flashcards, vocabulary lists",
          "News sites: words from vocabulary explanation sections, annotated difficult words",
          "Blog/educational sites: words from vocabulary learning sections, word explanation parts",
          "Dictionary/vocabulary sites: headwords listed as entries",
          "【EXCLUDE】Navigation menus, advertisements, buttons, site names, author names, dates",
          "【EXCLUDE】Basic words (the, and, is, a, of, etc.)",
          "【EXCLUDE】Site UI terms (login, search, home, etc.)",
          "【EXCLUDE】General words in ordinary text (not specifically marked for learning)",
          'Each entry must be complete with both "word" and "meaning"',
          "Return pure JSON only (no markdown or explanations)",
        ],
        technicalInstructions: [
          "Identify learning content: prioritize <article>, <main>, .vocabulary, .wordlist, .lesson tags/classes",
          "Word-meaning pair identification: extract words with accompanying definitions, translations, examples",
          "Level-marked vocabulary: words with difficulty indicators (beginner, intermediate, TOEIC, etc.)",
          "Learning context vocabulary: words introduced as 'word of the day', 'key terms', 'important vocabulary'",
          "Flashcard format: vocabulary presented in card/quiz format",
          "Annotated vocabulary: specialized/difficult terms marked with * or footnotes in main text",
        ],
      },
      ko: {
        extractionInstruction:
          sourceLang === "auto"
            ? `다음 URL에서 학습 콘텐츠로 명시적으로 교육되는 **외국어 어휘 단어만**을 추출하세요. 소스 언어를 자동으로 감지하고 의미를 ${targetLanguageName}로 번역하세요.`
            : `다음 URL에서 학습 콘텐츠로 명시적으로 교육되는 **${sourceLanguageName} 어휘 단어만**과 그 ${targetLanguageName} 의미를 추출하세요.`,
        importantNote: "【중요】다음 형식으로만 JSON을 반환하세요:",
        extractionRules: [
          "**단일 단어만**을 대상으로 하세요 (복합구, 관용구, 문장 제외)",
          "**교육 콘텐츠에서 명시적으로 가르치는 단어만** 추출 (일반 기사 텍스트의 단어 제외)",
          "언어 학습 사이트: 레슨 내용, 플래시카드, 어휘 목록의 단어",
          "뉴스 사이트: 어휘 설명 섹션, 주석이 달린 어려운 단어",
          "블로그/교육 사이트: 어휘 학습 섹션, 단어 설명 부분의 단어",
          "사전/어휘 사이트: 표제어로 등재된 단어",
          "【제외 대상】내비게이션, 광고, 버튼, 사이트명, 작성자명, 날짜",
          "【제외 대상】기본 단어 (the, and, is, 는, 의, 와, 에 등)",
          "【제외 대상】사이트 UI 용어 (로그인, 검색, 홈 등)",
          "【제외 대상】일반 텍스트의 단어 (학습 대상으로 특별히 표시되지 않은 어휘)",
          '각 항목은 "word"(단어)와 "meaning"(의미) 모두 완전히 포함',
          "순수한 JSON만 반환 (마크다운이나 설명 없음)",
        ],
        technicalInstructions: [
          "학습 콘텐츠 식별: <article>, <main>, .vocabulary, .wordlist, .lesson 태그/클래스 우선",
          "단어-의미 쌍 식별: 정의, 번역, 예문이 함께 제시된 단어 추출",
          "레벨 표시 어휘: 난이도 표시가 있는 단어 (초급, 중급, TOEIC 등)",
          "학습 맥락 어휘: '오늘의 단어', '핵심 용어', '중요 어휘'로 소개되는 어휘",
          "플래시카드 형식: 카드/퀴즈 형태로 제시되는 어휘",
          "주석 어휘: 본문에서 * 또는 각주로 표시된 전문/어려운 용어",
        ],
      },
      zh: {
        extractionInstruction:
          sourceLang === "auto"
            ? `从以下URL中提取作为学习内容明确教授的**外语词汇单词**。自动检测源语言并将含义翻译成${targetLanguageName}。`
            : `从以下URL中提取作为学习内容明确教授的**${sourceLanguageName}词汇单词**及其${targetLanguageName}含义。`,
        importantNote: "【重要】仅以以下格式返回JSON：",
        extractionRules: [
          "仅针对**单个单词**（排除复合短语、成语、句子）",
          "仅提取**教育内容中明确教授的单词**（排除一般文章文本中的词汇）",
          "语言学习网站：课程内容、单词卡、词汇表中的单词",
          "新闻网站：词汇解释部分、注释的难词",
          "博客/教育网站：词汇学习部分、单词解释部分的单词",
          "词典/词汇网站：作为条目列出的标题词",
          "【排除对象】导航菜单、广告、按钮、网站名、作者名、日期",
          "【排除对象】基础词汇（the, and, is, 的, 是, 和, 在等）",
          "【排除对象】网站UI术语（登录、搜索、主页等）",
          "【排除对象】普通文本中的词汇（未特别标记为学习对象的词汇）",
          '每个条目必须同时完整包含"word"（单词）和"meaning"（含义）',
          "仅返回纯JSON（无Markdown或解释）",
        ],
        technicalInstructions: [
          "识别学习内容：优先处理<article>、<main>、.vocabulary、.wordlist、.lesson标签/类",
          "单词-含义配对识别：提取伴有定义、翻译、例句的单词",
          "标注级别的词汇：带有难度指示的单词（初级、中级、TOEIC等）",
          "学习语境词汇：以'今日单词'、'关键术语'、'重要词汇'介绍的词汇",
          "闪卡格式：以卡片/测验形式呈现的词汇",
          "注释词汇：文本中用*或脚注标记的专业/难词",
        ],
      },
      es: {
        extractionInstruction:
          sourceLang === "auto"
            ? `Extraiga ÚNICAMENTE las **palabras de vocabulario en idioma extranjero** que se enseñan explícitamente como contenido de aprendizaje en la siguiente URL. Detecte automáticamente el idioma fuente y traduzca los significados al ${targetLanguageName}.`
            : `Extraiga ÚNICAMENTE las **palabras de vocabulario en ${sourceLanguageName}** que se enseñan explícitamente como contenido de aprendizaje en la siguiente URL y sus significados en ${targetLanguageName}.`,
        importantNote:
          "【IMPORTANTE】Devuelva ÚNICAMENTE JSON en este formato:",
        extractionRules: [
          "Dirígete a **palabras individuales únicamente** (excluye frases compuestas, modismos, oraciones)",
          "Extrae ÚNICAMENTE palabras **explícitamente enseñadas en contenido educativo** (excluye palabras del texto general del artículo)",
          "Sitios de aprendizaje de idiomas: palabras de lecciones, tarjetas de vocabulario, listas de vocabulario",
          "Sitios de noticias: palabras de secciones de explicación de vocabulario, palabras difíciles anotadas",
          "Sitios de blogs/educativos: palabras de secciones de aprendizaje de vocabulario, partes de explicación de palabras",
          "Sitios de diccionario/vocabulario: palabras clave listadas como entradas",
          "【EXCLUIR】Menús de navegación, anuncios, botones, nombres de sitios, nombres de autores, fechas",
          "【EXCLUIR】Palabras básicas (el, la, y, es, de, etc.)",
          "【EXCLUIR】Términos de UI del sitio (iniciar sesión, buscar, inicio, etc.)",
          "【EXCLUIR】Palabras en texto ordinario (no marcadas específicamente para aprendizaje)",
          'Cada entrada debe estar completa con "word" y "meaning"',
          "Devuelve únicamente JSON puro (sin markdown o explicaciones)",
        ],
        technicalInstructions: [
          "Identificar contenido de aprendizaje: priorizar etiquetas/clases <article>, <main>, .vocabulary, .wordlist, .lesson",
          "Identificación de pares palabra-significado: extraer palabras con definiciones, traducciones, ejemplos acompañantes",
          "Vocabulario marcado por nivel: palabras con indicadores de dificultad (principiante, intermedio, TOEIC, etc.)",
          "Vocabulario de contexto de aprendizaje: palabras introducidas como 'palabra del día', 'términos clave', 'vocabulario importante'",
          "Formato de tarjetas: vocabulario presentado en formato de tarjeta/cuestionario",
          "Vocabulario anotado: términos especializados/difíciles marcados con * o notas al pie en el texto principal",
        ],
      },
      fr: {
        extractionInstruction:
          sourceLang === "auto"
            ? `Extrayez UNIQUEMENT les **mots de vocabulaire en langue étrangère** qui sont explicitement enseignés comme contenu d'apprentissage sur l'URL suivante. Détectez automatiquement la langue source et traduisez les significations en ${targetLanguageName}.`
            : `Extrayez UNIQUEMENT les **mots de vocabulaire en ${sourceLanguageName}** qui sont explicitement enseignés comme contenu d'apprentissage sur l'URL suivante et leurs significations en ${targetLanguageName}.`,
        importantNote:
          "【IMPORTANT】Retournez UNIQUEMENT du JSON dans ce format:",
        extractionRules: [
          "Ciblez **des mots individuels uniquement** (excluez les phrases composées, idiomes, phrases)",
          "Extrayez UNIQUEMENT les mots **explicitement enseignés dans le contenu éducatif** (excluez les mots du texte général de l'article)",
          "Sites d'apprentissage des langues: mots des leçons, cartes de vocabulaire, listes de vocabulaire",
          "Sites d'actualités: mots des sections d'explication du vocabulaire, mots difficiles annotés",
          "Sites de blogs/éducatifs: mots des sections d'apprentissage du vocabulaire, parties d'explication des mots",
          "Sites de dictionnaire/vocabulaire: mots-clés listés comme entrées",
          "【EXCLURE】Menus de navigation, publicités, boutons, noms de sites, noms d'auteurs, dates",
          "【EXCLURE】Mots de base (le, la, et, est, de, etc.)",
          "【EXCLURE】Termes d'interface du site (connexion, recherche, accueil, etc.)",
          "【EXCLURE】Mots dans le texte ordinaire (non spécifiquement marqués pour l'apprentissage)",
          'Chaque entrée doit être complète avec "word" et "meaning"',
          "Retournez uniquement du JSON pur (pas de markdown ou d'explications)",
        ],
        technicalInstructions: [
          "Identifier le contenu d'apprentissage: prioriser les balises/classes <article>, <main>, .vocabulary, .wordlist, .lesson",
          "Identification des paires mot-signification: extraire les mots avec définitions, traductions, exemples accompagnants",
          "Vocabulaire marqué par niveau: mots avec indicateurs de difficulté (débutant, intermédiaire, TOEIC, etc.)",
          "Vocabulaire de contexte d'apprentissage: mots introduits comme 'mot du jour', 'termes clés', 'vocabulaire important'",
          "Format de cartes: vocabulaire présenté en format carte/quiz",
          "Vocabulaire annoté: termes spécialisés/difficiles marqués avec * ou notes de bas de page dans le texte principal",
        ],
      },
      de: {
        extractionInstruction:
          sourceLang === "auto"
            ? `Extrahieren Sie NUR die **Fremdsprachen-Vokabelwörter**, die explizit als Lerninhalt auf der folgenden URL gelehrt werden. Erkennen Sie automatisch die Quellsprache und übersetzen Sie die Bedeutungen ins ${targetLanguageName}.`
            : `Extrahieren Sie NUR die **${sourceLanguageName}-Vokabelwörter**, die explizit als Lerninhalt auf der folgenden URL gelehrt werden und ihre ${targetLanguageName}-Bedeutungen.`,
        importantNote: "【WICHTIG】Geben Sie NUR JSON in diesem Format zurück:",
        extractionRules: [
          "Zielen Sie auf **einzelne Wörter nur** (schließen Sie zusammengesetzte Phrasen, Redewendungen, Sätze aus)",
          "Extrahieren Sie NUR Wörter, die **explizit in Bildungsinhalten gelehrt werden** (schließen Sie Wörter aus allgemeinem Artikeltext aus)",
          "Sprachlern-Websites: Wörter aus Lektionen, Vokabelkarten, Vokabellisten",
          "Nachrichten-Websites: Wörter aus Vokabelerklärungsabschnitten, annotierte schwierige Wörter",
          "Blog-/Bildungs-Websites: Wörter aus Vokabellernabschnitten, Worterklärungsteilen",
          "Wörterbuch-/Vokabel-Websites: Schlüsselwörter, die als Einträge aufgelistet sind",
          "【AUSSCHLIESSEN】Navigationsmenüs, Werbung, Schaltflächen, Site-Namen, Autorennamen, Daten",
          "【AUSSCHLIESSEN】Grundwörter (der, die, und, ist, von, etc.)",
          "【AUSSCHLIESSEN】Site-UI-Begriffe (Anmelden, Suchen, Startseite, etc.)",
          "【AUSSCHLIESSEN】Wörter in gewöhnlichem Text (nicht spezifisch für das Lernen markiert)",
          'Jeder Eintrag muss vollständig mit "word" und "meaning" sein',
          "Geben Sie nur reines JSON zurück (kein Markdown oder Erklärungen)",
        ],
        technicalInstructions: [
          "Lerninhalte identifizieren: <article>, <main>, .vocabulary, .wordlist, .lesson Tags/Klassen priorisieren",
          "Wort-Bedeutung-Paar-Identifikation: Wörter mit begleitenden Definitionen, Übersetzungen, Beispielen extrahieren",
          "Niveau-markiertes Vokabular: Wörter mit Schwierigkeitsindikatoren (Anfänger, Mittelstufe, TOEIC, etc.)",
          "Lernkontext-Vokabular: Wörter, die als 'Wort des Tages', 'Schlüsselbegriffe', 'wichtiges Vokabular' eingeführt werden",
          "Kartenformat: Vokabular im Karten-/Quiz-Format präsentiert",
          "Annotiertes Vokabular: spezialisierte/schwierige Begriffe, die im Haupttext mit * oder Fußnoten markiert sind",
        ],
      },
    };

    const prompt = prompts[targetLang] || prompts.en;

    return {
      sourceLanguageName,
      targetLanguageName,
      extractionPrompt: prompt.extractionInstruction,
      importantNote: prompt.importantNote,
      extractionRules: prompt.extractionRules,
      technicalInstructions: prompt.technicalInstructions,
    };
  };

  const {
    targetLanguageName,
    extractionPrompt,
    importantNote,
    extractionRules,
  } = getLanguageInstructions(sourceLanguage, targetLanguage);

  // まず小さなサンプルで抽出を試す
  // まず小さなサンプルで抽出を試す（厳密な制限付き）
  const samplePrompt = `${extractionPrompt}
URL: ${url}

${importantNote}
{"words":[{"word":"example","meaning":"meaning in ${targetLanguageName}"}]}

STRICT Sample Extraction Rules (Max 15 words - Quality Focus):
1. **教育コンテンツ識別**: 語学レッスン、単語カード、語彙リストのみから抽出
2. **明確な学習表示**: 「重要単語」「キーワード」「語彙」などのラベル付き語のみ
3. **単語-意味ペア**: 定義や翻訳が明示されている語のみ（推測しない）
4. **厳格除外**: ナビ、広告、UI、サイト名、日付、著者名は完全除外
5. **基本語除外**: 冠詞、前置詞、助詞（the/and/a/は/が/を/に等）は除外
6. **学習レベル優先**: 難易度表示やレベル分けされた語彙を優先
7. **単語のみ**: 句や文ではなく、単一の語のみ
8. **実在確認**: サイトに実際に存在し、学習用として提示されている語のみ
9. **文脈確認**: 語彙学習の文脈で使われている語のみ
10. **品質重視**: 15語以下でも高品質な学習語彙のみを選択

特別な注意点:
- 語学学習サイト: レッスン内の新出単語、フラッシュカード内容
- ニュース記事: 語彙コーナー、注釈付き専門用語
- 教育ブログ: 語彙解説セクション、単語説明記事
- 辞書サイト: 見出し語、例文内の重要語彙

VALIDATION: 各単語について以下を確認
✓ 学習コンテンツ内で明示的に教えられている
✓ 定義・翻訳・例文などの学習支援情報がある
✓ 語彙学習の文脈で提示されている
✓ サイトのメインコンテンツ部分に存在する
✓ 単語レベルの語彙か（句や文ではないか）？`;

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
        const repairedSample = await repairJsonWithGemini(
          sampleResponse,
          targetLanguage
        );
        const parsedSample = JSON.parse(repairedSample);
        sampleWords = parsedSample.words || [];
        console.log(`Sample repair successful: ${sampleWords.length} words`);
      } catch (repairError) {
        console.error("Sample repair also failed:", repairError);
        // エラーをスローせず、単にsampleWordsが空のままにする
      }
    }

    if (sampleWords.length === 0) {
      // --- NEW ADAPTIVE LOGIC ---
      console.log(
        "Sample extraction failed or returned no words. Trying adaptive extraction with DOM analysis."
      );

      const domHints = await getDomStructureHints(url);

      if (domHints.length > 0) {
        console.log(
          `Found DOM hints: ${domHints.join(
            ", "
          )}. Retrying with adaptive prompt.`
        );

        const { extractionPrompt, importantNote, targetLanguageName } =
          getLanguageInstructions(sourceLanguage, targetLanguage);

        const adaptivePrompt = `${extractionPrompt}
URL: ${url}

【ADAPTIVE RE-ATTEMPT】
The initial attempt failed. Pay close attention to the following HTML structure hints to locate the vocabulary list.

Potential container selectors: ${domHints.join(", ")}

Focus your extraction ONLY on content within these HTML elements.

${importantNote}
{"words":[{"word":"example","meaning":"meaning in ${targetLanguageName}"}]}

STRICT Sample Extraction Rules (Max 15 words - Quality Focus):
1. **教育コンテンツ識別**: 語学レッスン、単語カード、語彙リストのみから抽出
2. **明確な学習表示**: 「重要単語」「キーワード」「語彙」などのラベル付き語のみ
3. **単語-意味ペア**: 定義や翻訳が明示されている語のみ（推測しない）
4. **厳格除外**: ナビ、広告、UI、サイト名、日付、著者名は完全除外
5. **基本語除外**: 冠詞、前置詞、助詞（the/and/a/は/が/を/に等）は除外
6. **学習レベル優先**: 難易度表示やレベル分けされた語彙を優先
7. **単語のみ**: 句や文ではなく、単一の語のみ
8. **実在確認**: サイトに実際に存在し、学習用として提示されている語のみ
9. **文脈確認**: 語彙学習の文脈で使われている語のみ
10. **品質重視**: 15語以下でも高品質な学習語彙のみを選択
`;

        try {
          const adaptiveResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: adaptivePrompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
            },
          });
          const adaptiveResponse = adaptiveResult.response.text().trim();
          console.log(
            "Adaptive response:",
            adaptiveResponse.substring(0, 200) + "..."
          );

          // Try to parse the adaptive response
          try {
            const cleanAdaptive = basicJsonRepair(adaptiveResponse);
            const parsedAdaptive = JSON.parse(cleanAdaptive);
            sampleWords = parsedAdaptive.words || [];
            console.log(
              `Adaptive extraction successful: ${sampleWords.length} words`
            );
          } catch (parseError) {
            const message =
              parseError instanceof Error
                ? parseError.message
                : String(parseError);
            console.error(
              `Failed to parse adaptive response: ${message}, trying with Gemini repair`
            );
            try {
              const repairedAdaptive = await repairJsonWithGemini(
                adaptiveResponse,
                targetLanguage
              );
              const parsedAdaptive = JSON.parse(repairedAdaptive);
              sampleWords = parsedAdaptive.words || [];
              console.log(
                `Adaptive extraction with repair successful: ${sampleWords.length} words`
              );
            } catch (repairError) {
              console.error("Adaptive repair also failed:", repairError);
            }
          }
        } catch (adaptiveError) {
          console.error("Adaptive extraction API call failed:", adaptiveError);
        }
      }
      // --- END OF ADAPTIVE LOGIC ---
    }

    if (sampleWords.length === 0) {
      throw new Error(
        "Could not extract words from the site, even with adaptive analysis. Please check the site format."
      );
    }

    // 全体抽出（分割を考慮したプロンプト）
    console.log("Executing full extraction...");
    const { technicalInstructions } = getLanguageInstructions(
      sourceLanguage,
      targetLanguage
    );

    const fullPrompt = `${extractionPrompt} 以下のURLから学習用語彙を網羅的に抽出し、純粋なJSON形式で返してください。

URL: ${url}

${importantNote}
{"words":[{"word":"vocabulary","meaning":"meaning in ${targetLanguageName}"}]}

抽出ルール:
${extractionRules
  .map((rule: string, index: number) => `${index + 1}. ${rule}`)
  .join("\n")}

技術的指示:
${technicalInstructions
  .map((instruction: string) => `- ${instruction}`)
  .join("\n")}

実用的な抽出例:
📚 語学学習サイトの場合:
- レッスン内「New Words」「Vocabulary」セクションの単語
- フラッシュカードやクイズ内の学習語彙
- 文法説明で使用される例語（但し基本語は除く）

📰 ニュースサイトの場合:
- 記事下部の「関連語彙」「重要用語」解説
- 本文中で※や＊で注釈された専門用語
- 「今日の英単語」などの語彙コーナー

🎓 教育・学術サイトの場合:
- 専門用語集、重要語彙リスト
- 学習レベル別単語一覧
- 用語解説ページの見出し語

品質保証チェック:
1. 各単語は学習コンテンツの文脈で提示されているか？
2. 意味や翻訳などの学習支援情報があるか？
3. 語彙学習を目的として掲載されているか？
4. サイトのメイン教育コンテンツ内にあるか？
5. 単語レベルの語彙か（句や文ではないか）？`;

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
        const geminiFixed = await repairJsonWithGemini(
          fullResponse,
          targetLanguage
        );
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
