export type Carrier = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  trackingUrl: string;
};

export const CARRIERS: Carrier[] = [
  {
    id: "THPOST",
    name: "ไปรษณีย์ไทย",
    shortName: "ไปรษณีย์",
    color: "#C8102E",
    textColor: "#FFFFFF",
    trackingUrl: "https://track.thailandpost.co.th/?trackNumber=",
  },
  {
    id: "KERRY",
    name: "Kerry Express",
    shortName: "Kerry",
    color: "#FF6B00",
    textColor: "#FFFFFF",
    trackingUrl: "https://th.kerryexpress.com/en/track/?track=",
  },
  {
    id: "FLASH",
    name: "Flash Express",
    shortName: "Flash",
    color: "#E50012",
    textColor: "#FFFFFF",
    trackingUrl: "https://www.flashexpress.co.th/en/fle/tracking?se=",
  },
  {
    id: "JNT",
    name: "J&T Express",
    shortName: "J&T",
    color: "#E4231F",
    textColor: "#FFFFFF",
    trackingUrl: "https://www.jtexpress.co.th/trajectoryQuery",
  },
  {
    id: "DHL",
    name: "DHL Express",
    shortName: "DHL",
    color: "#FFCC00",
    textColor: "#CC0000",
    trackingUrl: "https://www.dhl.com/th-en/home/tracking.html?tracking-id=",
  },
];

export function getCarrier(id: string): Carrier | undefined {
  return CARRIERS.find((c) => c.id === id);
}
