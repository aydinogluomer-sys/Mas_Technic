import type { ChatText } from "./types";

/* Chatbot entries, keyed by index in `staticEntries` (`src/data/chatFaqData.ts`).
   Keywords are the English matcher input; they are never rendered. */
export const chat: Record<string, ChatText> = {
  "0": {
    question: "How can I get a quote?",
    answer: "To get a quote, visit our [Get a Quote](/teklif-al) page. You can get a quick quote by uploading your CAD file. Alternatively, you can email sales@mastechnic.com.",
    keywords: ["quote", "price", "cost", "fee", "pricing", "how much", "budget", "estimate", "rfq"],
  },
  "1": {
    question: "What are your contact details?",
    answer: "📞 Phone: +90 (536) 564 51 94\n📧 Email: sales@mastechnic.com\n📍 Address: Ataşehir Mah., 8287. Sok. No: 4, 35620 Çiğli/İzmir\n\nFor more information visit our [Contact](/iletisim) page.",
    keywords: ["contact", "phone", "address", "email", "mail", "where", "location", "directions", "number"],
  },
  "2": {
    question: "Which sectors do you serve?",
    answer: "We serve aerospace, defence, automotive, medical, robotics, energy, marine, hydraulics and many other sectors. For details see [High Technology](/endustriyel/kategori/yuksek-teknoloji) and our other sector pages.",
    keywords: ["sector", "industry", "aerospace", "automotive", "medical", "defence", "defense", "which sector"],
  },
  "3": {
    question: "Do you produce prototypes?",
    answer: "Yes! We produce prototypes starting from a single part. Lead time is given with the quote, after material supply, the number of operations and the capacity plan have been reviewed. For details see our [Prototype Production](/endustriyel/prototip-uretim) page.",
    keywords: ["prototype", "sample", "single part", "one-off", "trial", "first article"],
  },
  "4": {
    question: "Which CNC services do you offer?",
    answer: "CNC milling (3-4-5 axis), CNC turning, precision micro machining, deep hole & reaming, laser engraving, surface treatments, assembly and more. See our [Machining](/hizmetler/kategori/talasli-imalat) page for our machining services.",
    keywords: ["cnc", "service", "services", "what do you do", "what do you offer", "milling", "turning", "machining"],
  },
  "5": {
    question: "What is your lead time?",
    answer: "Lead time is given with the quote, after material supply, the number of operations and the capacity plan have been reviewed. A job's lead time is often set not by the machine but by when the material arrives; that is why supply status is assessed at the quote stage, before production is planned.",
    keywords: ["delivery", "lead time", "time", "when", "how many days", "fast", "urgent", "deadline"],
  },
  "6": {
    question: "Which materials do you work with?",
    answer: "We work with engineering materials such as aluminium (6061, 7075), stainless steel (304, 316), carbon steel, titanium, brass, copper, PEEK and POM/Delrin. You can find the details on our [Material Library](/malzemeler) page.",
    keywords: ["material", "metal", "aluminium", "aluminum", "steel", "titanium", "plastic", "brass", "copper", "stainless"],
  },
  "7": {
    question: "Is there a minimum order quantity?",
    answer: "The minimum order quantity is set at 1 (a single part). We plan production flexibly from prototype to series production.",
    keywords: ["minimum", "quantity", "order", "how many", "moq", "at least", "amount"],
  },
  "8": {
    question: "What are your quality certificates?",
    answer: "We hold ISO 9001:2015 and ISO 14001:2015 management system certificates. A control plan is created for every job; the measurement record is added to the delivery file, and accredited third-party CMM measurement is provided on request.",
    keywords: ["quality", "certificate", "certification", "iso", "standard", "document", "report"],
  },
  "9": {
    question: "What are your tolerance values?",
    answer: "Our standard working range is ±0.01mm; the achievable tolerance is set in the technical review according to geometry, material and the dimension chain. For details see our [Tolerance & Precision](/kabiliyetler/tolerans-hassasiyet) page.",
    keywords: ["tolerance", "precision", "accuracy", "tight", "micron"],
  },
  "10": {
    question: "Do you ship by courier?",
    answer: "The shipping method and packaging are set in the quote according to the order's terms; domestic and international shipping options are settled together at the quote stage.",
    keywords: ["courier", "shipping", "shipment", "dispatch", "parcel", "transport", "dhl", "fedex", "ups", "freight"],
  },
  "11": {
    question: "Do you deliver abroad?",
    answer: "International delivery requests are assessed at the quote stage; the delivery term (e.g. DDP / FCA) and the export documents required are set together according to the order's terms.",
    keywords: ["abroad", "export", "international", "overseas", "europe", "usa", "america", "customs"],
  },
  "12": {
    question: "Can items be returned or exchanged?",
    answer: "Conformity is assessed against the characteristics defined in the control plan and the measurement record in the delivery file. If you find a nonconformity, report it to sales@mastechnic.com with the measurement results; how to proceed is agreed together according to the order's terms.",
    keywords: ["return", "exchange", "send back", "nonconforming", "faulty", "defective", "warranty", "guarantee", "liability", "assurance"],
  },
  "13": {
    question: "What are your payment methods?",
    answer: "Payment terms are set in the quote according to the order; we issue corporate invoices and e-invoices. We settle which method we can proceed with at the quote stage.",
    keywords: ["payment", "bank transfer", "wire", "credit card", "invoice", "e-invoice", "terms", "advance", "instalment", "bank"],
  },
  "14": {
    question: "Is payment in advance required?",
    answer: "We have no published fixed payment terms. Terms are set in the quote according to the order and settled together at the quote stage.",
    keywords: ["advance", "prepayment", "deposit", "upfront", "payment terms", "net", "instalment"],
  },
  "15": {
    question: "Which CAD file formats do you accept?",
    answer: "Formats you can upload directly in the quote flow: .step, .stp, .stl, .obj, .iges, .igs, .3mf. For a format not on the list or a dimensioned technical drawing, you can send the file to sales@mastechnic.com.",
    keywords: ["file", "format", "cad", "step", "iges", "stl", "obj", "3mf", "drawing", "3d", "model"],
  },
  "16": {
    question: "What are your working hours?",
    answer: "You can always write to sales@mastechnic.com with quote and technical questions; we reply to quote requests within 1-3 business days. Phone and address details are on our [Contact](/iletisim) page.",
    keywords: ["working", "hours", "office", "open", "closed", "weekend", "saturday", "sunday", "time"],
  },
  "17": {
    question: "Which surface treatments do you carry out?",
    answer: "Anodising, mechanical surface treatments (blasting, vibratory finishing, polishing), chemical processes (passivation, phosphating) and paint and protective coatings. You can find the details on our [Surface Treatments](/hizmetler/kategori/yuzey-islemleri) page.",
    keywords: ["surface", "anodising", "anodizing", "coating", "painting", "chrome", "nickel", "blasting", "passivation", "finishing"],
  },
  "18": {
    question: "Do you do series production?",
    answer: "Yes, we work from a single part to series production. In series production we provide a unit cost advantage and consistent quality. See our [Series Manufacturing](/kabiliyetler/seri-imalat) page.",
    keywords: ["series", "series production", "batch", "quantity", "large order", "volume", "mass production"],
  },
  "19": {
    question: "Do you offer design support?",
    answer: "Yes! With DFM (Design for Manufacturing) analysis we help you make your design fit for production. We offer suggestions for cost and time optimisation.",
    keywords: ["design", "dfm", "support", "engineering", "optimisation", "optimization", "consulting"],
  },
  "20": {
    question: "Do you produce technical drawings?",
    answer: "Yes, we offer 3D modelling and 2D technical drawing services. We can create production-ready CAD files from our customers' sketches.",
    keywords: ["drawing", "technical drawing", "modelling", "modeling", "3d model", "2d", "cad design"],
  },
  "21": {
    question: "What is the customer panel?",
    answer: "From our customer panel you can track your orders, view your quotes, access quality reports and create support requests. Access your account from the [Sign In](/giris) page.",
    keywords: ["customer panel", "panel", "portal", "account", "sign in", "login", "order tracking", "dashboard"],
  },
  "22": {
    question: "What is MAS Technic?",
    answer: "MAS Technic is a precision CNC manufacturing company based in İzmir. From prototype to series production, we serve many sectors, led by aerospace, defence, automotive and medical. You can find the details on our [About](/hakkimizda) page.",
    keywords: ["mas technic", "who are you", "company", "firm", "about", "what is", "introduction"],
  },
  "23": {
    question: "What is your machine park?",
    answer: "We have process families for 3, 4 and 5-axis milling, C/Y-axis and Swiss-type turning, deep-hole machining, and wire and sinker EDM; which one is used is set by the part geometry. Accredited third-party CMM measurement is available on request. See our [Machine Park](/kabiliyetler/makine-parkuru) page.",
    keywords: ["machine", "machine park", "machines", "equipment", "capacity", "axis", "mill", "lathe"],
  },
};
