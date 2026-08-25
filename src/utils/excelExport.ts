// xlsx-js-style is dynamically imported inside exportExcelReport() to keep
// the ~322KB (gzipped) library out of the landing-page bundle.
// Types are pulled in at compile time only — the runtime module is loaded lazily.
import type * as XLSXNS from "xlsx-js-style";
import { supabase } from "@/integrations/supabase/client";

// Runtime namespace — populated lazily on first export call.
// Typed as the same shape as the static import so existing `XLSX.utils.*` calls type-check.
let XLSX: typeof XLSXNS;

const XLSX_RETRY_DELAYS_MS = [200, 800, 3200] as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadXlsx() {
  let lastError: unknown;
  for (let attempt = 0; attempt <= XLSX_RETRY_DELAYS_MS.length; attempt++) {
    try {
      const mod = await import("xlsx-js-style");
      return (mod as unknown as { default: typeof XLSXNS }).default ?? (mod as unknown as typeof XLSXNS);
    } catch (error) {
      lastError = error;
      const delay = XLSX_RETRY_DELAYS_MS[attempt];
      if (delay) await wait(delay);
    }
  }
  throw lastError;
}

/* ── Brand Colors ── */
const BRAND = {
  primary: "0688AD",      // teal/cyan
  primaryDark: "056B8A",  // darker teal for headers
  primaryLight: "E8F6FA", // very light teal for alternating rows
  accentLight: "D0EEF5",  // light teal for sub-headers
  white: "FFFFFF",
  dark: "1E293B",         // slate-800
  gray: "F1F5F9",         // slate-100
  border: "B0D4E0",       // teal-ish border
  red: "DC2626",
  green: "16A34A",
  textDark: "0F172A",
  textLight: "FFFFFF",
};

const FONT_MAIN = "Space Grotesk";
const FONT_MONO = "IBM Plex Mono";

/* ── Style presets ── */
const sTitle: XLSXNS.CellStyle = {
  font: { name: FONT_MAIN, sz: 16, bold: true, color: { rgb: BRAND.white } },
  fill: { fgColor: { rgb: BRAND.primaryDark } },
  alignment: { horizontal: "center", vertical: "center" },
};

const sSubtitle: XLSXNS.CellStyle = {
  font: { name: FONT_MAIN, sz: 10, color: { rgb: BRAND.primaryDark } },
  fill: { fgColor: { rgb: BRAND.accentLight } },
  alignment: { horizontal: "center", vertical: "center" },
};

const sHeader: XLSXNS.CellStyle = {
  font: { name: FONT_MAIN, sz: 11, bold: true, color: { rgb: BRAND.white } },
  fill: { fgColor: { rgb: BRAND.primary } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    bottom: { style: "medium", color: { rgb: BRAND.primaryDark } },
    right: { style: "thin", color: { rgb: BRAND.primaryDark } },
  },
};

const sCell = (row: number): XLSXNS.CellStyle => ({
  font: { name: FONT_MONO, sz: 10, color: { rgb: BRAND.textDark } },
  fill: { fgColor: { rgb: row % 2 === 0 ? BRAND.white : BRAND.primaryLight } },
  border: {
    bottom: { style: "thin", color: { rgb: BRAND.border } },
    right: { style: "thin", color: { rgb: BRAND.border } },
  },
  alignment: { vertical: "center" },
});

const sCellNum = (row: number): XLSXNS.CellStyle => ({
  ...sCell(row),
  alignment: { horizontal: "right", vertical: "center" },
  numFmt: '#,##0',
});

const sCellDec = (row: number): XLSXNS.CellStyle => ({
  ...sCell(row),
  alignment: { horizontal: "right", vertical: "center" },
  numFmt: '#,##0.00',
});

const sTotalRow: XLSXNS.CellStyle = {
  font: { name: FONT_MAIN, sz: 11, bold: true, color: { rgb: BRAND.white } },
  fill: { fgColor: { rgb: BRAND.primaryDark } },
  alignment: { horizontal: "right", vertical: "center" },
  border: { top: { style: "medium", color: { rgb: BRAND.primary } } },
  numFmt: '#,##0',
};

const sTotalLabel: XLSXNS.CellStyle = {
  ...sTotalRow,
  alignment: { horizontal: "left", vertical: "center" },
};

const sKpiCategory: XLSXNS.CellStyle = {
  font: { name: FONT_MAIN, sz: 10, bold: true, color: { rgb: BRAND.primary } },
  fill: { fgColor: { rgb: BRAND.accentLight } },
  alignment: { vertical: "center" },
  border: { bottom: { style: "thin", color: { rgb: BRAND.border } } },
};

const sKpiMetric: XLSXNS.CellStyle = {
  font: { name: FONT_MAIN, sz: 10, color: { rgb: BRAND.textDark } },
  alignment: { vertical: "center" },
  border: { bottom: { style: "thin", color: { rgb: BRAND.border } } },
};

const sKpiValue: XLSXNS.CellStyle = {
  font: { name: FONT_MONO, sz: 11, bold: true, color: { rgb: BRAND.primaryDark } },
  alignment: { horizontal: "right", vertical: "center" },
  border: { bottom: { style: "thin", color: { rgb: BRAND.border } } },
  numFmt: '#,##0',
};

const sCritical: XLSXNS.CellStyle = {
  font: { name: FONT_MONO, sz: 10, bold: true, color: { rgb: BRAND.red } },
  fill: { fgColor: { rgb: "FEE2E2" } },
  alignment: { vertical: "center" },
};

const sNormal: XLSXNS.CellStyle = {
  font: { name: FONT_MONO, sz: 10, color: { rgb: BRAND.green } },
  fill: { fgColor: { rgb: "DCFCE7" } },
  alignment: { vertical: "center" },
};

/* ── Helpers ── */
type ColDef = { key: string; label: string; num?: boolean; date?: boolean; decimal?: boolean };

const fmtDate = (v: any) => (v ? String(v).split("T")[0] : "");

function pivot(rows: Record<string, any>[], groupKey: string, valueKey?: string) {
  const map: Record<string, { count: number; total: number }> = {};
  rows.forEach((r) => {
    const k = String(r[groupKey] || "Belirsiz");
    if (!map[k]) map[k] = { count: 0, total: 0 };
    map[k].count++;
    if (valueKey) map[k].total += Number(r[valueKey]) || 0;
  });
  return Object.entries(map).map(([label, v]) => ({ label, ...v }));
}

function applyStyles(ws: XLSXNS.WorkSheet, range: XLSXNS.Range, styleFn: (r: number, c: number) => XLSXNS.CellStyle) {
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { v: "", t: "s" };
      ws[addr].s = styleFn(R, C);
    }
  }
}

function buildSheet(rows: Record<string, any>[], cols: ColDef[]): XLSXNS.WorkSheet {
  const header = cols.map((c) => c.label);
  const data = rows.map((r) =>
    cols.map((c) => {
      const raw = r[c.key];
      if (c.date) return fmtDate(raw);
      if (c.num || c.decimal) return raw != null ? Number(raw) : "";
      return raw ?? "";
    })
  );
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: data.length, c: cols.length - 1 } }) };
  ws["!cols"] = cols.map((c) => ({ wch: Math.max(c.label.length + 4, c.num || c.decimal ? 16 : c.date ? 14 : 22) }));
  ws["!rows"] = [{ hpt: 28 }, ...data.map(() => ({ hpt: 22 }))];

  // Style header row
  for (let C = 0; C < cols.length; C++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[addr]) ws[addr].s = sHeader;
  }
  // Style data rows
  for (let R = 0; R < data.length; R++) {
    for (let C = 0; C < cols.length; C++) {
      const addr = XLSX.utils.encode_cell({ r: R + 1, c: C });
      if (ws[addr]) {
        if (cols[C].decimal) ws[addr].s = sCellDec(R);
        else if (cols[C].num) ws[addr].s = sCellNum(R);
        else ws[addr].s = sCell(R);
      }
    }
  }
  return ws;
}

function buildPivotSheet(title: string, data: { label: string; count: number; total: number }[], showTotal: boolean, totalLabel: string): XLSXNS.WorkSheet {
  const headers = showTotal ? [title, "", ""] : [title, ""];
  const colHeaders = showTotal ? ["Durum / Tür", "Adet", totalLabel] : ["Durum / Tür", "Adet"];
  const rows = data.map((d) => showTotal ? [d.label, d.count, d.total] : [d.label, d.count]);
  const sumCount = data.reduce((s, d) => s + d.count, 0);
  const sumTotal = data.reduce((s, d) => s + d.total, 0);
  const totalRow = showTotal ? ["TOPLAM", sumCount, sumTotal] : ["TOPLAM", sumCount];

  const allRows = [headers, colHeaders, ...rows, [], totalRow];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  const numCols = showTotal ? 3 : 2;

  ws["!cols"] = [{ wch: 24 }, { wch: 12 }, ...(showTotal ? [{ wch: 20 }] : [])];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }];
  ws["!rows"] = [{ hpt: 30 }, { hpt: 26 }, ...rows.map(() => ({ hpt: 22 })), { hpt: 10 }, { hpt: 26 }];

  // Title
  const titleAddr = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (ws[titleAddr]) ws[titleAddr].s = sTitle;
  for (let c = 1; c < numCols; c++) {
    const a = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[a]) ws[a] = { v: "", t: "s" };
    ws[a].s = sTitle;
  }

  // Column headers
  for (let C = 0; C < numCols; C++) {
    const addr = XLSX.utils.encode_cell({ r: 1, c: C });
    if (ws[addr]) ws[addr].s = sHeader;
  }

  // Data rows
  for (let R = 0; R < rows.length; R++) {
    for (let C = 0; C < numCols; C++) {
      const addr = XLSX.utils.encode_cell({ r: R + 2, c: C });
      if (ws[addr]) {
        ws[addr].s = C === 0 ? sCell(R) : (showTotal && C === 2 ? sCellDec(R) : sCellNum(R));
      }
    }
  }

  // Total row
  const totalRowIdx = rows.length + 3;
  for (let C = 0; C < numCols; C++) {
    const addr = XLSX.utils.encode_cell({ r: totalRowIdx, c: C });
    if (ws[addr]) ws[addr].s = C === 0 ? sTotalLabel : sTotalRow;
  }

  return ws;
}

function kpiRow(category: string, metric: string, value: number | string) {
  return [category, metric, value];
}

/* ── MAIN EXPORT ── */
export type ExportProgressCallback = (progress: number) => void;

export async function exportExcelReport(activeTab: string, onProgress?: ExportProgressCallback) {
  // Dynamically load xlsx-js-style only when the user actually exports a report.
  if (!XLSX) {
    XLSX = await loadXlsx();
  }

  const now = new Date().toISOString().split("T")[0];
  const wb = XLSX.utils.book_new();

  const tabTR: Record<string, string> = {
    dashboard: "Genel Özet", rfq: "Talepler", orders: "Siparişler", wbs: "İş Akışı",
    scheduling: "Planlama", financial: "Finansal", pipeline: "Pipeline",
    tpm: "TPM & Bakım", inventory: "Envanter", financedocs: "Nakit Akışı",
    issues: "Olaylar", customers: "Çözüm Ortakları", support: "Destek",
  };

  if (activeTab === "dashboard") {
    const [rfqAll, ordersAll, issuesAll, finAll, custAll, pipeAll, maintAll, schedAll, rawMatAll, toolAll, supportAll, wbsAll, meetAll] = await Promise.all([
      supabase.from("rfqs").select("*"),
      supabase.from("orders").select("*"),
      supabase.from("issues").select("*"),
      supabase.from("financial_documents").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("pipeline_leads").select("*"),
      supabase.from("maintenance_logs").select("*"),
      supabase.from("machine_schedule").select("*"),
      supabase.from("raw_materials").select("*"),
      supabase.from("tool_inventory").select("*"),
      supabase.from("support_tickets").select("*"),
      supabase.from("wbs").select("*"),
      supabase.from("meetings").select("*"),
    ]);

    const rfqs = rfqAll.data || [];
    const orders = ordersAll.data || [];
    const issues = issuesAll.data || [];
    const fins = finAll.data || [];
    const custs = custAll.data || [];
    const pipes = pipeAll.data || [];
    const maints = maintAll.data || [];
    const scheds = schedAll.data || [];
    const raws = rawMatAll.data || [];
    const tools = toolAll.data || [];
    const tickets = supportAll.data || [];
    const wbsItems = wbsAll.data || [];
    const meetings = meetAll.data || [];

    // ── SHEET 1: İÇİNDEKİLER ──
    const reportDate = new Date().toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" });
    const tocRows = [
      ["MAS TECHNIC — YÖNETİM RAPORU"],
      [`Rapor Tarihi: ${reportDate}`],
      [""],
      ["Sayfa No", "Sayfa Adı", "Açıklama"],
      [1, "İçindekiler", "Bu sayfa"],
      [2, "Dashboard KPI", "Tüm modüllerin özet metrikleri"],
      [3, "RFQ Pivot", "Talep durumlarına göre dağılım"],
      [4, "Sipariş Pivot", "Sipariş durumlarına göre dağılım"],
      [5, "Finansal Özet", "Gelir, gider, KDV analizi"],
      [6, "Pipeline Pivot", "Satış aşamalarına göre dağılım"],
      [7, "Sorunlar Pivot", "Ciddiyet dağılımı"],
      [8, "Bakım Pivot", "Bakım türlerine göre dağılım"],
      [9, "Envanter Özet", "Hammadde & takım stok durumu"],
      [10, "WBS Pivot", "İş akışı durum dağılımı"],
      [11, "Destek & Toplantı", "Destek talepleri ve toplantı özeti"],
      [12, "Talepler (Ham)", "Tüm RFQ verileri"],
      [13, "Siparişler (Ham)", "Tüm sipariş verileri"],
      [14, "Müşteriler (Ham)", "Tüm müşteri verileri"],
    ];
    const wsToc = XLSX.utils.aoa_to_sheet(tocRows);
    wsToc["!cols"] = [{ wch: 12 }, { wch: 24 }, { wch: 44 }];
    wsToc["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    ];
    wsToc["!rows"] = [{ hpt: 36 }, { hpt: 24 }, { hpt: 10 }, { hpt: 26 }, ...Array(14).fill({ hpt: 22 })];

    // Style TOC
    const tocTitle = XLSX.utils.encode_cell({ r: 0, c: 0 });
    if (wsToc[tocTitle]) wsToc[tocTitle].s = sTitle;
    for (let c = 1; c <= 2; c++) {
      const a = XLSX.utils.encode_cell({ r: 0, c });
      if (!wsToc[a]) wsToc[a] = { v: "", t: "s" };
      wsToc[a].s = sTitle;
    }
    const tocSub = XLSX.utils.encode_cell({ r: 1, c: 0 });
    if (wsToc[tocSub]) wsToc[tocSub].s = sSubtitle;
    for (let c = 1; c <= 2; c++) {
      const a = XLSX.utils.encode_cell({ r: 1, c });
      if (!wsToc[a]) wsToc[a] = { v: "", t: "s" };
      wsToc[a].s = sSubtitle;
    }
    for (let C = 0; C < 3; C++) {
      const addr = XLSX.utils.encode_cell({ r: 3, c: C });
      if (wsToc[addr]) wsToc[addr].s = sHeader;
    }
    for (let R = 4; R < tocRows.length; R++) {
      for (let C = 0; C < 3; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (wsToc[addr]) wsToc[addr].s = C === 0 ? sCellNum(R) : sCell(R);
      }
    }
    XLSX.utils.book_append_sheet(wb, wsToc, "İçindekiler");

    // ── SHEET 2: DASHBOARD KPI ──
    const avgProgress = orders.length ? Math.round(orders.reduce((s, o) => s + (o.progress || 0), 0) / orders.length) : 0;
    const overdueOrders = orders.filter((o) => o.deadline && new Date(o.deadline) < new Date() && o.status !== "Tamamlandı").length;
    const totalIncome = fins.filter((f) => f.doc_type === "fatura" || f.doc_type === "gelir").reduce((s, f) => s + (Number(f.total_amount) || 0), 0);
    const totalExpense = fins.filter((f) => f.doc_type === "gider" || f.doc_type === "masraf").reduce((s, f) => s + (Number(f.total_amount) || 0), 0);
    const totalVat = fins.reduce((s, f) => s + (Number(f.vat_amount) || 0), 0);
    const unpaidDocs = fins.filter((f) => f.payment_status === "ödenmedi").length;
    const totalPipeValue = pipes.reduce((s, p) => s + (Number(p.value) || 0), 0);
    const weightedPipe = pipes.reduce((s, p) => s + (Number(p.value) || 0) * ((p.probability || 0) / 100), 0);
    const openIssues = issues.filter((i) => i.status === "Açık").length;
    const issueCost = issues.reduce((s, i) => s + (Number(i.cost) || 0), 0);
    const maintCost = maints.reduce((s, m) => s + (Number(m.cost) || 0), 0);
    const rawValue = raws.reduce((s, r) => s + (Number(r.stock) || 0) * (Number(r.unit_cost) || 0), 0);
    const toolValue = tools.reduce((s, t) => s + (Number(t.stock) || 0) * (Number(t.unit_cost) || 0), 0);
    const lowStockTools = tools.filter((t) => (t.stock || 0) <= (t.min_stock || 5)).length;
    const openTickets = tickets.filter((t) => t.status === "open").length;
    const closedTickets = tickets.filter((t) => t.status === "closed" || t.status === "resolved").length;
    const totalBalance = custs.reduce((s, c) => s + (Number(c.balance) || 0), 0);
    const pendingMeetings = meetings.filter((m) => m.status === "pending").length;
    const confirmedMeetings = meetings.filter((m) => m.status === "confirmed").length;
    const totalQuoted = rfqs.reduce((s, r) => s + (Number(r.quoted_price) || 0), 0);

    const kpiData: any[][] = [
      ["DASHBOARD — KPI TABLOSU", "", ""],
      ["", "", ""],
      ["Kategori", "Metrik", "Değer"],
      kpiRow("Genel", "Toplam RFQ Talebi", rfqs.length),
      kpiRow("Genel", "Toplam Sipariş", orders.length),
      kpiRow("Genel", "Toplam Müşteri", custs.length),
      kpiRow("Genel", "Açık Sorun", openIssues),
      kpiRow("Genel", "Açık Destek Talebi", openTickets),
      ["", "", ""],
      kpiRow("RFQ", "Toplam Teklif Tutarı (₺)", totalQuoted),
      ["", "", ""],
      kpiRow("Sipariş", "Ortalama İlerleme (%)", avgProgress),
      kpiRow("Sipariş", "Geciken Sipariş", overdueOrders),
      ["", "", ""],
      kpiRow("Finansal", "Toplam Gelir (₺)", totalIncome),
      kpiRow("Finansal", "Toplam Gider (₺)", totalExpense),
      kpiRow("Finansal", "Net (₺)", totalIncome - totalExpense),
      kpiRow("Finansal", "Toplam KDV (₺)", Math.round(totalVat * 100) / 100),
      kpiRow("Finansal", "Ödenmemiş Belge", unpaidDocs),
      ["", "", ""],
      kpiRow("Pipeline", "Toplam Değer (₺)", totalPipeValue),
      kpiRow("Pipeline", "Ağırlıklı Değer (₺)", Math.round(weightedPipe)),
      ["", "", ""],
      kpiRow("Sorunlar", "Toplam Sorun", issues.length),
      kpiRow("Sorunlar", "Toplam Maliyet (₺)", issueCost),
      ["", "", ""],
      kpiRow("Bakım", "Toplam Kayıt", maints.length),
      kpiRow("Bakım", "Toplam Maliyet (₺)", maintCost),
      ["", "", ""],
      kpiRow("Envanter", "Hammadde Çeşidi", raws.length),
      kpiRow("Envanter", "Hammadde Toplam Değer (₺)", Math.round(rawValue)),
      kpiRow("Envanter", "Takım Çeşidi", tools.length),
      kpiRow("Envanter", "Takım Toplam Değer (₺)", Math.round(toolValue)),
      kpiRow("Envanter", "Kritik Stok Takım", lowStockTools),
      ["", "", ""],
      kpiRow("İş Akışı", "Toplam WBS Kaydı", wbsItems.length),
      ["", "", ""],
      kpiRow("Destek", "Toplam Talep", tickets.length),
      kpiRow("Destek", "Açık Talep", openTickets),
      kpiRow("Destek", "Çözülen Talep", closedTickets),
      ["", "", ""],
      kpiRow("Toplantı", "Toplam Toplantı", meetings.length),
      kpiRow("Toplantı", "Bekleyen", pendingMeetings),
      kpiRow("Toplantı", "Onaylanan", confirmedMeetings),
      ["", "", ""],
      kpiRow("Müşteri", "Toplam Bakiye (₺)", Math.round(totalBalance)),
      kpiRow("Planlama", "Aktif Çizelge Kaydı", scheds.length),
    ];

    const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
    wsKpi["!cols"] = [{ wch: 16 }, { wch: 34 }, { wch: 20 }];
    wsKpi["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    wsKpi["!rows"] = [{ hpt: 32 }, { hpt: 8 }, { hpt: 26 }, ...kpiData.slice(3).map(() => ({ hpt: 22 }))];

    // Style KPI title
    const kpiTitle = XLSX.utils.encode_cell({ r: 0, c: 0 });
    if (wsKpi[kpiTitle]) wsKpi[kpiTitle].s = sTitle;
    for (let c = 1; c <= 2; c++) {
      const a = XLSX.utils.encode_cell({ r: 0, c });
      if (!wsKpi[a]) wsKpi[a] = { v: "", t: "s" };
      wsKpi[a].s = sTitle;
    }
    // Column headers
    for (let C = 0; C < 3; C++) {
      const addr = XLSX.utils.encode_cell({ r: 2, c: C });
      if (wsKpi[addr]) wsKpi[addr].s = sHeader;
    }
    // Data rows
    for (let R = 3; R < kpiData.length; R++) {
      const row = kpiData[R];
      if (!row[0] && !row[1]) continue; // skip spacer
      for (let C = 0; C < 3; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (wsKpi[addr]) {
          if (C === 0) wsKpi[addr].s = sKpiCategory;
          else if (C === 1) wsKpi[addr].s = sKpiMetric;
          else wsKpi[addr].s = sKpiValue;
        }
      }
    }
    XLSX.utils.book_append_sheet(wb, wsKpi, "Dashboard KPI");

    // ── PIVOT SHEETS ──
    XLSX.utils.book_append_sheet(wb, buildPivotSheet("RFQ DURUM DAĞILIMI", pivot(rfqs, "status", "quoted_price"), true, "Tutar (₺)"), "RFQ Pivot");
    XLSX.utils.book_append_sheet(wb, buildPivotSheet("SİPARİŞ DURUM DAĞILIMI", pivot(orders, "status"), false, ""), "Sipariş Pivot");
    XLSX.utils.book_append_sheet(wb, buildPivotSheet("FİNANSAL BELGE DAĞILIMI", pivot(fins, "doc_type", "total_amount"), true, "Toplam (₺)"), "Finansal Özet");
    XLSX.utils.book_append_sheet(wb, buildPivotSheet("PİPELİNE AŞAMA DAĞILIMI", pivot(pipes, "stage", "value"), true, "Değer (₺)"), "Pipeline Pivot");
    XLSX.utils.book_append_sheet(wb, buildPivotSheet("SORUN CİDDİYET DAĞILIMI", pivot(issues, "severity", "cost"), true, "Maliyet (₺)"), "Sorunlar Pivot");
    XLSX.utils.book_append_sheet(wb, buildPivotSheet("BAKIM TÜR DAĞILIMI", pivot(maints, "type", "cost"), true, "Maliyet (₺)"), "Bakım Pivot");

    // Envanter Özet (custom styled)
    const envRows: any[][] = [
      ["ENVANTER ÖZET RAPORU", "", "", "", "", ""],
      [""],
      ["HAMMADDE STOK DURUMU", "", "", "", "", ""],
      ["Kod", "Ad", "Stok", "Birim Fiyat (₺)", "Toplam Değer (₺)", "Birim"],
      ...raws.map((r) => [r.code, r.name, r.stock || 0, Number(r.unit_cost) || 0, (r.stock || 0) * (Number(r.unit_cost) || 0), r.unit || ""]),
      ["TOPLAM", "", raws.reduce((s, r) => s + (r.stock || 0), 0), "", Math.round(rawValue), ""],
      [""],
      ["TAKIM STOK DURUMU", "", "", "", "", ""],
      ["Kod", "Ad", "Stok", "Min Stok", "Birim Fiyat (₺)", "Durum"],
      ...tools.map((t) => [t.code, t.name, t.stock || 0, t.min_stock || 5, Number(t.unit_cost) || 0, (t.stock || 0) <= (t.min_stock || 5) ? "⚠ KRİTİK" : "✓ Normal"]),
      ["TOPLAM", "", tools.reduce((s, t) => s + (t.stock || 0), 0), "", Math.round(toolValue), ""],
    ];
    const wsEnv = XLSX.utils.aoa_to_sheet(envRows);
    wsEnv["!cols"] = [{ wch: 16 }, { wch: 28 }, { wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 14 }];
    wsEnv["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    ];

    // Style envanter title + section headers
    for (let c = 0; c < 6; c++) {
      const a0 = XLSX.utils.encode_cell({ r: 0, c });
      if (!wsEnv[a0]) wsEnv[a0] = { v: "", t: "s" };
      wsEnv[a0].s = sTitle;
      const a2 = XLSX.utils.encode_cell({ r: 2, c });
      if (!wsEnv[a2]) wsEnv[a2] = { v: "", t: "s" };
      wsEnv[a2].s = { ...sSubtitle, font: { ...sSubtitle.font, sz: 12, bold: true } };
    }
    // Hammadde header row
    for (let c = 0; c < 6; c++) {
      const addr = XLSX.utils.encode_cell({ r: 3, c });
      if (wsEnv[addr]) wsEnv[addr].s = sHeader;
    }
    // Hammadde data
    for (let R = 0; R < raws.length; R++) {
      for (let C = 0; C < 6; C++) {
        const addr = XLSX.utils.encode_cell({ r: R + 4, c: C });
        if (wsEnv[addr]) wsEnv[addr].s = (C >= 2 && C <= 4) ? sCellNum(R) : sCell(R);
      }
    }
    // Hammadde total
    const hmTotalRow = 4 + raws.length;
    for (let C = 0; C < 6; C++) {
      const addr = XLSX.utils.encode_cell({ r: hmTotalRow, c: C });
      if (wsEnv[addr]) wsEnv[addr].s = C === 0 ? sTotalLabel : sTotalRow;
    }

    // Takım section header
    const toolSecHeaderRow = hmTotalRow + 2;
    const toolColHeaderRow = hmTotalRow + 3;
    wsEnv["!merges"]!.push({ s: { r: toolSecHeaderRow, c: 0 }, e: { r: toolSecHeaderRow, c: 5 } });
    for (let c = 0; c < 6; c++) {
      const a = XLSX.utils.encode_cell({ r: toolSecHeaderRow, c });
      if (!wsEnv[a]) wsEnv[a] = { v: "", t: "s" };
      wsEnv[a].s = { ...sSubtitle, font: { ...sSubtitle.font, sz: 12, bold: true } };
      const ah = XLSX.utils.encode_cell({ r: toolColHeaderRow, c });
      if (wsEnv[ah]) wsEnv[ah].s = sHeader;
    }
    // Tool data
    for (let R = 0; R < tools.length; R++) {
      for (let C = 0; C < 6; C++) {
        const addr = XLSX.utils.encode_cell({ r: toolColHeaderRow + 1 + R, c: C });
        if (wsEnv[addr]) {
          if (C === 5) {
            // Status column
            const t = tools[R];
            wsEnv[addr].s = (t.stock || 0) <= (t.min_stock || 5) ? sCritical : sNormal;
          } else {
            wsEnv[addr].s = (C >= 2 && C <= 4) ? sCellNum(R) : sCell(R);
          }
        }
      }
    }
    // Tool total
    const toolTotalRow = toolColHeaderRow + 1 + tools.length;
    for (let C = 0; C < 6; C++) {
      const addr = XLSX.utils.encode_cell({ r: toolTotalRow, c: C });
      if (wsEnv[addr]) wsEnv[addr].s = C === 0 ? sTotalLabel : sTotalRow;
    }

    XLSX.utils.book_append_sheet(wb, wsEnv, "Envanter Özet");

    // WBS Pivot
    XLSX.utils.book_append_sheet(wb, buildPivotSheet("İŞ AKIŞI DURUM DAĞILIMI", pivot(wbsItems, "status"), false, ""), "WBS Pivot");

    // Destek & Toplantı (styled)
    const destekRows: any[][] = [
      ["DESTEK & TOPLANTI ÖZETİ", ""],
      [""],
      ["Destek Metrikleri", "Değer"],
      ["Toplam Talep", tickets.length],
      ["Açık", openTickets],
      ["Çözülen", closedTickets],
      [""],
      ["Toplantı Metrikleri", "Değer"],
      ["Toplam", meetings.length],
      ["Bekleyen", pendingMeetings],
      ["Onaylanan", confirmedMeetings],
    ];
    const wsDestek = XLSX.utils.aoa_to_sheet(destekRows);
    wsDestek["!cols"] = [{ wch: 26 }, { wch: 16 }];
    wsDestek["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
    for (let c = 0; c < 2; c++) {
      const a = XLSX.utils.encode_cell({ r: 0, c });
      if (!wsDestek[a]) wsDestek[a] = { v: "", t: "s" };
      wsDestek[a].s = sTitle;
    }
    for (const hRow of [2, 7]) {
      for (let c = 0; c < 2; c++) {
        const a = XLSX.utils.encode_cell({ r: hRow, c });
        if (wsDestek[a]) wsDestek[a].s = sHeader;
      }
    }
    for (const dataRange of [[3, 5], [8, 10]]) {
      for (let R = dataRange[0]; R <= dataRange[1]; R++) {
        for (let C = 0; C < 2; C++) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (wsDestek[addr]) wsDestek[addr].s = C === 0 ? sKpiMetric : sKpiValue;
        }
      }
    }
    XLSX.utils.book_append_sheet(wb, wsDestek, "Destek & Toplantı");

    // ── RAW DATA SHEETS ──
    XLSX.utils.book_append_sheet(wb, buildSheet(rfqs, [
      { key: "id", label: "ID" }, { key: "customer", label: "Müşteri" }, { key: "company", label: "Firma" },
      { key: "material", label: "Malzeme" }, { key: "service", label: "Hizmet" },
      { key: "quantity", label: "Miktar", num: true }, { key: "status", label: "Durum" },
      { key: "date", label: "Tarih", date: true }, { key: "quoted_price", label: "Fiyat (₺)", num: true },
    ]), "Talepler (Ham)");

    XLSX.utils.book_append_sheet(wb, buildSheet(orders, [
      { key: "id", label: "ID" }, { key: "part_name", label: "Parça" }, { key: "customer", label: "Müşteri" },
      { key: "quantity", label: "Miktar", num: true }, { key: "status", label: "Durum" },
      { key: "progress", label: "İlerleme (%)", num: true }, { key: "machine", label: "Makine" },
      { key: "deadline", label: "Termin", date: true },
    ]), "Siparişler (Ham)");

    XLSX.utils.book_append_sheet(wb, buildSheet(custs, [
      { key: "name", label: "Ad" }, { key: "company", label: "Firma" }, { key: "city", label: "Şehir" },
      { key: "phone", label: "Telefon" }, { key: "email", label: "Email" },
      { key: "balance", label: "Bakiye (₺)", num: true },
    ]), "Müşteriler (Ham)");

  } else {
    /* ── SINGLE-TAB EXPORT ── */
    switch (activeTab) {
      case "rfq": {
        const { data } = await supabase.from("rfqs").select("*").order("created_at", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "id", label: "ID" }, { key: "customer", label: "Müşteri" }, { key: "company", label: "Firma" },
          { key: "material", label: "Malzeme" }, { key: "service", label: "Hizmet" },
          { key: "quantity", label: "Miktar", num: true }, { key: "status", label: "Durum" },
          { key: "date", label: "Tarih", date: true }, { key: "quoted_price", label: "Fiyat (₺)", num: true },
        ]), "Talepler");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("RFQ DURUM DAĞILIMI", pivot(rows, "status", "quoted_price"), true, "Tutar (₺)"), "Durum Pivot");
        break;
      }
      case "orders": {
        const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "id", label: "ID" }, { key: "part_name", label: "Parça" }, { key: "customer", label: "Müşteri" },
          { key: "quantity", label: "Miktar", num: true }, { key: "status", label: "Durum" },
          { key: "progress", label: "İlerleme (%)", num: true }, { key: "machine", label: "Makine" },
          { key: "deadline", label: "Termin", date: true },
        ]), "Siparişler");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("SİPARİŞ DURUM DAĞILIMI", pivot(rows, "status"), false, ""), "Durum Pivot");
        break;
      }
      case "wbs": {
        const { data } = await supabase.from("wbs").select("*").order("created_at", { ascending: false });
        XLSX.utils.book_append_sheet(wb, buildSheet(data || [], [
          { key: "id", label: "ID" }, { key: "order_id", label: "Sipariş" }, { key: "part_name", label: "Parça" },
          { key: "customer", label: "Müşteri" }, { key: "current_step", label: "Adım", num: true },
          { key: "status", label: "Durum" }, { key: "deadline", label: "Termin", date: true },
        ]), "İş Akışı");
        break;
      }
      case "scheduling": {
        const { data } = await supabase.from("machine_schedule").select("*").order("week_start", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "machine", label: "Makine" }, { key: "day", label: "Gün" },
          { key: "week_start", label: "Hafta Başı", date: true }, { key: "job_name", label: "İş Adı" },
          { key: "hours", label: "Saat", num: true },
        ]), "Planlama");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("MAKİNE DAĞILIMI", pivot(rows, "machine", "hours"), true, "Toplam Saat"), "Makine Pivot");
        break;
      }
      case "financial": {
        const { data } = await supabase.from("financial_documents").select("*").order("created_at", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "doc_number", label: "Belge No" }, { key: "doc_type", label: "Tür" },
          { key: "title", label: "Başlık" }, { key: "amount", label: "Tutar (₺)", decimal: true },
          { key: "vat_amount", label: "KDV (₺)", decimal: true }, { key: "total_amount", label: "Toplam (₺)", decimal: true },
          { key: "payment_status", label: "Ödeme Durumu" }, { key: "due_date", label: "Vade", date: true },
        ]), "Finansal");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("BELGE TÜRÜ DAĞILIMI", pivot(rows, "doc_type", "total_amount"), true, "Toplam (₺)"), "Tür Pivot");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("ÖDEME DURUMU DAĞILIMI", pivot(rows, "payment_status", "total_amount"), true, "Toplam (₺)"), "Ödeme Pivot");
        break;
      }
      case "pipeline": {
        const { data } = await supabase.from("pipeline_leads").select("*").order("created_at", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "company", label: "Firma" }, { key: "contact_name", label: "Kişi" },
          { key: "stage", label: "Aşama" }, { key: "value", label: "Değer (₺)", num: true },
          { key: "probability", label: "Olasılık (%)", num: true },
        ]), "Pipeline");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("AŞAMA DAĞILIMI", pivot(rows, "stage", "value"), true, "Değer (₺)"), "Aşama Pivot");
        break;
      }
      case "tpm": {
        const [m, h] = await Promise.all([
          supabase.from("maintenance_logs").select("*").order("date", { ascending: false }),
          supabase.from("machine_health").select("*"),
        ]);
        XLSX.utils.book_append_sheet(wb, buildSheet(m.data || [], [
          { key: "machine", label: "Makine" }, { key: "type", label: "Tür" },
          { key: "date", label: "Tarih", date: true }, { key: "technician", label: "Teknisyen" },
          { key: "cost", label: "Maliyet (₺)", num: true }, { key: "status", label: "Durum" },
        ]), "Bakım Kayıtları");
        XLSX.utils.book_append_sheet(wb, buildSheet(h.data || [], [
          { key: "name", label: "Makine" }, { key: "status", label: "Durum" },
          { key: "spindle_hours", label: "Spindle Saat", num: true },
          { key: "oil_level", label: "Yağ (%)", num: true },
          { key: "filter_life", label: "Filtre (%)", num: true },
        ]), "Makine Sağlığı");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("BAKIM TÜR DAĞILIMI", pivot(m.data || [], "type", "cost"), true, "Maliyet (₺)"), "Bakım Pivot");
        break;
      }
      case "inventory": {
        const [r, t] = await Promise.all([
          supabase.from("raw_materials").select("*").order("created_at", { ascending: false }),
          supabase.from("tool_inventory").select("*").order("created_at", { ascending: false }),
        ]);
        XLSX.utils.book_append_sheet(wb, buildSheet(r.data || [], [
          { key: "code", label: "Kod" }, { key: "name", label: "Ad" },
          { key: "stock", label: "Stok", num: true }, { key: "unit_cost", label: "Birim Fiyat (₺)", decimal: true },
          { key: "unit", label: "Birim" },
        ]), "Hammaddeler");
        XLSX.utils.book_append_sheet(wb, buildSheet(t.data || [], [
          { key: "code", label: "Kod" }, { key: "name", label: "Ad" },
          { key: "stock", label: "Stok", num: true }, { key: "unit_cost", label: "Birim Fiyat (₺)", decimal: true },
          { key: "category", label: "Kategori" },
        ]), "Takımlar");
        break;
      }
      case "issues": {
        const { data } = await supabase.from("issues").select("*").order("created_at", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "id", label: "ID" }, { key: "job", label: "İş" }, { key: "machine", label: "Makine" },
          { key: "category", label: "Kategori" }, { key: "severity", label: "Ciddiyet" },
          { key: "status", label: "Durum" }, { key: "cost", label: "Maliyet (₺)", num: true },
        ]), "Olaylar");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("CİDDİYET DAĞILIMI", pivot(rows, "severity", "cost"), true, "Maliyet (₺)"), "Ciddiyet Pivot");
        break;
      }
      case "customers": {
        const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "name", label: "Ad" }, { key: "company", label: "Firma" }, { key: "city", label: "Şehir" },
          { key: "phone", label: "Telefon" }, { key: "email", label: "Email" },
          { key: "balance", label: "Bakiye (₺)", num: true },
        ]), "Müşteriler");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("ŞEHİR DAĞILIMI", pivot(rows, "city", "balance"), true, "Toplam Bakiye (₺)"), "Şehir Pivot");
        break;
      }
      case "financedocs": {
        const { data } = await supabase.from("financial_documents").select("*").order("created_at", { ascending: false });
        XLSX.utils.book_append_sheet(wb, buildSheet(data || [], [
          { key: "doc_number", label: "Belge No" }, { key: "doc_type", label: "Tür" },
          { key: "total_amount", label: "Tutar (₺)", decimal: true }, { key: "payment_status", label: "Ödeme Durumu" },
        ]), "Nakit Akışı");
        break;
      }
      case "support": {
        const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
        const rows = data || [];
        XLSX.utils.book_append_sheet(wb, buildSheet(rows, [
          { key: "subject", label: "Konu" }, { key: "priority", label: "Öncelik" },
          { key: "status", label: "Durum" }, { key: "created_at", label: "Tarih", date: true },
        ]), "Destek");
        XLSX.utils.book_append_sheet(wb, buildPivotSheet("ÖNCELİK DAĞILIMI", pivot(rows, "priority"), false, ""), "Öncelik Pivot");
        break;
      }
      default: {
        const ws = XLSX.utils.aoa_to_sheet([["Bu sekme için rapor mevcut değil."]]);
        XLSX.utils.book_append_sheet(wb, ws, "Rapor");
      }
    }
  }

  onProgress?.(0.7);

  const fileName = `MasTechnic_${tabTR[activeTab] || "Rapor"}_${now}.xlsx`;
  XLSX.writeFile(wb, fileName);

  onProgress?.(1);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return fileName;
}
