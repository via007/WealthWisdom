
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNaturalLanguage = async (text: string): Promise<Partial<Transaction> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析以下记账文本并提取结构化数据：'${text}'。
      请直接返回JSON格式。
      类型必须是 'income' 或 'expense'。
      日期格式为 YYYY-MM-DD。
      如果没有指定日期，使用今天：${new Date().toISOString().split('T')[0]}。
      可能的类别：餐饮, 购物, 交通, 娱乐, 居住, 工资, 其他。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
          },
          required: ["amount", "type", "category", "description", "date"],
        },
      },
    });

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return null;
  }
};

export const analyzeSpendingHabits = async (transactions: Transaction[]) => {
  const txSummary = transactions.map(t => `${t.date}: ${t.type === 'income' ? '+' : '-'}${t.amount} (${t.category} - ${t.description})`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `作为财务专家，分析以下交易记录并提供简短的总结、3条省钱建议及消费风险评估（low/medium/high）：\n${txSummary}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskLevel: { type: Type.STRING },
          },
          required: ["summary", "suggestions", "riskLevel"],
        },
      },
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Insight Error:", error);
    return null;
  }
};

export const analyzeImageReceipt = async (base64Image: string): Promise<Partial<Transaction> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "从这张收据图片中提取总金额、交易类型（通常是expense）、类别和简短描述。返回JSON格式。" }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
          },
          required: ["amount", "category", "description", "date"],
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Image Parsing Error:", error);
    return null;
  }
};
