// api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OpenRouter API Key missing in environment variables.' });
  }

  // Fallback free models in priority order
  const MODELS = [
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free"
  ];

  try {
    const { classLevel, subject, topic, language, section } = req.body;

    if (!classLevel || !subject || !topic || !language || !section) {
      return res.status(400).json({ error: 'Missing required fields in request body.' });
    }

    let promptText = "";
    if (section === "Explanation") {
      promptText = `Provide an exhaustive, deep, and highly engaging storytelling-style explanation for the chapter/topic "${topic}" of Subject "${subject}" tailored perfectly for Class ${classLevel} students. Use plenty of highly relatable Indian real-world examples, metaphors, and cultural context. Explain every single micro-concept structurally, keeping the tone supportive, interesting, and easy to comprehend like an ideal personal home tutor. Make it extremely long and comprehensive.`;
    } else if (section === "Notes") {
      promptText = `Generate 50-80+ ultra-detailed, highly comprehensive exam-ready bullet point revision notes for the chapter/topic "${topic}" of Subject "${subject}" for Class ${classLevel}. Divide the notes into clear sub-headings, covering definitions, formulas, key concepts, laws, and critical highlights. Ensure absolutely no concept is missed out so a student can completely score full marks just by reviewing these points.`;
    } else if (section === "Textbook Q&A") {
      promptText = `Act as an expert board examiner and generate a master question bank of 50-70+ NCERT and Board style textbook questions with accurate, high-scoring detailed answers for the chapter/topic "${topic}" of Subject "${subject}" for Class ${classLevel}. Categorize them strictly into: Very Short Answer Questions (VSA), Short Answer Questions (SA), and Long Answer Questions (LA). Each answer must be fully articulated, grammatically pristine, and tailored for ideal exam presentation.`;
    } else if (section === "Additional Q&A") {
      promptText = `Generate an exhaustive set of 50-70+ extra important questions, HOTS (Higher Order Thinking Skills), competency-based case studies, and Previous Year Questions (PYQs) with completely solved comprehensive answers for the topic "${topic}" of Subject "${subject}" for Class ${classLevel}. Focus on tricky edge cases, application-based concepts, and high-frequency exam questions that test conceptual clarity.`;
    }

    const systemPrompt = `You are "APNA MASTER", the ultimate, highly knowledgeable expert Indian school teacher and academic mentor. 
Your sole objective is to provide the absolute best, most comprehensive, detailed, and longest possible educational study materials. 
CRITICAL RULE: You must output your entire response EXCLUSIVELY in ${language} language. Even if the subject or topic names are mentioned in English, translate the whole instructional delivery, explanation, questions, and answers into ${language}. Use appropriate formatting with markdown headings (###), bold text (**), and lists, but do not use HTML tags in your response. Ensure maximum word count and depth for the selected section.`;

    let responseData = null;
    let success = false;
    let fallbackLog = [];

    for (const model of MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://apnamaster.vercel.app",
            "X-Title": "APNA MASTER",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: promptText }
            ],
            temperature: 0.7
          })
        });

        if (response.status === 429) {
          fallbackLog.push(`Model ${model} hit rate limit (429). Trying next...`);
          continue;
        }

        if (response.ok) {
          responseData = await response.json();
          if (responseData && responseData.choices && responseData.choices[0]) {
            success = true;
            break;
          }
        } else {
          const errText = await response.text();
          fallbackLog.push(`Model ${model} failed with status ${response.status}: ${errText}`);
        }
      } catch (err) {
        fallbackLog.push(`Model ${model} network error: ${err.message}`);
      }
    }

    if (!success || !responseData) {
      return res.status(502).json({ 
        error: "All free AI models are currently busy or rate-limited. Please click the 'Retry' button.", 
        details: fallbackLog 
      });
    }

    return res.status(200).json({ output: responseData.choices[0].message.content });

  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
        }
