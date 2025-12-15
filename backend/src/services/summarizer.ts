import OpenAI from 'openai';

// Lazy initialization - create OpenAI client only when needed
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
}

/**
 * Count words in a text string
 */
function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Summarize text if it exceeds the word limit
 * @param text - Text to summarize
 * @param maxWords - Maximum words before summarization (20 for journal, 500 for others)
 * @returns Original text if under limit, or summarized text if over limit
 */
export async function summarizeIfNeeded(text: string | undefined, maxWords: number): Promise<string | undefined> {
  if (!text || typeof text !== 'string') return text;
  
  const wordCount = countWords(text);
  
  // If text is within limit, return as-is
  if (wordCount <= maxWords) {
    return text;
  }
  
  // Summarize the text
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a text summarizer. Provide concise, accurate summaries that preserve key information. Return only the summary text, no additional commentary.',
        },
        {
          role: 'user',
          content: `Summarize the following text in approximately ${maxWords} words or less, preserving all important information:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: Math.max(200, maxWords * 2), // Allow enough tokens for summary
    });
    
    const summary = response.choices[0]?.message?.content?.trim();
    return summary || text; // Fallback to original if summarization fails
  } catch (error) {
    console.error('Summarization error:', error);
    // If summarization fails, truncate the text instead
    const words = text.split(/\s+/);
    const truncated = words.slice(0, maxWords).join(' ');
    return truncated + (words.length > maxWords ? '...' : '');
  }
}

/**
 * Summarize journal text if it exceeds 20 words
 */
export async function summarizeJournal(journal: string | undefined): Promise<string | undefined> {
  return summarizeIfNeeded(journal, 20);
}

/**
 * Summarize other metadata fields if they exceed 500 words
 */
export async function summarizeMetadataField(field: string | undefined): Promise<string | undefined> {
  return summarizeIfNeeded(field, 500);
}

