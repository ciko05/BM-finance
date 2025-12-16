import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calculator, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Megaphone, 
  ShoppingBag,
  Percent,
  Wallet,
  UploadCloud,
  Calendar,
  X,
  FileText,
  Building,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { InputField } from './components/InputField';
import { ResultCard } from './components/ResultCard';
import { formatCurrency, formatNumber } from './utils/formatters';
import { parseCSV } from './utils/csvParser';
import { InputState, DailyRecord } from './types';

// Constants
const VAT_RATE = 0.21; // 21% TVA

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [inputs, setInputs] = useState<InputState>({
    ordersCount: 0,
    netValueWithVat: 0,
    shippingCost: 0,
    totalValueWithShipping: 0,
    marketingCost: 0,
    dailyFixedExpenses: 0,
    daysCount: 1, // Default to 1 day for manual entry
  });

  const [importedData, setImportedData] = useState<DailyRecord[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const handleInputChange = (field: keyof InputState) => (value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const records = parseCSV(text);
      if (records.length > 0) {
        // Sort records by date just in case
        records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setImportedData(records);
        
        // Set default range to cover all data
        setDateRange({
          start: records[0].date,
          end: records[records.length - 1].date
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImport = () => {
    setImportedData([]);
    setDateRange({ start: '', end: '' });
    setInputs(prev => ({ ...prev, daysCount: 1 }));
  };

  // Effect to populate inputs when data or date range changes
  useEffect(() => {
    if (importedData.length === 0) return;

    const { start, end } = dateRange;
    if (!start || !end) return;

    // Calculate days diff
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Inclusive

    const filteredRecords = importedData.filter(record => {
      return record.date >= start && record.date <= end;
    });

    const sums = filteredRecords.reduce((acc, curr) => ({
      ordersCount: acc.ordersCount + curr.orders,
      netValueWithVat: acc.netValueWithVat + curr.netValue,
      shippingCost: acc.shippingCost + curr.shippingCost,
      totalValueWithShipping: acc.totalValueWithShipping + curr.totalValue,
    }), {
      ordersCount: 0,
      netValueWithVat: 0,
      shippingCost: 0,
      totalValueWithShipping: 0
    });

    setInputs(prev => ({
      ...prev,
      ...sums,
      daysCount: diffDays
    }));

  }, [importedData, dateRange]);


  // Calculations derived from state
  const metrics = useMemo(() => {
    // 1. Valoare Neta fara TVA = Valoare Neta (cu TVA) / (1 + TVA)
    const netValueExVat = inputs.netValueWithVat / (1 + VAT_RATE);

    // 2. Costul Produse = Valoare Neta fara TVA / 2
    const productCost = netValueExVat / 2;

    // 3. Calcul Costuri Fixe Totale
    const totalFixedCosts = inputs.dailyFixedExpenses * inputs.daysCount;

    // 4. Profit Brut = Valoare Neta (fara TVA) - Cost Marketing - Cost Produse - Costuri Fixe
    const grossProfit = netValueExVat - inputs.marketingCost - productCost - totalFixedCosts;

    const vatAmount = inputs.netValueWithVat - netValueExVat;

    // Profit Margin
    const profitMargin = inputs.netValueWithVat > 0 
      ? (grossProfit / netValueExVat) * 100 
      : 0;

    // AOV (Average Order Value) - based on Total Value collected
    const averageOrderValue = inputs.ordersCount > 0 
      ? inputs.totalValueWithShipping / inputs.ordersCount 
      : 0;

    return {
      netValueExVat,
      productCost,
      grossProfit,
      vatAmount,
      profitMargin,
      averageOrderValue,
      totalFixedCosts
    };
  }, [inputs]);

  // Chart Data Preparation
  const barChartData = [
    {
      name: 'Rezumat Financiar',
      'Venit Net (fără TVA)': metrics.netValueExVat,
      'Cost Produse': metrics.productCost,
      'Cost Marketing': inputs.marketingCost,
      'Costuri Fixe': metrics.totalFixedCosts,
      'Profit Brut': metrics.grossProfit,
    },
  ];

  const pieChartData = [
    { name: 'Cost Produse', value: metrics.productCost, color: '#ef4444' }, // red-500
    { name: 'Marketing', value: inputs.marketingCost, color: '#f59e0b' }, // amber-500
    { name: 'Costuri Fixe', value: metrics.totalFixedCosts, color: '#6366f1' }, // indigo-500
    { name: 'Profit Brut', value: Math.max(0, metrics.grossProfit), color: '#10b981' }, // emerald-500
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              E-Com Calc
            </h1>
          </div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            TVA setat la {VAT_RATE * 100}%
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Import & Filter Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" />
                  Date de intrare
                </h2>
                
                <input 
                  type="file" 
                  accept=".csv,.txt" 
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                
                {importedData.length > 0 ? (
                   <button 
                    onClick={clearImport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                   >
                     <X className="w-3 h-3" />
                     Reset
                   </button>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Import CSV
                  </button>
                )}
              </div>

              {importedData.length > 0 && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Filtrare Perioadă
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 ml-1">De la</label>
                      <input 
                        type="date" 
                        value={dateRange.start}
                        min={importedData[0]?.date}
                        max={dateRange.end || importedData[importedData.length-1]?.date}
                        onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                        className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 ml-1">Până la</label>
                      <input 
                        type="date" 
                        value={dateRange.end}
                        min={dateRange.start || importedData[0]?.date}
                        max={importedData[importedData.length-1]?.date}
                        onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                        className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <InputField
                  label="Număr Comenzi"
                  icon={ShoppingBag}
                  value={inputs.ordersCount}
                  onChange={handleInputChange('ordersCount')}
                  description="Numărul total de comenzi procesate."
                />
                
                <div className="w-full h-px bg-slate-100 my-2"></div>

                <InputField
                  label="Valoare Netă (cu TVA)"
                  icon={DollarSign}
                  prefix="RON"
                  value={inputs.netValueWithVat}
                  onChange={handleInputChange('netValueWithVat')}
                  description="Venit din produse (fără transport, TVA inclus)."
                />
                <InputField
                  label="Cost de Livrare"
                  icon={Truck}
                  prefix="RON"
                  value={inputs.shippingCost}
                  onChange={handleInputChange('shippingCost')}
                  description="Costul total al livrărilor."
                />
                 <InputField
                  label="Valoare Totală (cu transport)"
                  icon={Wallet}
                  prefix="RON"
                  value={inputs.totalValueWithShipping}
                  onChange={handleInputChange('totalValueWithShipping')}
                  description="Suma totală încasată (Produse + Transport)."
                />
              </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-500" />
                Cheltuieli Operaționale
              </h2>
              <div className="space-y-4">
                 <InputField
                  label="Cost Marketing (Total)"
                  icon={Megaphone}
                  prefix="RON"
                  value={inputs.marketingCost}
                  onChange={handleInputChange('marketingCost')}
                  description="Bugetul total de reclame pe perioada selectată."
                />
                
                <div className="w-full h-px bg-slate-100 my-2"></div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                    <InputField
                      label="Cheltuieli Fixe Zilnice"
                      icon={Building}
                      prefix="RON"
                      value={inputs.dailyFixedExpenses}
                      onChange={handleInputChange('dailyFixedExpenses')}
                      description="Chirii, salarii, utilități (per zi)."
                    />
                   </div>
                   <div className="col-span-2">
                     <InputField
                      label="Număr Zile"
                      icon={Clock}
                      value={inputs.daysCount}
                      onChange={handleInputChange('daysCount')}
                      description="Zile pentru calculul costurilor fixe."
                    />
                   </div>
                </div>
                
                {inputs.dailyFixedExpenses > 0 && (
                   <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-sm text-orange-800 flex justify-between items-center">
                     <span>Total Fixe:</span>
                     <span className="font-bold">{formatCurrency(metrics.totalFixedCosts)}</span>
                   </div>
                )}

              </div>
            </div>
            
            {/* Context Helper */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-800">
              <p className="font-semibold mb-1">Notă de calcul:</p>
              <ul className="list-disc pl-4 space-y-1 opacity-80">
                <li>Cost Produse = Valoare Netă (fără TVA) ÷ 2</li>
                <li>Valoare Netă (fără TVA) = Valoare cu TVA ÷ {(1 + VAT_RATE).toFixed(2)}</li>
                <li>Profit Brut = Net - Marketing - Produse - Fixe</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Results & Visualization */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ResultCard
                title="Valoare Netă (fără TVA)"
                value={formatCurrency(metrics.netValueExVat)}
                icon={DollarSign}
                colorClass="text-blue-600"
                subValue={`TVA: ${formatCurrency(metrics.vatAmount)}`}
              />
              <ResultCard
                title="Cost Estimativ Produse"
                value={formatCurrency(metrics.productCost)}
                icon={Package}
                colorClass="text-red-500"
                subValue="Calculat la 50% din net"
              />
              <ResultCard
                title="Profit Brut"
                value={formatCurrency(metrics.grossProfit)}
                icon={TrendingUp}
                colorClass={metrics.grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"}
                subValue={`${metrics.profitMargin.toFixed(1)}% Marjă`}
              />
            </div>

            {/* Extra Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                 <div>
                   <p className="text-xs text-slate-500 font-medium uppercase">Comandă Medie (AOV)</p>
                   <p className="text-xl font-bold text-slate-700">{formatCurrency(metrics.averageOrderValue)}</p>
                 </div>
                 <div className="p-2 bg-slate-100 rounded-full">
                   <Percent className="w-5 h-5 text-slate-500" />
                 </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                 <div>
                   <p className="text-xs text-slate-500 font-medium uppercase">Total Încasări</p>
                   <p className="text-xl font-bold text-slate-700">{formatCurrency(inputs.totalValueWithShipping)}</p>
                 </div>
                 <div className="p-2 bg-slate-100 rounded-full">
                   <Wallet className="w-5 h-5 text-slate-500" />
                 </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Main Bar Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                <h3 className="text-base font-bold text-slate-800 mb-6">Analiză Distribuție Valoare</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" hide />
                      <YAxis 
                        tickFormatter={(value) => `${value / 1000}k`} 
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="Venit Net (fără TVA)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Cost Produse" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Cost Marketing" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Costuri Fixe" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Profit Brut" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                <h3 className="text-base font-bold text-slate-800 mb-6">Distribuție Costuri vs Profit</h3>
                <div className="h-[300px] w-full flex items-center justify-center relative">
                  {metrics.netValueExVat > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-slate-400">
                      <p>Introduceți date pentru vizualizare</p>
                    </div>
                  )}
                  {/* Center Text for Donut Chart */}
                  {metrics.netValueExVat > 0 && (
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                       <span className="text-xs text-slate-400 font-medium">Profit</span>
                       <p className={`text-xl font-bold ${metrics.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                         {((metrics.grossProfit / metrics.netValueExVat) * 100).toFixed(0)}%
                       </p>
                     </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;