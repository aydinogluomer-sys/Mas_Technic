import { useEffect, useState } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Bot, MessageSquare, Search, TrendingUp, Loader2 } from "lucide-react";

interface AnalyticsRow {
  id: string;
  event_type: string;
  query: string | null;
  question: string | null;
  category: string | null;
  created_at: string;
}

const COLORS = ["#0AA2CD", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];

export const ChatbotAnalyticsView = () => {
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: rows } = await supabase
        .from("faq_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      setData(rows ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return <IndustrialSkeleton variant="card" rows={3} />;
  }

  const totalQueries = data.length;
  const faqMatches = data.filter((d) => d.event_type === "faq_match").length;
  const aiFallbacks = data.filter((d) => d.event_type === "ai_fallback").length;
  const faqRate = totalQueries > 0 ? Math.round((faqMatches / totalQueries) * 100) : 0;

  // Pie chart data
  const pieData = [
    { name: "FAQ Eşleşme", value: faqMatches },
    { name: "AI Fallback", value: aiFallbacks },
  ];

  // Top matched FAQ questions
  const questionCounts: Record<string, number> = {};
  data.forEach((d) => {
    if (d.event_type === "faq_match" && d.question) {
      const q = d.question.length > 50 ? d.question.slice(0, 50) + "…" : d.question;
      questionCounts[q] = (questionCounts[q] || 0) + 1;
    }
  });
  const topQuestions = Object.entries(questionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Top AI fallback queries
  const fallbackCounts: Record<string, number> = {};
  data.forEach((d) => {
    if (d.event_type === "ai_fallback" && d.query) {
      const q = d.query.length > 50 ? d.query.slice(0, 50) + "…" : d.query;
      fallbackCounts[q] = (fallbackCounts[q] || 0) + 1;
    }
  });
  const topFallbacks = Object.entries(fallbackCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Daily trend (last 14 days)
  const dailyMap: Record<string, { faq: number; ai: number }> = {};
  data.forEach((d) => {
    const day = d.created_at.slice(0, 10);
    if (!dailyMap[day]) dailyMap[day] = { faq: 0, ai: 0 };
    if (d.event_type === "faq_match") dailyMap[day].faq++;
    else dailyMap[day].ai++;
  });
  const dailyTrend = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, v]) => ({ date: date.slice(5), faq: v.faq, ai: v.ai }));

  const chartConfig = {
    faq: { label: "FAQ", color: "#0AA2CD" },
    ai: { label: "AI", color: "#F59E0B" },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Toplam Sorgu", value: totalQueries, icon: MessageSquare, color: "text-[#0AA2CD]" },
          { label: "FAQ Eşleşme", value: faqMatches, icon: Search, color: "text-emerald-500" },
          { label: "AI Fallback", value: aiFallbacks, icon: Bot, color: "text-amber-500" },
          { label: "FAQ Oranı", value: `%${faqRate}`, icon: TrendingUp, color: "text-violet-500" },
        ].map((kpi) => (
          <Card key={kpi.label} className="dark:bg-slate-800/50 bg-white border dark:border-slate-700 border-slate-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs dark:text-slate-400 text-slate-500">{kpi.label}</p>
                <p className="text-xl font-bold font-mono dark:text-white text-slate-800">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card className="dark:bg-slate-800/50 bg-white border dark:border-slate-700 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm dark:text-white text-slate-800">FAQ vs AI Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {totalQueries === 0 ? (
              <p className="text-center text-sm dark:text-slate-500 text-slate-400 py-10">Henüz veri yok</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                  <span className="dark:text-slate-400 text-slate-500">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card className="lg:col-span-2 dark:bg-slate-800/50 bg-white border dark:border-slate-700 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm dark:text-white text-slate-800">Günlük Kullanım Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTrend.length === 0 ? (
              <p className="text-center text-sm dark:text-slate-500 text-slate-400 py-10">Henüz veri yok</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="faq" fill="#0AA2CD" radius={[3, 3, 0, 0]} name="FAQ" />
                  <Bar dataKey="ai" fill="#F59E0B" radius={[3, 3, 0, 0]} name="AI" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top FAQ Questions */}
        <Card className="dark:bg-slate-800/50 bg-white border dark:border-slate-700 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm dark:text-white text-slate-800">En Çok Eşleşen FAQ Soruları</CardTitle>
          </CardHeader>
          <CardContent>
            {topQuestions.length === 0 ? (
              <p className="text-sm dark:text-slate-500 text-slate-400">Henüz veri yok</p>
            ) : (
              <div className="space-y-2">
                {topQuestions.map((q, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b dark:border-slate-700/50 border-slate-100 last:border-0">
                    <span className="text-xs dark:text-slate-300 text-slate-600 truncate flex-1">{q.name}</span>
                    <span className="text-xs font-mono font-bold text-[#0AA2CD] shrink-0">{q.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top AI Fallback Queries */}
        <Card className="dark:bg-slate-800/50 bg-white border dark:border-slate-700 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm dark:text-white text-slate-800">AI'ya Yönlendirilen Sorular</CardTitle>
          </CardHeader>
          <CardContent>
            {topFallbacks.length === 0 ? (
              <p className="text-sm dark:text-slate-500 text-slate-400">Henüz veri yok</p>
            ) : (
              <div className="space-y-2">
                {topFallbacks.map((q, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b dark:border-slate-700/50 border-slate-100 last:border-0">
                    <span className="text-xs dark:text-slate-300 text-slate-600 truncate flex-1">{q.name}</span>
                    <span className="text-xs font-mono font-bold text-amber-500 shrink-0">{q.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
