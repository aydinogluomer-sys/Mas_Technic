import { useState } from "react";
import { TrendingUp, DollarSign, Calculator, Target, BarChart3 } from "lucide-react";

export const FinancialView = () => {
  const [fixedCost, setFixedCost] = useState(85000);
  const [unitPrice, setUnitPrice] = useState(285);
  const [variableCost, setVariableCost] = useState(142);
  const [currentSales, setCurrentSales] = useState(800);

  const bep = unitPrice - variableCost > 0 ? Math.ceil(fixedCost / (unitPrice - variableCost)) : 0;
  const marginOfSafety = currentSales > bep ? (((currentSales - bep) / currentSales) * 100).toFixed(1) : "0";
  const totalRevenue = currentSales * unitPrice;
  const totalCost = fixedCost + currentSales * variableCost;
  const profit = totalRevenue - totalCost;
  const materialMargin = unitPrice > 0 ? (((unitPrice - variableCost) / unitPrice) * 100).toFixed(1) : "0";

  // MHR data
  const machines = [
    { name: "3-Eksen İşleme Merkezi", depreciation: 10, energy: 10, maintenance: "Düşük", mhr: 55 },
    { name: "5-Eksen İşleme Merkezi", depreciation: 8, energy: 17, maintenance: "Orta-Yüksek", mhr: 185 },
    { name: "CNC Kayar Otomat", depreciation: 10, energy: 7, maintenance: "Orta", mhr: 85 },
    { name: "Tel Erozyon (EDM)", depreciation: 10, energy: 4.5, maintenance: "Düşük", mhr: 140 },
    { name: "CNC Torna", depreciation: 10, energy: 8, maintenance: "Düşük", mhr: 65 },
  ];

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Başa Baş Noktası", value: `${bep} birim`, icon: Target, color: "text-[#0AA2CD]", bg: "bg-[#0AA2CD]/10" },
          { label: "Güvenlik Marjı", value: `%${marginOfSafety}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Malzeme Marjı", value: `%${materialMargin}`, icon: BarChart3, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Net Kar/Zarar", value: `₺${profit.toLocaleString("tr-TR")}`, icon: DollarSign, color: profit >= 0 ? "text-emerald-400" : "text-red-400", bg: profit >= 0 ? "bg-emerald-400/10" : "bg-red-400/10" },
        ].map((m) => (
          <div key={m.label} className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BEP Calculator */}
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-[#0AA2CD]" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Başa Baş Hesaplayıcı</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Aylık Sabit Maliyet (₺)", value: fixedCost, setter: setFixedCost },
              { label: "Birim Satış Fiyatı (₺)", value: unitPrice, setter: setUnitPrice },
              { label: "Birim Değişken Maliyet (₺)", value: variableCost, setter: setVariableCost },
              { label: "Mevcut Aylık Satış (birim)", value: currentSales, setter: setCurrentSales },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-4">
                <label className="text-xs dark:text-slate-300 text-slate-600">{f.label}</label>
                <input
                  type="number"
                  value={f.value}
                  onChange={(e) => f.setter(Number(e.target.value))}
                  className="w-32 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-right font-mono tabular-nums text-sm focus:outline-none focus:border-[#0AA2CD]"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 dark:bg-[#0F172A] bg-slate-50 rounded-lg">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FORMÜL</p>
            <p className="text-xs dark:text-slate-300 text-slate-600 font-mono">Q<sub>BEP</sub> = FC / (P - V) = {fixedCost.toLocaleString()} / ({unitPrice} - {variableCost}) = <span className="text-[#0AA2CD] font-bold">{bep} birim</span></p>
          </div>
        </div>

        {/* MHR Table */}
        <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Makine Saat Ücreti (MHR)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                  <th className="text-left pb-2">Makine Tipi</th>
                  <th className="text-right pb-2">Amor. (Yıl)</th>
                  <th className="text-right pb-2">Enerji (kW)</th>
                  <th className="text-left pb-2">Bakım</th>
                  <th className="text-right pb-2">MHR (₺)</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m.name} className="dark:border-[#334155]/50 border-slate-100 border-b">
                    <td className="py-2 dark:text-white text-slate-800 font-medium">{m.name}</td>
                    <td className="py-2 dark:text-slate-400 text-slate-500 text-right font-mono tabular-nums">{m.depreciation}</td>
                    <td className="py-2 dark:text-slate-400 text-slate-500 text-right font-mono tabular-nums">{m.energy}</td>
                    <td className="py-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${m.maintenance === "Düşük" ? "bg-emerald-500/20 text-emerald-400" : m.maintenance.includes("Yüksek") ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {m.maintenance}
                      </span>
                    </td>
                    <td className="py-2 text-right font-bold text-[#0AA2CD] font-mono tabular-nums">{m.mhr}₺</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Profitability Strategies */}
      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Karlılık Stratejileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Ürün Karması", desc: "Yüksek katma değerli niş parçalara odaklan", pct: 85 },
            { title: "Setup Azaltma", desc: "Kurulum sürelerini %10 azalt → karlılık artar", pct: 62 },
            { title: "Tedarik Yönetimi", desc: "Toplu alım anlaşmalarıyla maliyet düşür", pct: 78 },
            { title: "Takım Ömrü", desc: "Kesici uç değişim optimizasyonu", pct: 70 },
          ].map((s) => (
            <div key={s.title} className="dark:bg-[#0F172A] bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold dark:text-white text-slate-800 mb-1">{s.title}</p>
              <p className="text-[10px] dark:text-slate-400 text-slate-500 mb-2">{s.desc}</p>
              <div className="w-full h-1.5 dark:bg-[#1E293B] bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#0AA2CD] rounded-full" style={{ width: `${s.pct}%` }} />
              </div>
              <p className="text-[10px] font-bold text-[#0AA2CD] mt-1 font-mono tabular-nums">%{s.pct} verimlilik</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
