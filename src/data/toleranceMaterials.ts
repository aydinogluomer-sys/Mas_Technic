/* Reached only through the dev-only `/legacy-landing` route, but the numbers
   were still in the repository and still fabricated.

   `caption` used to read `Ölçülen: 0.0048 mm · 2026·Q1 · n=312` — a measured
   result, a quarter and a sample size, for a measurement campaign that never
   happened. `USER_INPUTS.md` §G supplies no project evidence at all, so the
   column now states the basis on which a tolerance is agreed rather than
   pretending to report one that was met.

   Two `target` values (±0.005 and ±0.008 mm) were also tighter than §D's
   verified floor of ±0.01 mm and have been brought back to it. */
export const toleranceMaterials = [
  { code: "AL·2024·T3", name: "Alüminyum 2024-T3", subtitle: "Havacılık · yüksek yorulma dayanımı", target: "± 0.010 mm", left: 47, width: 6, caption: "Hedef aralık, ölçü zincirine göre teknik incelemede teyit edilir", specs: [["Yoğunluk", "2.78 g/cm³"], ["Akma", "324 MPa"], ["Ra hedef", "0.8 µm"], ["Sertleşme", "— yok"]] },
  { code: "SS·316L·ANN", name: "Paslanmaz 316L", subtitle: "Medikal · kimyasal dayanım", target: "± 0.010 mm", left: 44, width: 12, caption: "Kritik koteler kontrol planında tanımlanır ve kayıt altına alınır", specs: [["Yoğunluk", "7.99 g/cm³"], ["Akma", "205 MPa"], ["Ra hedef", "0.4 µm"], ["Mn", "< 2.0%"]] },
  { code: "TI·GR5·AMS", name: "Titanyum Grade 5", subtitle: "Havacılık / medikal implant", target: "± 0.015 mm", left: 41, width: 18, caption: "Isıl genleşme ve bağlama etkisi proses planında hesaba katılır", specs: [["Yoğunluk", "4.43 g/cm³"], ["Akma", "828 MPa"], ["Ra hedef", "0.8 µm"], ["Malzeme şartnamesi", "AMS 4928"]] },
  { code: "STL·4140·QT", name: "Çelik 4140 QT", subtitle: "Otomotiv · şanzıman parçaları", target: "± 0.010 mm", left: 45, width: 10, caption: "Isıl işlem sonrası ölçü kayması ara kontrolle izlenir", specs: [["Yoğunluk", "7.85 g/cm³"], ["Akma", "655 MPa"], ["Ra hedef", "1.6 µm"], ["HRC hedef", "28–32"]] },
  { code: "BRS·CW614N", name: "Pirinç CW614N", subtitle: "Hidrolik · elektrik bağlantı", target: "± 0.012 mm", left: 43, width: 14, caption: "Sızdırmazlık yüzeyleri ayrı bir kontrol adımında doğrulanır", specs: [["Yoğunluk", "8.45 g/cm³"], ["Akma", "200 MPa"], ["Ra hedef", "0.8 µm"], ["Pb", "3.0%"]] },
  { code: "PEEK·CF30", name: "PEEK + CF30", subtitle: "Medikal · yüksek sıcaklık", target: "± 0.020 mm", left: 38, width: 24, caption: "Ölçüm, parçanın oda sıcaklığına dengelenmesinden sonra yapılır", specs: [["Yoğunluk", "1.41 g/cm³"], ["Akma", "152 MPa"], ["Ra hedef", "1.6 µm"], ["T cam.", "143 °C"]] },
] as const;
