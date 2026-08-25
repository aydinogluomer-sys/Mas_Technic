import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, FileText, Package, CreditCard, Clock, CheckCircle2, Truck, Mail, Download } from "lucide-react";
import { C } from "./dashboardConstants";

type CustomerDetail = {
  custOrders: any[];
  invoices: any[];
  payments: any[];
  unpaid: any[];
  allFins: any[];
} | null;

interface Props {
  selectedCustomer: string | null;
  onClose: () => void;
  customerDetail: CustomerDetail;
}

export const DashboardCustomerModal = ({ selectedCustomer, onClose, customerDetail }: Props) => {
  return (
    <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto dark:bg-[#0F172A] dark:border-[#334155]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-[#0AA2CD]" />
            {selectedCustomer} — Finansal Detay
          </DialogTitle>
        </DialogHeader>

        {/* Action Buttons */}
        {customerDetail && (
          <div className="flex items-center gap-2 -mt-1">
            <Button
              size="sm"
              variant="outline"
              className="text-[11px] h-8 gap-1.5 dark:border-[#334155] dark:hover:bg-white/5"
              onClick={() => {
                const custData = customerDetail.allFins.find((f: any) => f.vendor === selectedCustomer);
                const email = custData?.notes?.match(/[\w.-]+@[\w.-]+/)?.[0] || "";
                const subject = encodeURIComponent(`Finansal Özet — ${selectedCustomer}`);
                const body = encodeURIComponent(
                  `Sayın ${selectedCustomer},\n\nToplam Fatura: ${customerDetail.invoices.length}\nÖdenen: ${customerDetail.payments.length}\nBekleyen: ${customerDetail.unpaid.length}\n\nSipariş Sayısı: ${customerDetail.custOrders.length}\n\nSaygılarımızla,\nMAS Technic`
                );
                window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
                toast.success("E-posta istemcisi açılıyor...");
              }}
            >
              <Mail className="w-3.5 h-3.5" />
              E-posta Gönder
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-[11px] h-8 gap-1.5 dark:border-[#334155] dark:hover:bg-white/5"
              onClick={() => {
                const totalInvoiceAmount = customerDetail.invoices.reduce((s: number, inv: any) => s + (Number(inv.total_amount) || 0), 0);
                const totalPaidAmount = customerDetail.payments.reduce((s: number, p: any) => s + (Number(p.total_amount) || 0), 0);
                const totalUnpaidAmount = customerDetail.unpaid.reduce((s: number, u: any) => s + (Number(u.total_amount) || 0), 0);

                const invoiceRows = customerDetail.invoices.map((inv: any, idx: number) =>
                  `<tr style="background:${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}"><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:11px;color:#64748b">${inv.doc_number || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600">${inv.title || "Fatura"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b">${inv.doc_date || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b">${inv.due_date || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-weight:700">₺${(Number(inv.total_amount) || 0).toLocaleString("tr-TR")}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0"><span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;${inv.payment_status === "ödendi" ? "background:#dcfce7;color:#16a34a" : "background:#fef2f2;color:#dc2626"}">${inv.payment_status === "ödendi" ? "Ödendi" : "Bekliyor"}</span></td></tr>`
                ).join("");

                const orderRows = customerDetail.custOrders.map((ord: any, idx: number) => {
                  const sColor = ord.status === "Tamamlandı" || ord.status === "Teslim Edildi" ? "#16a34a" : ord.status === "Üretimde" ? "#0688AD" : ord.status === "İptal" ? "#dc2626" : "#ea580c";
                  return `<tr style="background:${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}"><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:11px;font-weight:600">${ord.id}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0">${ord.part_name || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-family:monospace">${ord.quantity || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0"><span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;background:${sColor}15;color:${sColor}">${ord.status || "—"}</span></td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b">${ord.order_date || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b">${ord.deadline || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center"><div style="background:#e2e8f0;border-radius:4px;height:6px;width:60px;overflow:hidden"><div style="background:${sColor};height:100%;width:${ord.progress || 0}%"></div></div></td></tr>`;
                }).join("");

                const paymentRows = customerDetail.payments.map((pay: any, idx: number) =>
                  `<tr style="background:${idx % 2 === 0 ? "#ffffff" : "#f0fdf4"}"><td style="padding:8px 10px;border-bottom:1px solid #dcfce7">✅</td><td style="padding:8px 10px;border-bottom:1px solid #dcfce7;font-weight:600">${pay.title || pay.doc_number || "Ödeme"}</td><td style="padding:8px 10px;border-bottom:1px solid #dcfce7;color:#64748b">${pay.doc_date || "—"}</td><td style="padding:8px 10px;border-bottom:1px solid #dcfce7;text-align:right;font-family:monospace;font-weight:700;color:#16a34a">₺${(Number(pay.total_amount) || 0).toLocaleString("tr-TR")}</td></tr>`
                ).join("");

                const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${selectedCustomer} — Finansal Rapor</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;color:#1e293b;background:#fff}
  .header{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:white;padding:32px 40px;display:flex;align-items:center;gap:20px}
  .logo-box{width:56px;height:56px;background:#0AA2CD;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:white;letter-spacing:-1px}
  .header h1{font-size:20px;font-weight:800;margin-bottom:2px}
  .header p{font-size:11px;color:#94a3b8}
  .content{padding:32px 40px}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 28px}
  .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px}
  .card .num{font-size:22px;font-weight:800;font-family:'Courier New',monospace}
  .card .lbl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
  .card.green .num{color:#16a34a} .card.red .num{color:#dc2626} .card.blue .num{color:#0688AD}
  h2{font-size:13px;color:#475569;margin:24px 0 10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:800;padding-bottom:6px;border-bottom:2px solid #e2e8f0}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}
  th{text-align:left;padding:10px;background:#f1f5f9;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between}
  @media print{body{padding:0}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="header">
  <div class="logo-box">MT</div>
  <div>
    <h1>${selectedCustomer}</h1>
    <p>MAS Technic Precision — Finansal Rapor • ${new Date().toLocaleDateString("tr-TR")} • Rapor No: FR-${Date.now().toString(36).toUpperCase()}</p>
  </div>
</div>
<div class="content">
  <div class="summary">
    <div class="card"><div class="num">${customerDetail.invoices.length}</div><div class="lbl">Toplam Fatura</div></div>
    <div class="card green"><div class="num">₺${totalPaidAmount.toLocaleString("tr-TR")}</div><div class="lbl">Ödenen Tutar</div></div>
    <div class="card red"><div class="num">₺${totalUnpaidAmount.toLocaleString("tr-TR")}</div><div class="lbl">Bekleyen Tutar</div></div>
    <div class="card blue"><div class="num">${customerDetail.custOrders.length}</div><div class="lbl">Sipariş Adedi</div></div>
  </div>
  ${customerDetail.invoices.length > 0 ? `<h2>📄 Fatura Listesi</h2><table><thead><tr><th>Belge No</th><th>Başlık</th><th>Tarih</th><th>Vade</th><th style="text-align:right">Tutar</th><th>Durum</th></tr></thead><tbody>${invoiceRows}</tbody><tfoot><tr style="background:#f1f5f9"><td colspan="4" style="padding:10px;font-weight:700;font-size:11px">TOPLAM</td><td style="padding:10px;text-align:right;font-family:monospace;font-weight:800;font-size:13px">₺${totalInvoiceAmount.toLocaleString("tr-TR")}</td><td></td></tr></tfoot></table>` : ""}
  ${customerDetail.payments.length > 0 ? `<h2>💰 Ödeme Geçmişi</h2><table><thead><tr><th style="width:30px"></th><th>Açıklama</th><th>Tarih</th><th style="text-align:right">Tutar</th></tr></thead><tbody>${paymentRows}</tbody><tfoot><tr style="background:#f0fdf4"><td></td><td colspan="2" style="padding:10px;font-weight:700;font-size:11px;color:#16a34a">TOPLAM ÖDENEN</td><td style="padding:10px;text-align:right;font-family:monospace;font-weight:800;font-size:13px;color:#16a34a">₺${totalPaidAmount.toLocaleString("tr-TR")}</td></tr></tfoot></table>` : ""}
  ${customerDetail.custOrders.length > 0 ? `<h2>📦 Sipariş Geçmişi</h2><table><thead><tr><th>Sipariş No</th><th>Parça</th><th style="text-align:center">Adet</th><th>Durum</th><th>Sipariş Tarihi</th><th>Termin</th><th style="text-align:center">İlerleme</th></tr></thead><tbody>${orderRows}</tbody></table>` : ""}
  <div class="footer">
    <span>MAS Technic Precision Manufacturing • Bu rapor otomatik olarak oluşturulmuştur.</span>
    <span>${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
  </div>
</div></body></html>`;

                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(html);
                  printWindow.document.close();
                  setTimeout(() => printWindow.print(), 300);
                  toast.success("PDF raporu hazırlanıyor...");
                }
              }}
            >
              <Download className="w-3.5 h-3.5" />
              PDF Export
            </Button>
          </div>
        )}

        {customerDetail && (
          <div className="space-y-5 mt-2">
            {/* Summary mini cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Sipariş", value: customerDetail.custOrders.length, icon: Package, color: C.orange },
                { label: "Fatura", value: customerDetail.invoices.length, icon: FileText, color: C.cyan },
                { label: "Ödenen", value: customerDetail.payments.length, icon: CreditCard, color: C.emerald },
                { label: "Bekleyen", value: customerDetail.unpaid.length, icon: Clock, color: C.red },
              ].map((s) => (
                <div key={s.label} className="dark:bg-[#1E293B] bg-slate-50 rounded-xl p-3 border dark:border-[#334155] border-slate-200">
                  <s.icon className="w-3.5 h-3.5 mb-1" style={{ color: s.color }} />
                  <p className="text-lg font-black dark:text-white text-slate-800 font-mono">{s.value}</p>
                  <p className="text-[9px] dark:text-slate-500 text-slate-400 font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Invoices */}
            <div>
              <h4 className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Fatura Listesi
              </h4>
              {customerDetail.invoices.length === 0 ? (
                <p className="text-[11px] dark:text-slate-500 text-slate-400 italic">Fatura kaydı bulunamadı.</p>
              ) : (
                <div className="space-y-1.5">
                  {customerDetail.invoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between dark:bg-[#1E293B] bg-slate-50 rounded-lg p-2.5 border dark:border-[#334155] border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold dark:text-white text-slate-800 truncate">{inv.title || inv.doc_number || "Fatura"}</p>
                        <p className="text-[9px] dark:text-slate-500 text-slate-400">{inv.doc_date || "—"} • {inv.doc_number || "—"}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-[11px] font-black dark:text-emerald-400 text-emerald-600 font-mono">₺{(Number(inv.total_amount) || 0).toLocaleString("tr-TR")}</p>
                        <Badge variant="outline" className={`text-[8px] px-1.5 py-0 ${inv.payment_status === "ödendi" ? "border-emerald-300 text-emerald-500" : "border-red-300 text-red-500"}`}>
                          {inv.payment_status === "ödendi" ? "Ödendi" : "Bekliyor"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment History */}
            <div>
              <h4 className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" /> Ödeme Geçmişi
              </h4>
              {customerDetail.payments.length === 0 ? (
                <p className="text-[11px] dark:text-slate-500 text-slate-400 italic">Ödeme kaydı bulunamadı.</p>
              ) : (
                <div className="space-y-1.5">
                  {customerDetail.payments.map((pay: any) => (
                    <div key={pay.id} className="flex items-center gap-3 dark:bg-emerald-500/5 bg-emerald-50 rounded-lg p-2.5 border dark:border-emerald-500/20 border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold dark:text-white text-slate-800 truncate">{pay.title || pay.doc_number || "Ödeme"}</p>
                        <p className="text-[9px] dark:text-slate-500 text-slate-400">{pay.doc_date || "—"}</p>
                      </div>
                      <span className="text-[11px] font-black dark:text-emerald-400 text-emerald-600 font-mono">₺{(Number(pay.total_amount) || 0).toLocaleString("tr-TR")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div>
              <h4 className="text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Truck className="w-3 h-3" /> Sipariş Timeline
              </h4>
              {customerDetail.custOrders.length === 0 ? (
                <p className="text-[11px] dark:text-slate-500 text-slate-400 italic">Sipariş bulunamadı.</p>
              ) : (
                <div className="relative pl-4 border-l-2 dark:border-[#334155] border-slate-200 space-y-3">
                  {customerDetail.custOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((ord: any) => {
                    const statusColor = ord.status === "Tamamlandı" || ord.status === "Teslim Edildi" ? C.emerald : ord.status === "Üretimde" ? C.cyan : ord.status === "İptal" ? C.red : C.orange;
                    return (
                      <div key={ord.id} className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 dark:border-[#0F172A] border-white" style={{ backgroundColor: statusColor }} />
                        <div className="dark:bg-[#1E293B] bg-slate-50 rounded-lg p-2.5 border dark:border-[#334155] border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold dark:text-white text-slate-800">{ord.id}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>{ord.status || "—"}</span>
                          </div>
                          <p className="text-[10px] dark:text-slate-400 text-slate-500">{ord.part_name || "—"} • Adet: {ord.quantity || "—"}</p>
                          <div className="flex items-center gap-3 mt-1 text-[9px] dark:text-slate-500 text-slate-400">
                            <span>Sipariş: {ord.order_date || "—"}</span>
                            <span>Termin: {ord.deadline || "—"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
