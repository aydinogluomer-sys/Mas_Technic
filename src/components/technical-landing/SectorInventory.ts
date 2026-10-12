import aerospace from "@/assets/industry-aerospace.webp";
import defense from "@/assets/industry-defense.webp";
import medical from "@/assets/industry-medical.webp";
import hydraulic from "@/assets/industry-hydraulic.webp";
import automotive from "@/assets/industry-automotive.webp";
import robotics from "@/assets/industry-robotics.webp";
import marine from "@/assets/industry-marine.webp";
import piping from "@/assets/industry-piping.webp";
import hvac from "@/assets/industry-hvac.webp";
import renewable from "@/assets/industry-renewable.webp";
import oilgas from "@/assets/industry-oilgas.webp";
import power from "@/assets/industry-power.webp";
import mining from "@/assets/industry-mining.webp";

export type Sector = { title: string; href: string; image?: string; width?: number; height?: number };
export const sectors: Sector[] = [
  { title: "HAVACILIK & UZAY", href: "/endustriyel/havacilik-uzay", image: aerospace, width: 1200, height: 1200 },
  { title: "SAVUNMA SANAYİ", href: "/endustriyel/savunma-sanayi", image: defense, width: 1200, height: 1200 },
  { title: "MEDİKAL", href: "/endustriyel/medikal", image: medical, width: 1200, height: 1200 },
  { title: "HİDROLİK & PNÖMATİK", href: "/endustriyel/hidrolik-pnomatik", image: hydraulic, width: 750, height: 750 },
  { title: "OTOMOTİV", href: "/endustriyel/otomotiv", image: automotive, width: 1200, height: 1200 },
  { title: "ROBOTİK", href: "/endustriyel/robotik", image: robotics, width: 1200, height: 1200 },
  { title: "YELKEN & YAT SİSTEMLERİ", href: "/endustriyel/yelken-yat-sistemleri", image: marine, width: 1200, height: 1200 },
  { title: "BORU & BAĞLANTI PARÇALARI", href: "/endustriyel/boru-baglanti-parcalari", image: piping, width: 1200, height: 1200 },
  { title: "İKLİM TEKNOLOJİLERİ", href: "/endustriyel/iklim-teknolojileri", image: hvac, width: 1200, height: 1200 },
  { title: "YENİLENEBİLİR ENERJİ", href: "/endustriyel/yenilenebilir-enerji", image: renewable, width: 1200, height: 1200 },
  { title: "PETROL & GAZ", href: "/endustriyel/petrol-gaz", image: oilgas, width: 1200, height: 1200 },
  { title: "GÜÇ DAĞITIM SİSTEMLERİ", href: "/endustriyel/guc-dagitim-sistemleri", image: power, width: 1200, height: 1200 },
  { title: "MADENCİLİK EKİPMANLARI", href: "/endustriyel/madencilik-ekipmanlari", image: mining, width: 1200, height: 1200 },
];

