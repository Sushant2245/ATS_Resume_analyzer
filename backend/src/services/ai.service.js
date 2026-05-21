const { AI_API_KEY, AI_PROVIDER } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Build the prompt for AI analysis
 */
const buildAnalysisPrompt = (resumeText, jobDescription) => {
  return `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the provided job description and return a detailed JSON analysis.

**Scoring Criteria:**
1. Keyword Matching (35%): Density and exact presence of hard skills and tools mentioned in the JD.
2. Skill Detection (25%): Semantic matching of inferred skills.
3. Experience Detection (15%): Matching required years of experience.
4. Section Detection (15%): Presence of standard ATS-parsable headers (Experience, Education, Skills, Projects).
5. Formatting Checks (10%): Penalizing complex layouts, missing contact info, or structural anomalies.

**RESUME TEXT:**
${resumeText}

**JOB DESCRIPTION:**
${jobDescription}

**IMPORTANT:** You MUST respond with ONLY a valid JSON object (no markdown, no backticks, no extra text). Use this exact structure:
{
  "atsScore": <number 0-100>,
  "missingKeywords": ["keyword1", "keyword2"],
  "matchPercentage": <number 0-100>,
  "skillMatch": {
    "found": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"]
  },
  "formatSuggestions": ["suggestion1", "suggestion2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (prompt) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS analyzer. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Call Google Gemini API
 */
const callGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API error: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

/**
 * Fallback local analysis when no AI API key is configured
 */
const localAnalysis = (resumeText, jobDescription) => {
  const resumeWords = resumeText.toLowerCase().split(/\W+/).filter(Boolean);
  const jdWords = jobDescription.toLowerCase().split(/\W+/).filter(Boolean);

  // Extract unique meaningful words (>3 chars) from JD as keywords
  const jdKeywords = [...new Set(jdWords.filter((w) => w.length > 3))];
  const resumeWordSet = new Set(resumeWords);

  const foundKeywords = jdKeywords.filter((kw) => resumeWordSet.has(kw));
  const missingKeywords = jdKeywords.filter((kw) => !resumeWordSet.has(kw)).slice(0, 15);

  const matchPercentage = jdKeywords.length
    ? Math.round((foundKeywords.length / jdKeywords.length) * 100)
    : 0;

  // Common skill patterns
  const skillPatterns = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'express', 'mongodb', 'sql', 'aws', 'docker', 'kubernetes',
    'git', 'html', 'css', 'tailwind', 'next', 'graphql', 'redis',
    'postgresql', 'mysql', 'firebase', 'azure', 'gcp', 'linux',
    'agile', 'scrum', 'ci/cd', 'rest', 'api', 'testing', 'jest',
  ];

  const jdSkills = skillPatterns.filter((s) =>
    jobDescription.toLowerCase().includes(s)
  );
  const foundSkills = jdSkills.filter((s) =>
    resumeText.toLowerCase().includes(s)
  );
  const missingSkills = jdSkills.filter(
    (s) => !resumeText.toLowerCase().includes(s)
  );

  // Section detection
  const sections = ['experience', 'education', 'skills', 'projects', 'summary'];
  const foundSections = sections.filter((s) =>
    resumeText.toLowerCase().includes(s)
  );

  const sectionScore = (foundSections.length / sections.length) * 15;
  const keywordScore = matchPercentage * 0.35;
  const skillScore = jdSkills.length
    ? (foundSkills.length / jdSkills.length) * 25
    : 12;
  const experienceScore = resumeText.toLowerCase().includes('year') ? 15 : 7;
  const formatScore =
    resumeText.length > 200 && foundSections.length >= 3 ? 10 : 5;

  const atsScore = Math.min(
    100,
    Math.round(keywordScore + skillScore + experienceScore + sectionScore + formatScore)
  );

  const formatSuggestions = [];
  if (!resumeText.toLowerCase().includes('email') && !resumeText.includes('@')) {
    formatSuggestions.push('Add contact information including email address');
  }
  if (foundSections.length < 4) {
    formatSuggestions.push(
      `Add missing sections: ${sections.filter((s) => !foundSections.includes(s)).join(', ')}`
    );
  }
  formatSuggestions.push('Use a clean single-column layout for better ATS parsing');

  const recommendations = [
    `Include these missing keywords from the job description: ${missingKeywords.slice(0, 5).join(', ')}`,
    missingSkills.length
      ? `Add these skills if applicable: ${missingSkills.join(', ')}`
      : 'Great skill coverage! Consider adding proficiency levels.',
    'Quantify achievements with numbers and percentages where possible.',
    'Use standard section headers (Experience, Education, Skills, Projects).',
    'Tailor your resume summary to match the job description.',
  ];

  return {
    atsScore,
    missingKeywords: missingKeywords.slice(0, 15),
    matchPercentage,
    skillMatch: {
      found: foundSkills,
      missing: missingSkills,
    },
    formatSuggestions,
    recommendations,
  };
};

/**
 * Parse the AI response into our expected schema
 */
const parseAIResponse = (responseText) => {
  try {
    // Try to extract JSON from the response
    let jsonStr = responseText.trim();

    // Remove markdown code block if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Validate and normalize
    return {
      atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 0)),
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
      matchPercentage: Math.min(100, Math.max(0, Number(parsed.matchPercentage) || 0)),
      skillMatch: {
        found: Array.isArray(parsed.skillMatch?.found) ? parsed.skillMatch.found : [],
        missing: Array.isArray(parsed.skillMatch?.missing) ? parsed.skillMatch.missing : [],
      },
      formatSuggestions: Array.isArray(parsed.formatSuggestions) ? parsed.formatSuggestions : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch (error) {
    logger.error(`Failed to parse AI response: ${error.message}`);
    throw new Error('Failed to parse AI analysis response.');
  }
};

/**
 * Build the prompt for AI tailoring
 */
const buildTailorPrompt = (resumeText, jobDescription, missingKeywords) => {
  return `You are a professional resume writer and ATS optimization expert. Analyze the following resume and job description.
Find 3 to 5 specific bullet points or sentences from the experience or projects sections in the resume that can be optimized to match the job description.
For each sentence, rewrite it to naturally and contextually incorporate one or more missing keywords or skills from the list below.
Do not lie or invent fake credentials, but frame the user's achievements and work experience more effectively.

**MISSING KEYWORDS/SKILLS TO INCORPORATE:**
${JSON.stringify(missingKeywords)}

**RESUME TEXT:**
${resumeText}

**JOB DESCRIPTION:**
${jobDescription}

**IMPORTANT:** You MUST respond with ONLY a valid JSON array of objects (no markdown, no backticks, no extra text). Use this exact structure:
[
  {
    "original": "exact original sentence or bullet point from the resume",
    "suggestion": "suggested rewrite incorporating specific keywords",
    "keywordsUsed": ["keyword1", "keyword2"],
    "rationale": "short explanation of why this change improves ATS compatibility"
  }
]`;
};

/**
 * Local fallback for resume tailoring
 */
const localTailorAnalysis = (resumeText, jobDescription, missingKeywords = []) => {
  const lines = resumeText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 25 && l.length < 150);

  // Find lines that look like work experience/accomplishments (starting with action verbs or bullet points)
  const actionVerbs = ['managed', 'developed', 'created', 'designed', 'built', 'led', 'implemented', 'worked', 'responsible', 'collaborated', 'assisted', 'engineered'];
  const candidates = lines.filter((line) => {
    const lower = line.toLowerCase();
    const startsWithVerb = actionVerbs.some((v) => lower.startsWith(v) || lower.replace(/^[^a-zA-Z]+/, '').startsWith(v));
    return startsWithVerb || line.startsWith('-') || line.startsWith('•');
  });

  const selectedLines = candidates.slice(0, 4);
  if (selectedLines.length === 0) {
    // Fallback if no candidate lines found, just pick the first few non-empty lines
    selectedLines.push(...lines.slice(0, 3));
  }

  const keywords = Array.isArray(missingKeywords) && missingKeywords.length > 0
    ? missingKeywords
    : ['performance', 'optimization', 'deployment', 'scalability'];

  return selectedLines.map((originalLine, idx) => {
    // Remove leading bullet characters if present
    const cleanLine = originalLine.replace(/^[^a-zA-Z]+/, '');
    const kw1 = keywords[idx % keywords.length] || 'optimization';
    const kw2 = keywords[(idx + 1) % keywords.length] || 'performance';
    
    return {
      original: originalLine,
      suggestion: `${cleanLine.endsWith('.') ? cleanLine.slice(0, -1) : cleanLine}, leveraging ${kw1} and ${kw2} methodologies to enhance overall system performance and efficiency.`,
      keywordsUsed: [kw1, kw2],
      rationale: `Integrates missing keywords "${kw1}" and "${kw2}" to highlight technical skills matching the job description.`,
    };
  });
};

/**
 * Parse the AI tailoring response into expected schema
 */
const parseTailorAIResponse = (responseText) => {
  try {
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not a JSON array.');
    }
    return parsed.map((item) => ({
      original: String(item.original || ''),
      suggestion: String(item.suggestion || ''),
      keywordsUsed: Array.isArray(item.keywordsUsed) ? item.keywordsUsed : [],
      rationale: String(item.rationale || ''),
    }));
  } catch (error) {
    logger.error(`Failed to parse AI tailoring response: ${error.message}`);
    throw new Error('Failed to parse AI tailoring response.');
  }
};

/**
 * Main tailoring function — routes to configured AI provider
 */
const tailorResume = async (resumeText, jobDescription, missingKeywords) => {
  if (!AI_API_KEY || AI_API_KEY === 'your_openai_or_gemini_api_key_here') {
    logger.warn('No AI API key configured. Using local fallback for tailoring.');
    return localTailorAnalysis(resumeText, jobDescription, missingKeywords);
  }

  const prompt = buildTailorPrompt(resumeText, jobDescription, missingKeywords);

  try {
    let responseText;

    if (AI_PROVIDER === 'openai') {
      responseText = await callOpenAI(prompt);
    } else {
      responseText = await callGemini(prompt);
    }

    return parseTailorAIResponse(responseText);
  } catch (error) {
    logger.error(`AI tailoring failed: ${error.message}. Falling back to local tailoring.`);
    return localTailorAnalysis(resumeText, jobDescription, missingKeywords);
  }
};

/**
 * Main analysis function — routes to the configured AI provider
 */
const analyzeResume = async (resumeText, jobDescription) => {
  // If no API key, use local fallback
  if (!AI_API_KEY || AI_API_KEY === 'your_openai_or_gemini_api_key_here') {
    logger.warn('No AI API key configured. Using local fallback analysis.');
    return localAnalysis(resumeText, jobDescription);
  }

  const prompt = buildAnalysisPrompt(resumeText, jobDescription);

  try {
    let responseText;

    if (AI_PROVIDER === 'openai') {
      responseText = await callOpenAI(prompt);
    } else {
      responseText = await callGemini(prompt);
    }

    return parseAIResponse(responseText);
  } catch (error) {
    logger.error(`AI analysis failed: ${error.message}. Falling back to local analysis.`);
    return localAnalysis(resumeText, jobDescription);
  }
};

module.exports = { analyzeResume, tailorResume };

