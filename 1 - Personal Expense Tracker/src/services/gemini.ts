import { CategoryId, Expense, CategoryBudget } from '../types/expense';
import { CATEGORIES } from '../data/categories';
import { GoogleGenAI } from '@google/genai';

// Fast Instant Keyword / Heuristic Classifier
export function classifyOffline(input: string): { categoryId: CategoryId; confidence: number } | null {
  if (!input || !input.trim()) return null;
  const normalized = input.toLowerCase().trim();

  // Explicit prioritized checks for user examples:
  // "milk, bread etc will be grocery"
  if (/\b(milk|bread|egg|eggs|butter|cheese|grocery|groceries|veggie|vegetable|fruit|supermarket|blinkit|zepto|instamart|bigbasket|dmart)\b/.test(normalized)) {
    return { categoryId: 'groceries', confidence: 0.98 };
  }

  // "flight, train, train tickets will be travel"
  if (/\b(flight|flights|train|trains|ticket|tickets|railway|irctc|metro|uber|ola|rapido|cab|taxi|plane|airline|indigo|fuel|petrol|diesel|hotel|airbnb|booking)\b/.test(normalized)) {
    return { categoryId: 'travel', confidence: 0.98 };
  }

  // Iterate over full keyword dictionary
  for (const [catId, info] of Object.entries(CATEGORIES)) {
    for (const kw of info.defaultKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return { categoryId: catId as CategoryId, confidence: 0.92 };
      }
    }
  }

  return null;
}

export interface CategorizationResult {
  categoryId: CategoryId;
  source: 'gemini' | 'heuristic';
  confidence: number;
  reason?: string;
}

/**
 * Automatically categorizes an expense description or merchant name
 * Uses Google Gemini API if API key is present, with instant heuristic fallback.
 */
export async function autoCategorizeExpense(
  merchantOrItem: string,
  notes: string = '',
  apiKey?: string
): Promise<CategorizationResult> {
  const query = `${merchantOrItem} ${notes}`.trim();
  if (!query) {
    return { categoryId: 'other', source: 'heuristic', confidence: 0.1 };
  }

  // 1. Try instant high-confidence heuristic first
  const heuristicMatch = classifyOffline(query);
  if (heuristicMatch && heuristicMatch.confidence >= 0.95 && !apiKey) {
    return {
      categoryId: heuristicMatch.categoryId,
      source: 'heuristic',
      confidence: heuristicMatch.confidence,
    };
  }

  // 2. If Gemini API Key is provided (or via env), use Gemini
  const activeKey = apiKey || (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY;

  if (activeKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const prompt = `You are an expert personal finance categorization AI.
Classify the following transaction into exactly ONE of these categories:
- food (Restaurants, dining out, cafe, coffee, takeout, fast food)
- groceries (Supermarket, fresh vegetables, milk, bread, pantry supplies, meat)
- travel (Flights, train tickets, cabs, metro, fuel, hotels, airbnb)
- shopping (Clothes, electronics, shoes, gifts, accessories, personal goods)
- bills (Electricity, water, rent, wifi, phone, utility bills)
- entertainment (Movies, Netflix, concerts, games, streaming, subscriptions)
- health (Doctor, medicine, pharmacy, gym, fitness membership)
- education (Courses, books, tuition, certifications)
- other (Miscellaneous or unclassified)

Transaction: "${query}"

Return ONLY a JSON object with this exact shape:
{"categoryId": "food" | "groceries" | "travel" | "shopping" | "bills" | "entertainment" | "health" | "education" | "other", "confidence": 0.95, "reason": "short explanation"}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text?.trim() || '';
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.categoryId && CATEGORIES[parsed.categoryId as CategoryId]) {
          return {
            categoryId: parsed.categoryId as CategoryId,
            source: 'gemini',
            confidence: parsed.confidence || 0.95,
            reason: parsed.reason,
          };
        }
      }
    } catch (err) {
      console.warn('Gemini categorization API call failed, using heuristic fallback:', err);
    }
  }

  // 3. Heuristic fallback
  if (heuristicMatch) {
    return {
      categoryId: heuristicMatch.categoryId,
      source: 'heuristic',
      confidence: heuristicMatch.confidence,
    };
  }

  return {
    categoryId: 'other',
    source: 'heuristic',
    confidence: 0.3,
  };
}

/**
 * Generates smart budget and spending advice using Gemini AI or structured rules
 */
export async function generateSpendingInsights(
  expenses: Expense[],
  budgets: CategoryBudget[],
  currency: string,
  apiKey?: string
): Promise<string[]> {
  const activeKey = apiKey || (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY;

  if (activeKey && expenses.length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const recentExpenses = expenses.slice(0, 15).map(e => `${e.date}: ${currency}${e.amount} at ${e.merchant} (${e.categoryId})`);
      const budgetSummary = budgets.map(b => `${b.categoryId} limit: ${currency}${b.monthlyLimit}`).join(', ');

      const prompt = `You are a helpful, encouraging personal finance advisor.
Analyze this user's current spending:
Recent transactions:
${recentExpenses.join('\n')}

Monthly budgets:
${budgetSummary}

Provide 3 concise, highly actionable, high-impact financial insights or observations (1-2 sentences each).
Return ONLY a JSON array of 3 strings: ["Insight 1", "Insight 2", "Insight 3"]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const jsonMatch = response.text?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const list = JSON.parse(jsonMatch[0]);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Gemini insights failed, using heuristic advisor:', e);
    }
  }

  // Intelligent built-in rule advisor
  const insights: string[] = [];

  // Calculate highest spend category
  const catTotals: Record<string, number> = {};
  for (const e of expenses) {
    catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
  }

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0) {
    const top = sortedCats[0];
    const catName = CATEGORIES[top[0] as CategoryId]?.name || top[0];
    insights.push(`Your highest spending area this period is ${catName} (${currency}${top[1].toLocaleString()}). Look for recurring subscriptions or bulk savings opportunities.`);
  }

  // Check budget limits
  const exceededBudgets = budgets.filter(b => {
    const spent = catTotals[b.categoryId] || 0;
    return spent >= b.monthlyLimit;
  });

  if (exceededBudgets.length > 0) {
    const overCat = CATEGORIES[exceededBudgets[0].categoryId]?.name;
    insights.push(`Alert: You have reached or exceeded your budget limit for ${overCat}. Consider reducing discretionary expenses until month-end.`);
  } else {
    insights.push(`Great budget pacing! None of your category limits have been breached yet. Keep maintaining this steady discipline.`);
  }

  insights.push(`Using UPI & digital payments for minor expenses accumulates quickly. Consider setting a daily soft limit to build up your emergency savings fund.`);

  return insights;
}
