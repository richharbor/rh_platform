export type Role = "buyer" | "seller" | "referral";

export const ROLE_LABEL: Record<Role, string> = {
  buyer: "Buyer",
  seller: "Seller",
  referral: "Referral Partner",
};

export const user = {
  name: "Aarav Mehta",
  firstName: "Aarav",
  rfinId: "RFIN-88214",
  city: "Mumbai",
  tier: "Gold" as const,
  points: 4820,
  nextTier: "Platinum" as const,
  nextTierAt: 7500,
  kyc: "Verified" as const,
  bank: "HDFC ••• 4471",
  roles: ["buyer", "seller", "referral"] as Role[],
  earnings: { month: 42750, pending: 18200, lifetime: 386400 },
  referralEarnings: { month: 9500, lifetime: 71200 },
  buyerBenefits: { month: 1250, lifetime: 12480 },
};

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  tagline: string;
  from: string;
  buyerBenefit: string;
  sellerCommission: string;
  referralReward: string;
  highlights: string[];
  docs: string[];
};

export type CategorySlug = "insurance" | "loans" | "private-markets";

export const categories: {
  slug: CategorySlug;
  name: string;
  tagline: string;
  tone: "navy" | "earn" | "gold";
}[] = [
  { slug: "insurance", name: "Insurance", tagline: "Protect what matters", tone: "navy" },
  { slug: "loans", name: "Loans", tagline: "Capital when you need it", tone: "earn" },
  { slug: "private-markets", name: "Private Markets", tagline: "Unlisted & Pre-IPO", tone: "gold" },
];

export const products: Product[] = [
  {
    slug: "life-insurance",
    name: "Life Insurance",
    category: "insurance",
    tagline: "Term cover up to ₹2 Cr",
    from: "₹490/mo",
    buyerBenefit: "Up to 300 RFIN Points",
    sellerCommission: "Up to 18% of first-year premium",
    referralReward: "₹750 per issued policy",
    highlights: ["Instant quote", "Paperless issuance", "Claim settlement 98.6%"],
    docs: ["PAN", "Aadhaar", "Income proof"],
  },
  {
    slug: "health-insurance",
    name: "Health Insurance",
    category: "insurance",
    tagline: "Family floater from ₹5L",
    from: "₹720/mo",
    buyerBenefit: "Up to 250 RFIN Points",
    sellerCommission: "Up to 15% of premium",
    referralReward: "₹500 per issued policy",
    highlights: ["Cashless at 12,000+ hospitals", "No room-rent cap", "Day-1 accident cover"],
    docs: ["PAN", "Aadhaar"],
  },
  {
    slug: "motor-insurance",
    name: "Motor Insurance",
    category: "insurance",
    tagline: "Car & bike, renew in 2 min",
    from: "₹2,094/yr",
    buyerBenefit: "Up to 120 RFIN Points",
    sellerCommission: "Up to 12% of premium",
    referralReward: "₹200 per policy",
    highlights: ["Zero-dep add-on", "Instant policy PDF", "Roadside assistance"],
    docs: ["RC", "Previous policy"],
  },
  {
    slug: "personal-loan",
    name: "Personal Loan",
    category: "loans",
    tagline: "Up to ₹25L, disbursal in 24h",
    from: "10.5% p.a.",
    buyerBenefit: "Up to 500 RFIN Points",
    sellerCommission: "1.2% – 2% of disbursed amount",
    referralReward: "0.5% of disbursed amount",
    highlights: ["Minimal documentation", "Flexible tenure 1–5 yrs", "No collateral"],
    docs: ["PAN", "Aadhaar", "3-month bank statement", "Salary slips"],
  },
  {
    slug: "home-loan",
    name: "Home Loan",
    category: "loans",
    tagline: "Own your home from 8.35%",
    from: "8.35% p.a.",
    buyerBenefit: "Up to 2,000 RFIN Points",
    sellerCommission: "0.4% – 0.7% of sanctioned amount",
    referralReward: "0.15% of sanctioned amount",
    highlights: ["Tenure up to 30 yrs", "Balance transfer", "Doorstep documentation"],
    docs: ["PAN", "Aadhaar", "Income proof", "Property papers"],
  },
  {
    slug: "business-loan",
    name: "Business Loan",
    category: "loans",
    tagline: "Grow with up to ₹1 Cr",
    from: "14% p.a.",
    buyerBenefit: "Up to 1,500 RFIN Points",
    sellerCommission: "1.5% – 2.5% of disbursed amount",
    referralReward: "0.6% of disbursed amount",
    highlights: ["Unsecured up to ₹50L", "GST-based eligibility", "Quick sanction"],
    docs: ["GST returns", "ITR (2 yrs)", "Bank statement"],
  },
  {
    slug: "mortgage",
    name: "Mortgage / LAP",
    category: "loans",
    tagline: "Loan against property",
    from: "9.25% p.a.",
    buyerBenefit: "Up to 2,000 RFIN Points",
    sellerCommission: "0.5% – 0.9% of sanctioned amount",
    referralReward: "0.2% of sanctioned amount",
    highlights: ["Up to 70% LTV", "Tenure up to 15 yrs", "Residential & commercial"],
    docs: ["Property papers", "Income proof", "PAN", "Aadhaar"],
  },
  {
    slug: "education-loan",
    name: "Education Loan",
    category: "loans",
    tagline: "India & abroad, up to ₹1.5 Cr",
    from: "9.5% p.a.",
    buyerBenefit: "Up to 1,000 RFIN Points",
    sellerCommission: "0.8% – 1.2% of disbursed amount",
    referralReward: "0.3% of disbursed amount",
    highlights: ["Moratorium during study", "Covers living expenses", "Tax benefit u/s 80E"],
    docs: ["Admission letter", "Co-applicant income proof", "PAN"],
  },
  {
    slug: "vehicle-loan",
    name: "Vehicle Loan",
    category: "loans",
    tagline: "New & used, up to 100% on-road",
    from: "8.9% p.a.",
    buyerBenefit: "Up to 600 RFIN Points",
    sellerCommission: "1% – 1.8% of disbursed amount",
    referralReward: "0.4% of disbursed amount",
    highlights: ["Same-day approval", "Tenure up to 7 yrs", "Dealer tie-ups"],
    docs: ["PAN", "Aadhaar", "Income proof", "Quotation"],
  },
  {
    slug: "working-capital",
    name: "Working Capital",
    category: "loans",
    tagline: "OD / CC limits for MSMEs",
    from: "11.5% p.a.",
    buyerBenefit: "Up to 1,500 RFIN Points",
    sellerCommission: "1% – 2% of limit",
    referralReward: "0.5% of limit",
    highlights: ["Revolving limit", "Interest only on utilised", "Invoice discounting"],
    docs: ["GST returns", "Bank statement", "Audited financials"],
  },
  {
    slug: "unlisted-shares",
    name: "Unlisted Shares",
    category: "private-markets",
    tagline: "Own tomorrow's listings today",
    from: "Min ₹25,000",
    buyerBenefit: "Up to 800 RFIN Points",
    sellerCommission: "1% – 2% of transaction value",
    referralReward: "0.5% of transaction value",
    highlights: ["Curated, verified inventory", "Demat delivery in T+2", "Transparent pricing"],
    docs: ["PAN", "Demat CML", "Cancelled cheque"],
  },
  {
    slug: "pre-ipo",
    name: "Pre-IPO Opportunities",
    category: "private-markets",
    tagline: "Access late-stage private rounds",
    from: "Min ₹1,00,000",
    buyerBenefit: "Up to 1,200 RFIN Points",
    sellerCommission: "1.5% of transaction value",
    referralReward: "0.6% of transaction value",
    highlights: ["Eligibility-based access", "Deal memos & research", "Secure escrow settlement"],
    docs: ["PAN", "Demat CML", "Net-worth declaration"],
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const productsInCategory = (c: CategorySlug) => products.filter((p) => p.category === c);

export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Documents",
  "Processing",
  "Successful",
  "Payout",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export type Lead = {
  id: string;
  name: string;
  product: string;
  stage: LeadStage;
  value: number;
  potential: number;
  updated: string;
};

export const leads: Lead[] = [
  {
    id: "LD-3921",
    name: "Priya Nair",
    product: "home-loan",
    stage: "Processing",
    value: 6500000,
    potential: 32500,
    updated: "Today",
  },
  {
    id: "LD-3918",
    name: "Rohan Shah",
    product: "health-insurance",
    stage: "Documents",
    value: 28800,
    potential: 4320,
    updated: "Today",
  },
  {
    id: "LD-3911",
    name: "Kavya Iyer",
    product: "personal-loan",
    stage: "Contacted",
    value: 800000,
    potential: 12000,
    updated: "Yesterday",
  },
  {
    id: "LD-3904",
    name: "Ananya Rao",
    product: "life-insurance",
    stage: "Successful",
    value: 42000,
    potential: 7560,
    updated: "2 days ago",
  },
  {
    id: "LD-3899",
    name: "Vikram Desai",
    product: "business-loan",
    stage: "New",
    value: 2500000,
    potential: 50000,
    updated: "3 days ago",
  },
  {
    id: "LD-3887",
    name: "Meera Kapoor",
    product: "unlisted-shares",
    stage: "Payout",
    value: 150000,
    potential: 2250,
    updated: "5 days ago",
  },
  {
    id: "LD-3880",
    name: "Sameer Joshi",
    product: "motor-insurance",
    stage: "Payout",
    value: 8400,
    potential: 1008,
    updated: "1 week ago",
  },
];

export type Referral = {
  id: string;
  person: string;
  product: string;
  status: "Shared" | "Enquired" | "In progress" | "Converted" | "Paid";
  amount?: number;
  benefit: number;
  date: string;
  consent: boolean;
};

export const referrals: Referral[] = [
  {
    id: "RF-7712",
    person: "Dev Malhotra",
    product: "personal-loan",
    status: "In progress",
    amount: 500000,
    benefit: 2500,
    date: "18 Sep",
    consent: true,
  },
  {
    id: "RF-7708",
    person: "Sneha Pillai",
    product: "health-insurance",
    status: "Converted",
    amount: 21600,
    benefit: 500,
    date: "16 Sep",
    consent: true,
  },
  {
    id: "RF-7701",
    person: "Arjun Bhat",
    product: "life-insurance",
    status: "Enquired",
    benefit: 750,
    date: "14 Sep",
    consent: true,
  },
  {
    id: "RF-7690",
    person: "Nikhil Verma",
    product: "unlisted-shares",
    status: "Paid",
    amount: 200000,
    benefit: 1000,
    date: "9 Sep",
    consent: true,
  },
  {
    id: "RF-7684",
    person: "Ritu Agarwal",
    product: "motor-insurance",
    status: "Shared",
    benefit: 200,
    date: "6 Sep",
    consent: true,
  },
];

export type LedgerState =
  "Credit" | "Debit" | "Pending" | "Released" | "Reversed" | "Expired" | "Adjustment";

export type LedgerEntry = {
  id: string;
  ledger: "earnings" | "points";
  state: LedgerState;
  amount: number;
  reason: string;
  product: string;
  source: "Seller" | "Referral" | "Buyer" | "Campaign" | "System";
  actor: string;
  ts: string;
  payout: "Paid" | "Pending" | "Scheduled" | "—";
};

export const ledger: LedgerEntry[] = [
  {
    id: "TX-91021",
    ledger: "earnings",
    state: "Released",
    amount: 7560,
    reason: "Commission — policy issued",
    product: "life-insurance",
    source: "Seller",
    actor: "Commission Engine",
    ts: "18 Sep, 14:20",
    payout: "Scheduled",
  },
  {
    id: "TX-91007",
    ledger: "earnings",
    state: "Pending",
    amount: 32500,
    reason: "Commission — pending disbursal",
    product: "home-loan",
    source: "Seller",
    actor: "Commission Engine",
    ts: "17 Sep, 11:02",
    payout: "Pending",
  },
  {
    id: "TX-90988",
    ledger: "earnings",
    state: "Credit",
    amount: 500,
    reason: "Referral converted",
    product: "health-insurance",
    source: "Referral",
    actor: "Referral Engine",
    ts: "16 Sep, 19:45",
    payout: "Scheduled",
  },
  {
    id: "TX-90940",
    ledger: "earnings",
    state: "Credit",
    amount: 1000,
    reason: "Referral payout",
    product: "unlisted-shares",
    source: "Referral",
    actor: "Referral Engine",
    ts: "12 Sep, 10:10",
    payout: "Paid",
  },
  {
    id: "TX-90911",
    ledger: "earnings",
    state: "Debit",
    amount: 21450,
    reason: "Payout to HDFC ••• 4471",
    product: "—",
    source: "System",
    actor: "Payout Ops",
    ts: "10 Sep, 09:00",
    payout: "Paid",
  },
  {
    id: "TX-90872",
    ledger: "earnings",
    state: "Reversed",
    amount: 1008,
    reason: "Policy cancelled in free-look",
    product: "motor-insurance",
    source: "Seller",
    actor: "Risk Ops",
    ts: "6 Sep, 16:30",
    payout: "—",
  },
  {
    id: "TX-90850",
    ledger: "earnings",
    state: "Adjustment",
    amount: 250,
    reason: "TDS correction",
    product: "—",
    source: "System",
    actor: "Finance",
    ts: "4 Sep, 12:00",
    payout: "—",
  },
  {
    id: "PT-5521",
    ledger: "points",
    state: "Credit",
    amount: 300,
    reason: "Points — Life Insurance purchase",
    product: "life-insurance",
    source: "Buyer",
    actor: "Reward Engine",
    ts: "17 Sep, 09:12",
    payout: "—",
  },
  {
    id: "PT-5518",
    ledger: "points",
    state: "Credit",
    amount: 150,
    reason: "Festive campaign bonus",
    product: "—",
    source: "Campaign",
    actor: "Reward Engine",
    ts: "15 Sep, 00:00",
    payout: "—",
  },
  {
    id: "PT-5502",
    ledger: "points",
    state: "Debit",
    amount: 1000,
    reason: "Redeemed — Amazon voucher",
    product: "—",
    source: "Buyer",
    actor: "Reward Engine",
    ts: "8 Sep, 18:40",
    payout: "—",
  },
  {
    id: "PT-5490",
    ledger: "points",
    state: "Expired",
    amount: 120,
    reason: "Points expired (12 months)",
    product: "—",
    source: "System",
    actor: "Reward Engine",
    ts: "1 Sep, 00:00",
    payout: "—",
  },
];

export const tiers = [
  { name: "Bronze", at: 0 },
  { name: "Silver", at: 1500 },
  { name: "Gold", at: 4000 },
  { name: "Platinum", at: 7500 },
  { name: "Elite", at: 15000 },
] as const;

/**
 * Indian digit grouping (2,2,3) without relying on Intl — Hermes builds can ship
 * without full ICU, so the web app's `Intl.NumberFormat("en-IN")` and
 * `toLocaleString("en-IN")` are replaced by this everywhere.
 */
export const formatIN = (n: number) => {
  const neg = n < 0;
  const [whole] = Math.abs(Math.round(n)).toString().split(".");
  let out: string;
  if (whole.length <= 3) {
    out = whole;
  } else {
    const last3 = whole.slice(-3);
    const rest = whole.slice(0, -3);
    out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  return (neg ? "-" : "") + out;
};

export const formatINR = (n: number) => "₹" + formatIN(n);

export const formatCompact = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return formatINR(n);
};

/* ------------------------------------------------------------------ KYC */

export type VerificationState = "Verified" | "Pending" | "Action needed" | "Not started";

export type KycStep = {
  id: string;
  label: string;
  detail: string;
  state: VerificationState;
  updated?: string;
};

export const kycSteps: KycStep[] = [
  { id: "pan", label: "PAN", detail: "ABCDE1234F", state: "Verified", updated: "12 Mar 2026" },
  {
    id: "aadhaar",
    label: "Aadhaar",
    detail: "XXXX XXXX 8821",
    state: "Verified",
    updated: "12 Mar 2026",
  },
  {
    id: "selfie",
    label: "Liveness check",
    detail: "Selfie match",
    state: "Verified",
    updated: "12 Mar 2026",
  },
  {
    id: "address",
    label: "Address proof",
    detail: "Utility bill · Mumbai",
    state: "Pending",
    updated: "17 Sep 2026",
  },
  {
    id: "signature",
    label: "Signature",
    detail: "Required for private-market deals",
    state: "Not started",
  },
];

/* ---------------------------------------------------------------- Banking */

export type BankAccount = {
  id: string;
  bank: string;
  masked: string;
  ifsc: string;
  type: "Savings" | "Current";
  primary: boolean;
  state: VerificationState;
};

export const bankAccounts: BankAccount[] = [
  {
    id: "BA-01",
    bank: "HDFC Bank",
    masked: "•••• 4471",
    ifsc: "HDFC0000123",
    type: "Savings",
    primary: true,
    state: "Verified",
  },
  {
    id: "BA-02",
    bank: "ICICI Bank",
    masked: "•••• 9032",
    ifsc: "ICIC0004410",
    type: "Current",
    primary: false,
    state: "Pending",
  },
];

/* -------------------------------------------------------------- Documents */

export type DocState = "Uploaded" | "Requested" | "Expired" | "In review";

export type DocItem = {
  id: string;
  name: string;
  category: "Identity" | "Income" | "Property" | "Business";
  state: DocState;
  meta: string;
  forProduct?: string;
};

export const documents: DocItem[] = [
  {
    id: "DOC-1",
    name: "PAN card",
    category: "Identity",
    state: "Uploaded",
    meta: "PDF · 240 KB · 12 Mar 2026",
  },
  {
    id: "DOC-2",
    name: "Aadhaar",
    category: "Identity",
    state: "Uploaded",
    meta: "PDF · 512 KB · 12 Mar 2026",
  },
  {
    id: "DOC-3",
    name: "Salary slips (3 months)",
    category: "Income",
    state: "In review",
    meta: "PDF · 1.2 MB · 17 Sep 2026",
    forProduct: "personal-loan",
  },
  {
    id: "DOC-4",
    name: "Bank statement (6 months)",
    category: "Income",
    state: "Requested",
    meta: "Needed to progress your application",
    forProduct: "home-loan",
  },
  {
    id: "DOC-5",
    name: "Property papers",
    category: "Property",
    state: "Requested",
    meta: "Sale deed & encumbrance certificate",
    forProduct: "home-loan",
  },
  {
    id: "DOC-6",
    name: "GST returns FY24",
    category: "Business",
    state: "Expired",
    meta: "Expired 31 Aug 2026 · re-upload needed",
    forProduct: "business-loan",
  },
  {
    id: "DOC-7",
    name: "Demat CML",
    category: "Identity",
    state: "Uploaded",
    meta: "PDF · 180 KB · 2 Sep 2026",
    forProduct: "unlisted-shares",
  },
];

/* ---------------------------------------------------------- Notifications */

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  ts: string;
  unread: boolean;
  kind: "earning" | "lead" | "referral" | "reward" | "system";
};

export const notifications: NotificationItem[] = [
  {
    id: "N-1",
    title: "Commission released",
    body: "₹7,560 for Ananya Rao's life policy is scheduled for payout.",
    ts: "18 Sep, 14:20",
    unread: true,
    kind: "earning",
  },
  {
    id: "N-2",
    title: "Document requested",
    body: "Priya Nair's home loan needs a 6-month bank statement.",
    ts: "18 Sep, 09:05",
    unread: true,
    kind: "lead",
  },
  {
    id: "N-3",
    title: "Referral converted",
    body: "Sneha Pillai bought health insurance — ₹500 credited.",
    ts: "16 Sep, 19:45",
    unread: true,
    kind: "referral",
  },
  {
    id: "N-4",
    title: "2× points this month",
    body: "Festive Protect is live until 31 Oct on all insurance.",
    ts: "15 Sep, 08:00",
    unread: false,
    kind: "reward",
  },
  {
    id: "N-5",
    title: "Address proof under review",
    body: "We'll confirm within 24 hours.",
    ts: "17 Sep, 11:30",
    unread: false,
    kind: "system",
  },
  {
    id: "N-6",
    title: "Payout completed",
    body: "₹21,450 credited to HDFC •••• 4471.",
    ts: "10 Sep, 09:00",
    unread: false,
    kind: "earning",
  },
];

export type NotificationChannel = {
  id: string;
  label: string;
  detail: string;
  enabled: boolean;
};

export const notificationChannels: NotificationChannel[] = [
  {
    id: "push",
    label: "Push notifications",
    detail: "Lead updates, payouts and campaigns",
    enabled: true,
  },
  { id: "email", label: "Email", detail: "Statements and monthly summaries", enabled: true },
  { id: "sms", label: "SMS", detail: "OTPs and critical payout alerts", enabled: true },
  { id: "whatsapp", label: "WhatsApp", detail: "Referral and lead nudges", enabled: false },
];

/* ----------------------------------------------------------------- Support */

export const faqs = [
  {
    q: "When do commissions get paid out?",
    a: "Released earnings are batched and paid every Tuesday, T+2 for Platinum and above. You can track each entry's payout status in Transactions.",
  },
  {
    q: "Why was an earning reversed?",
    a: "A policy cancelled inside its free-look window, or a loan that did not disburse, reverses the matching commission. The ledger keeps the original entry plus the reversal so the trail stays auditable.",
  },
  {
    q: "How are RFIN Points different from earnings?",
    a: "Points are a loyalty balance you redeem for vouchers and tier benefits. Earnings are real commission and referral income paid to your bank account. They sit in two separate ledgers.",
  },
  {
    q: "Do referrals need consent?",
    a: "Yes. Every referral records the referred person's consent, a timestamp and the product before we contact them.",
  },
  {
    q: "How long does KYC take?",
    a: "PAN and Aadhaar verify instantly. Address proof is reviewed manually and usually clears within 24 hours.",
  },
];

export type Ticket = {
  id: string;
  subject: string;
  state: "Open" | "In progress" | "Resolved";
  updated: string;
};

export const tickets: Ticket[] = [
  {
    id: "TK-4412",
    subject: "Commission for LD-3911 not showing",
    state: "In progress",
    updated: "Today",
  },
  {
    id: "TK-4390",
    subject: "Update bank account for payouts",
    state: "Resolved",
    updated: "8 Sep",
  },
];

/* ---------------------------------------------------------------- Security */

export type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export const sessions: Session[] = [
  {
    id: "S-1",
    device: "iPhone 16 Pro · RFIN app",
    location: "Mumbai, IN",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "S-2",
    device: "Chrome · MacBook Pro",
    location: "Mumbai, IN",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "S-3",
    device: "RFIN app · Android",
    location: "Pune, IN",
    lastActive: "5 days ago",
    current: false,
  },
];
