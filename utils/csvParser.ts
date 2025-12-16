import { DailyRecord } from '../types';

export const parseCSV = (text: string): DailyRecord[] => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  // Remove header
  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    // Basic cleanup: remove wrapping quotes if they exist
    // The format provided seems to be: "2025-12-13  ""15""  ""1878.79"" ..."
    // We'll try to be robust. 
    
    // 1. Remove leading/trailing quotes of the line
    let cleanLine = line.trim();
    if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
      cleanLine = cleanLine.substring(1, cleanLine.length - 1);
    }

    // 2. Split by tab (assuming tab separation based on snippet) or common CSV logic
    // The snippet: 2025-12-13""15""... implies maybe tabs between values?
    // Let's try to match the specific pattern first.
    
    // We will look for values separated by whitespace or tabs, potentially wrapped in double double-quotes ""val""
    // A robust way for this specific weird format:
    // Split by `""\t""` or just tabs, then clean up quotes.
    
    const parts = cleanLine.split(/\t/);
    
    const values = parts.map(part => {
      // Remove double quotes "" if present
      return part.replace(/^""|""$/g, '').replace(/"/g, '');
    });

    if (values.length < 5) return null;

    // Mapping based on: Data, Comenzi, Valoare Neta, Cost Livrare, Valoare Totala
    const date = values[0].trim();
    const orders = parseInt(values[1]) || 0;
    const netValue = parseFloat(values[2].replace(',', '.')) || 0;
    const shippingCost = parseFloat(values[3].replace(',', '.')) || 0;
    const totalValue = parseFloat(values[4].replace(',', '.')) || 0;

    return {
      date,
      orders,
      netValue,
      shippingCost,
      totalValue
    };
  }).filter((record): record is DailyRecord => record !== null);
};