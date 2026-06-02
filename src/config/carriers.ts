const ADMIN_URL = "https://admin.beautyup-enterprise.com";

export type Carrier = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  logoUrl: string | null;   // null = ใช้ icon แทน
  trackingUrl: string;
};

export const CARRIERS: Carrier[] = [
  {
    id: "THPOST",
    name: "ไปรษณีย์ไทย",
    shortName: "ไปรษณีย์",
    color: "#C8102E",
    textColor: "#FFFFFF",
    logoUrl: null,  // ใช้ MaterialIcons mail แทน
    trackingUrl: "https://track.thailandpost.co.th/?trackNumber=",
  },
  {
    id: "KERRY",
    name: "Kerry Express",
    shortName: "Kerry",
    color: "#FF6B00",
    textColor: "#FFFFFF",
    logoUrl: `${ADMIN_URL}/images/icon/carrier/kerry.png`,
    trackingUrl: "https://th.kerryexpress.com/en/track/?track=",
  },
  {
    id: "FLASH",
    name: "Flash Express",
    shortName: "Flash",
    color: "#E50012",
    textColor: "#FFFFFF",
    logoUrl: `${ADMIN_URL}/images/icon/carrier/Flash_Express_Logo.svg`,
    trackingUrl: "https://www.flashexpress.co.th/en/fle/tracking?se=",
  },
  {
    id: "JNT",
    name: "J&T Express",
    shortName: "J&T",
    color: "#E4231F",
    textColor: "#FFFFFF",
    logoUrl: `${ADMIN_URL}/images/icon/carrier/jandt.png`,
    trackingUrl: "https://www.jtexpress.co.th/trajectoryQuery",
  },
  {
    id: "DHL",
    name: "DHL Express",
    shortName: "DHL",
    color: "#FFCC00",
    textColor: "#CC0000",
    logoUrl: `${ADMIN_URL}/images/icon/carrier/DHL_idxN0olXHn_1.png`,
    trackingUrl: "https://www.dhl.com/th-en/home/tracking.html?tracking-id=",
  },
];

export function getCarrier(id: string): Carrier | undefined {
  return CARRIERS.find((c) => c.id === id);
}
