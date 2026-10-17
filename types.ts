export interface CalculationMetrics {
  netValueExVat: number;
  productCost: number;
  grossProfit: number;
  vatAmount: number;
  profitMargin: number;
  averageOrderValue: number;
  totalFixedCosts: number; // Costuri fixe totale (zilnic * zile)
  markupValue: number; // Valoarea adaosului comercial
  roi: number; // ROI față de costul de marketing
}

export interface InputState {
  ordersCount: number;
  netValueWithVat: number; // Valoare Neta (fara transport, cu TVA)
  shippingCost: number; // Cost de livrare
  totalValueWithShipping: number; // Valoare Totala (transport inclus)
  marketingCost: number; // Cost Marketing
  dailyFixedExpenses: number; // Cheltuieli fixe zilnice
  daysCount: number; // Numarul de zile pentru calcul
  markupPercent: number; // Adaos comercial în procente (ex: 100%)
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  orders: number;
  netValue: number;
  shippingCost: number;
  totalValue: number;
}