export interface EmergencyContact {
  name: string;
  number: string;
  type: "police" | "fire" | "ambulance" | "hospital" | "helpline";
}

export interface DivisionContacts {
  division: string;
  contacts: EmergencyContact[];
}

export const nationalContacts: EmergencyContact[] = [
  { name: "National Emergency", number: "999", type: "police" },
  { name: "Fire Service", number: "199", type: "fire" },
  { name: "Ambulance (Dhaka)", number: "199", type: "ambulance" },
  { name: "Women & Child Helpline", number: "10921", type: "helpline" },
  { name: "Anti-Corruption Commission", number: "106", type: "helpline" },
  { name: "Cyber Crime", number: "01766678888", type: "helpline" },
  { name: "RAB Headquarters", number: "01779554391", type: "police" },
  { name: "Tourist Police", number: "01769690000", type: "police" },
];

export const divisionContacts: DivisionContacts[] = [
  {
    division: "Dhaka",
    contacts: [
      { name: "Dhaka Metropolitan Police", number: "01713373173", type: "police" },
      { name: "Dhaka Medical College Hospital", number: "02-55165088", type: "hospital" },
      { name: "BIRDEM Hospital", number: "02-8616641", type: "hospital" },
      { name: "Dhaka Fire Station (HQ)", number: "02-9555555", type: "fire" },
      { name: "Ambulance (DMCH)", number: "02-8626812", type: "ambulance" },
    ],
  },
  {
    division: "Chattogram",
    contacts: [
      { name: "Chattogram Metropolitan Police", number: "031-2855998", type: "police" },
      { name: "Chattogram Medical College", number: "031-630335", type: "hospital" },
      { name: "Chattogram Fire Station", number: "031-2850222", type: "fire" },
      { name: "Ambulance (CMC)", number: "031-2854871", type: "ambulance" },
    ],
  },
  {
    division: "Rajshahi",
    contacts: [
      { name: "Rajshahi Metropolitan Police", number: "0721-776301", type: "police" },
      { name: "Rajshahi Medical College", number: "0721-772150", type: "hospital" },
      { name: "Rajshahi Fire Station", number: "0721-774422", type: "fire" },
    ],
  },
  {
    division: "Khulna",
    contacts: [
      { name: "Khulna Metropolitan Police", number: "041-720666", type: "police" },
      { name: "Khulna Medical College", number: "041-761053", type: "hospital" },
      { name: "Khulna Fire Station", number: "041-721555", type: "fire" },
    ],
  },
  {
    division: "Barishal",
    contacts: [
      { name: "Barishal Police", number: "0431-2173375", type: "police" },
      { name: "Sher-e-Bangla Medical College", number: "0431-2173201", type: "hospital" },
      { name: "Barishal Fire Station", number: "0431-2173100", type: "fire" },
    ],
  },
  {
    division: "Sylhet",
    contacts: [
      { name: "Sylhet Metropolitan Police", number: "0821-714243", type: "police" },
      { name: "Sylhet MAG Osmani Medical College", number: "0821-713667", type: "hospital" },
      { name: "Sylhet Fire Station", number: "0821-713070", type: "fire" },
    ],
  },
  {
    division: "Rangpur",
    contacts: [
      { name: "Rangpur Police", number: "0521-63470", type: "police" },
      { name: "Rangpur Medical College", number: "0521-63051", type: "hospital" },
      { name: "Rangpur Fire Station", number: "0521-62222", type: "fire" },
    ],
  },
  {
    division: "Mymensingh",
    contacts: [
      { name: "Mymensingh Police", number: "091-66523", type: "police" },
      { name: "Mymensingh Medical College", number: "091-67392", type: "hospital" },
      { name: "Mymensingh Fire Station", number: "091-65555", type: "fire" },
    ],
  },
];
