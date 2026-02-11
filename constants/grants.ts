import { ProfileData } from "@/contexts/ProfileContext";
import { ImageSourcePropType } from "react-native";

export type GrantRequirement = {
  id: string;
  label: string;
  description?: string;
  field?: keyof ProfileData;
  check: (profile: ProfileData) => boolean;
};

export type GrantApplyContent = {
  eligibilityChecks: string[];
  requiredDocuments: string[];
  portal: {
    label: string;
    instructions: string;
    url?: string;
  };
  tips?: string[];
};

export type GrantDetailFact = {
  id: string;
  label: string;
  icon: string;
  bg: string;
  details?: string[];
};

export interface GrantDefinition {
  id: string;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  category: string;
  imageUrl?: ImageSourcePropType;
  description: string;
  fullDescription: string;
  summary: string;
  active: boolean;
  tags: string[];
  detailFacts: GrantDetailFact[];
  notes: string[];
  apply: GrantApplyContent;
  requirements: GrantRequirement[];
}

export type EligibilityResult = {
  eligible: boolean;
  unmetRequirements: GrantRequirement[];
  metRequirements: GrantRequirement[];
};

const levelOrder = [
  "Foundation",
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Red Seal",
] as const;

const textValue = (value?: string) => (value || "").trim().toLowerCase();

const includesAny = (value: string, options: string[]) =>
  !!value &&
  options.some((option) => textValue(value).includes(textValue(option)));

const parseIncome = (value: string) => {
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : NaN;
};

const isIncomeAtMost = (value: string, limit: number) => {
  const numeric = parseIncome(value);
  if (Number.isNaN(numeric)) return false;
  return numeric <= limit;
};

const levelIndex = (value: string) =>
  levelOrder.findIndex((lvl) => textValue(value).includes(textValue(lvl)));

const hasLevelAtLeast = (value: string, required: typeof levelOrder[number]) => {
  const currentIndex = levelIndex(value);
  const requiredIndex = levelOrder.indexOf(required);
  if (currentIndex < 0 || requiredIndex < 0) return false;
  return currentIndex >= requiredIndex;
};

const isBritishColumbia = (province: string) => {
  const normalized = textValue(province);
  return (
    normalized.includes("british columbia") ||
    normalized === "bc" ||
    normalized.endsWith("bc")
  );
};

const defaultFullDescription = (summary: string) =>
  `${summary} This grant supports tradespeople who are investing in their training. Funding can be stacked with other awards unless noted otherwise and is typically paid directly to the training provider or employer once proof of enrollment has been received.`;

const normalizePostalCode = (postal: string) =>
  postal.replace(/\s+/g, "").toUpperCase();

const ruralBCPostalPrefixes = [
  "V0A",
  "V0B",
  "V0C",
  "V0E",
  "V0G",
  "V0H",
  "V0J",
  "V0K",
  "V0L",
  "V0M",
  "V0N",
  "V0P",
  "V0R",
  "V0S",
  "V0T",
  "V0V",
  "V0W",
  "V0X",
  "V0Y",
  "V0Z",
];

const isRuralBCPostalCode = (postal: string) => {
  if (!postal) return false;
  const normalized = normalizePostalCode(postal);
  if (!normalized.startsWith("V0")) return false;
  return ruralBCPostalPrefixes.some((prefix) =>
    normalized.startsWith(prefix)
  );
};

const grantLogos: Record<string, ImageSourcePropType> = {
  workbc: require("../assets/images/workBC.png"),
  lng: require("../assets/images/LNG.png"),
  masonry: require("../assets/images/Masonry.png"),
  soroptimist: require("../assets/images/logo-soroptimist.svg"),
  cfbc: require("../assets/images/cfbc-logo.svg"),
  nwic: require("../assets/images/NWIC-logo.png"),
};

export const grantCatalog: GrantDefinition[] = [
  {
    id: "stronger-bc-future-skills",
    title: "StrongerBC Future Skills Grant",
    organization: "WorkBC",
    amount: "Up to $3,500",
    deadline: "Jul 14 - Aug 20",
    category: "Education",
    summary:
      "Covers tuition and material costs for short-term, high-demand skills training programs offered in BC.",
    description:
      "Funding that helps BC residents cover tuition, books, and materials for approved training that can be completed within 12 months.",
    fullDescription: defaultFullDescription(
      "Funding that helps BC residents cover tuition, books, and materials for approved training that can be completed within 12 months."
    ),
    active: true,
    tags: ["tuition", "short program", "bc resident"],
    imageUrl: grantLogos.workbc,
    detailFacts: [
      {
        id: "funding",
        label: "Tuition + books",
        icon: "cash-outline",
        bg: "#22C55E",
        details: ["Grant pays tuition, books, and materials up to $3,500 per fiscal year."],
      },
      {
        id: "date",
        label: "Apply 6 weeks prior",
        icon: "calendar-outline",
        bg: "#F59E0B",
        details: ["Processing takes 3–6 weeks. Apply before your intake start date."],
      },
      {
        id: "age",
        label: "18+ or grad",
        icon: "person-circle-outline",
        bg: "#FACC15",
        details: ["Applicants must be at least 18 or have completed secondary school."],
      },
      {
        id: "location",
        label: "BC resident",
        icon: "home-outline",
        bg: "#7B6CF6",
        details: ["Proof of BC residency is required at the time of application."],
      },
    ],
    notes: [
      "Grant is paid directly to the eligible training provider.",
      "Students can only receive one Future Skills Grant per fiscal year.",
    ],
    apply: {
      eligibilityChecks: [
        "You are a current BC resident",
        "You have been accepted into an approved program shorter than 12 months",
        "You have not received this grant earlier in the fiscal year",
      ],
      requiredDocuments: [
        "Proof of residency (BC driver’s licence or utility bill)",
        "Letter of acceptance from the approved institution",
        "Itemized tuition and materials estimate",
      ],
      portal: {
        label: "WorkBC portal",
        instructions: "Submit the verified tuition estimate and program acceptance through WorkBC.",
        url: "https://www.workbc.ca/",
      },
      tips: [
        "Ask the school to complete the tuition confirmation form for faster processing.",
        "Save your receipts in case the ministry requests follow-up.",
      ],
    },
    requirements: [
      {
        id: "bc-resident",
        label: "Lives in British Columbia",
        description: "BC residency is required to access provincial funding.",
        field: "province",
        check: (profile) => isBritishColumbia(profile.province),
      },
      {
        id: "program-identified",
        label: "Training program selected",
        description: "Add your trade school and program so we can confirm eligibility.",
        field: "tradeProgramName",
        check: (profile) => !!profile.tradeProgramName.trim(),
      },
      {
        id: "school",
        label: "Trade school on file",
        field: "tradeSchoolName",
        check: (profile) => !!profile.tradeSchoolName.trim(),
      },
      {
        id: "status",
        label: "Canadian citizen or PR",
        field: "citizenshipStatus",
        description: "The province requires proof of citizenship or permanent residence.",
        check: (profile) =>
          includesAny(profile.citizenshipStatus, [
            "citizen",
            "canadian",
            "indigenous citizen",
            "permanent resident",
            "temporary resident",
            "protected person",
          ]),
      },
    ],
  },
  {
    id: "youth-work-in-trades",
    title: "Youth Work in Trades (WRK) Scholarship",
    organization: "ITA BC",
    amount: "Up to $1,000",
    deadline: "Sep 2 - Nov 14",
    category: "Education",
    summary:
      "Recognizes youth who complete 900+ hours of paid work experience while still in secondary school.",
    description:
      "Awards high-performing youth Apprenticeship students who are on track to transition to full-time apprenticeship after graduation.",
    fullDescription: defaultFullDescription(
      "Awards high-performing youth Apprenticeship students who are on track to transition to full-time apprenticeship after graduation."
    ),
    active: true,
    tags: ["youth", "scholarship", "paid hours"],
    imageUrl: grantLogos.workbc,
    detailFacts: [
      {
        id: "funding",
        label: "Cash award",
        icon: "cash-outline",
        bg: "#22C55E",
        details: ["$1,000 award is paid directly to you via cheque."],
      },
      {
        id: "date",
        label: "Apply before Nov 14",
        icon: "calendar-outline",
        bg: "#F59E0B",
        details: ["Submit hours and references before the provincial deadline."],
      },
      {
        id: "age",
        label: "Secondary students",
        icon: "school-outline",
        bg: "#F97316",
        details: ["You must still be enrolled in secondary school while applying."],
      },
      {
        id: "location",
        label: "Work experience verified",
        icon: "briefcase-outline",
        bg: "#A855F7",
        details: ["Employers must sign your Work in Trades log sheets."],
      },
    ],
    notes: [
      "You must have a signed work placement agreement with your district.",
      "Hours can span multiple employers if documented through the WBT reporting tool.",
    ],
    apply: {
      eligibilityChecks: [
        "Logged at least 900 hours of paid work",
        "Still registered as a secondary student",
        "In good standing with your Work in Trades coordinator",
      ],
      requiredDocuments: [
        "WEX time sheets signed by employer",
        "School transcript showing completion of four Youth Work in Trades courses",
        "Short supervisor reference",
      ],
      portal: {
        label: "ITA youth portal",
        instructions: "Upload your package through Youth Work in Trades or share with your school coordinator.",
        url: "https://www2.gov.bc.ca/gov/content/education-training/k-12/support/career-programs/wrk-scholarship",
      },
    },
    requirements: [
      {
        id: "high-school",
        label: "High school entered",
        field: "highSchoolName",
        check: (profile) => !!profile.highSchoolName.trim(),
      },
      {
        id: "grad-date",
        label: "Graduation date added",
        field: "graduationDate",
        check: (profile) => !!profile.graduationDate.trim(),
      },
      {
        id: "hours",
        label: "Documented work experience",
        description: "Add your current employer so we can track hours.",
        field: "guardianName",
        check: (profile) => !!profile.guardianName.trim(),
      },
      {
        id: "apprenticeship",
        label: "Apprenticeship level recorded",
        field: "apprenticeshipLevel",
        check: (profile) =>
          includesAny(profile.apprenticeshipLevel, [
            "youth",
            "level 1",
            "first year apprentice",
            "first year",
            "level 2",
            "second year apprentice",
            "second year",
          ]),
      },
    ],
  },
  {
    id: "lng-canada-training",
    title: "LNG Canada Trades Training Fund",
    organization: "BC Construction Association",
    amount: "Up to $1,300",
    deadline: "Feb 28",
    category: "Training",
    summary:
      "Supports upskilling for Red Seal trades working on LNG Canada-driven projects.",
    description:
      "Provides tuition reimbursement for union and non-union apprentices pursuing specialized LNG-related training in BC.",
    fullDescription: defaultFullDescription(
      "Provides tuition reimbursement for union and non-union apprentices pursuing specialized LNG-related training in BC."
    ),
    active: true,
    tags: ["tuition", "employer match", "lng"],
    imageUrl: grantLogos.lng,
    detailFacts: [
      {
        id: "funding",
        label: "Up to $1,300",
        icon: "cash-outline",
        bg: "#22C55E",
        details: ["Tuition reimbursement is issued after proof of completion."],
      },
      {
        id: "date",
        label: "Apply before Feb 28",
        icon: "calendar-outline",
        bg: "#F59E0B",
        details: ["Funding windows close when yearly allocations are exhausted."],
      },
      {
        id: "location",
        label: "BC employer",
        icon: "business-outline",
        bg: "#0EA5E9",
        details: ["Your employer must operate in British Columbia."],
      },
      {
        id: "notes",
        label: "LNG scope training",
        icon: "construct-outline",
        bg: "#EA580C",
        details: ["Courses must tie directly to LNG Canada project scopes."],
      },
    ],
    notes: [
      "Employers must co-sign the reimbursement request.",
      "Funding can be combined with the Apprenticeship Incentive Grant.",
    ],
    apply: {
      eligibilityChecks: [
        "Working for a BC employer tied to LNG Canada or its contractors",
        "Training improves safety or productivity on LNG-related scopes",
        "You have an apprenticeship level recorded",
      ],
      requiredDocuments: [
        "Employer sponsorship letter",
        "Training schedule or quote",
        "Proof of apprenticeship registration (ITA number)",
      ],
      portal: {
        label: "BCCA training portal",
        instructions: "Employer submits the application on your behalf through the association portal.",
        url: "https://www.bccassn.com/",
      },
    },
    requirements: [
      {
        id: "province-bc",
        label: "BC worksite",
        field: "province",
        check: (profile) => isBritishColumbia(profile.province),
      },
      {
        id: "trade-entered",
        label: "Trade selected",
        field: "trade",
        check: (profile) => !!profile.trade.trim(),
      },
      {
        id: "apprenticeship-level",
        label: "Apprenticeship level on file",
        field: "apprenticeshipLevel",
        check: (profile) => !!profile.apprenticeshipLevel.trim(),
      },
    ],
  },
  {
    id: "masonry-institute-bc",
    title: "Masonry Institute of BC Training Fund",
    organization: "Masonry Institute of BC",
    amount: "Up to $1,950",
    deadline: "3 months before training",
    category: "Training",
    summary:
      "Supports masonry apprentices attending Trowel Trades Training Association programs.",
    description:
      "Provides tuition, books, and small stipend funding for masonry apprentices progressing through level training.",
    fullDescription:
      "The Masonry Institute of BC has promoted the masonry industry for over 50 years. Funding offsets tuition, PPE, and textbook costs for apprentices registered with the Trowel Trades Training Association. Additional top-ups are available for members who participate in industry mentorship events.",
    active: true,
    tags: ["masonry", "tuition", "union"],
    imageUrl: grantLogos.masonry,
    detailFacts: [
      {
        id: "funding",
        label: "Up to $1,950",
        icon: "cash-outline",
        bg: "#22C55E",
        details: ["Includes $155 textbook top-up for first-year apprentices."],
      },
      {
        id: "date",
        label: "Apply 3 months ahead",
        icon: "calendar-outline",
        bg: "#F59E0B",
        details: ["Funds are disbursed roughly 4 weeks before class begins."],
      },
      {
        id: "age",
        label: "Level 1-3",
        icon: "build-outline",
        bg: "#EC4899",
        details: ["Only Level 1-3 apprentices are eligible for this fund."],
      },
      {
        id: "location",
        label: "Trowel Trades campus",
        icon: "home-outline",
        bg: "#7B6CF6",
        details: ["Training must take place at the Trowel Trades Training Association."],
      },
    ],
    notes: [
      "First-year apprentices can request an extra $155 for textbooks.",
      "Priority goes to apprentices employed by Masonry Institute member contractors.",
    ],
    apply: {
      eligibilityChecks: [
        "Enrolled in a Trowel Trades Training Association intake",
        "Apprenticeship level 1-3 confirmed",
        "Employer or union reference attached",
      ],
      requiredDocuments: [
        "Proof of enrollment or seat confirmation",
        "Employer/union recommendation letter",
        "Most recent transcript or progress report",
      ],
      portal: {
        label: "Masonry Institute portal",
        instructions: "Applications are emailed to the institute or uploaded in the member portal.",
        url: "https://www.masonrybc.org/apprenticeships/#:~:text=To%20be%20eligible%20to%20apply,cover%20the%20cost%20of%20textbooks",
      },
      tips: [
        "Book training at least one quarter ahead so funds can be disbursed before class starts.",
      ],
    },
    requirements: [
      {
        id: "trade-masonry",
        label: "Masonry trade selected",
        field: "trade",
        check: (profile) => includesAny(profile.trade, ["Bricklayer", "Masonry", "brick", "mason", "masonry", "Masonry Apprentice", "Carpentry", "Apprentice Mason", "Mason"]),
      },
      {
        id: "trowel-school",
        label: "Trowel Trades school on file",
        field: "tradeSchoolName",
        check: (profile) => includesAny(profile.tradeSchoolName, ["trowel", "masonry", "Trowel Trades Training Association (TTTA)", "TTTA", "Trowel Trades Training Association"]),
      },
      {
        id: "level-1-3",
        label: "Level 1-3 apprentice",
        field: "apprenticeshipLevel",
        check: (profile) =>
          includesAny(profile.apprenticeshipLevel, [
            "level 1",
            "first year apprentice",
            "first year",
            "level 2",
            "second year apprentice",
            "second year",
            "level 3",
            "third year apprentice",
            "third year",
          ]),
      },
    ],
  },
  {
    id: "soroptimist-live-your-dream",
    title: "Soroptimist - Live Your Dream Awards",
    organization: "Soroptimist",
    amount: "Up to $10,000",
    deadline: "Aug 1 - Nov 14",
    category: "Awards",
    summary:
      "Financial support for women who are the primary financial support for their families while pursuing training.",
    description:
      "Awards help women build better lives through education and skills training that lead to sustainable employment.",
    fullDescription: defaultFullDescription(
      "Awards help women build better lives through education and skills training that lead to sustainable employment."
    ),
    active: false,
    tags: ["women", "tuition", "childcare"],
    imageUrl: grantLogos.soroptimist,
    detailFacts: [
      {
        id: "funding",
        label: "Up to $10,000",
        icon: "cash-outline",
        bg: "#22C55E",
        details: ["Local awards range from $1,000-$2,500, federation awards up to $10,000."],
      },
      {
        id: "date",
        label: "Apply by Nov 14",
        icon: "calendar-outline",
        bg: "#F59E0B",
        details: ["Applications close each November with winners notified in January."],
      },
      {
        id: "age",
        label: "Primary caregiver",
        icon: "people-outline",
        bg: "#DB2777",
        details: ["Recipients must be the primary financial support for their dependents."],
      },
      {
        id: "location",
        label: "Any province",
        icon: "home-outline",
        bg: "#0EA5E9",
        details: ["You can apply from anywhere in Canada as long as training is underway."],
      },
    ],
    notes: [
      "Funds can be used for tuition, childcare, or living expenses.",
      "Winners are announced regionally before progressing to federation-level awards.",
    ],
    apply: {
      eligibilityChecks: [
        "Identify as a woman with dependents",
        "Demonstrate financial need",
        "Enrolled or accepted into a training or degree program",
      ],
      requiredDocuments: [
        "Proof of enrollment",
        "Two references (community + employer)",
        "Personal story of goals and challenges",
      ],
      portal: {
        label: "Soroptimist application portal",
        instructions: "Complete the national application and upload references before the deadline.",
        url: "https://www.soroptimist.org/",
      },
    },
    requirements: [
      {
        id: "female",
        label: "Identify as a woman",
        field: "gender",
        check: (profile) => includesAny(profile.gender, ["female", "woman"]),
      },
      {
        id: "dependents",
        label: "Household information entered",
        field: "householdSize",
        check: (profile) => !!profile.householdSize.trim(),
      },
      {
        id: "income",
        label: "Annual family income under $85k",
        field: "annualFamilyNetIncome",
        check: (profile) => isIncomeAtMost(profile.annualFamilyNetIncome, 85000),
      },
    ],
  },
  {
    id: "women-in-skilled-trades",
    title: "Mott Electric GP Women in Electrical Training Fund",
    organization: "Construction Foundation of BC",
    amount: "Up to $1,500",
    deadline: "Spring (May 15) / Fall (Aug 30)",
    category: "Awards",
    summary:
      "Supports women entering or continuing Construction Foundations or electrical apprenticeship training.",
    description:
      "CFBC administers this Mott Electric GP fund to offset tuition and textbook costs for women pursuing electrical foundations or levels 1–4 apprenticeship training.",
    fullDescription: defaultFullDescription(
      "The fund awards two bursaries per year (spring and fall) worth up to $1,500 each. Funds are paid directly to the training institution to cover tuition and textbooks for Construction Foundations or electrical apprenticeship training."
    ),
    active: true,
    tags: ["women", "electrical", "tuition"],
    imageUrl: grantLogos.cfbc,
    detailFacts: [
      {
        id: "funding",
        label: "Up to $1,500",
        icon: "cash-outline",
        bg: "#22C55E",
        details: ["Two bursaries per calendar year, paid to the training institution for tuition and books."],
      },
      {
        id: "timeline",
        label: "Apply 1 month early",
        icon: "calendar-outline",
        bg: "#F59E0B",
        details: [
          "Spring award deadline May 15 (advised May 30).",
          "Fall award deadline Aug 30 (advised Sept 30).",
        ],
      },
      {
        id: "program",
        label: "Foundations or electrical apprenticeship",
        icon: "construct-outline",
        bg: "#F97316",
        details: ["Applicants must be in Construction Foundations or Level 1–4 electrical apprenticeship."],
      },
      {
        id: "payout",
        label: "Institution paid",
        icon: "briefcase-outline",
        bg: "#0EA5E9",
        details: ["Award funds are sent directly to the training institution once recipients are confirmed."],
      },
    ],
    notes: [
      "Applications must arrive at least one month before training begins.",
      "Requires a 100–500 word personal goals statement plus two references.",
      "CFBC may share recipient stories in promotional materials.",
    ],
    apply: {
      eligibilityChecks: [
        "Identify as a woman",
        "Enrolled in Construction Foundations or electrical apprenticeship (Levels 1–4)",
        "Application submitted at least one month prior to start date",
      ],
      requiredDocuments: [
        "CFBC application form",
        "Proof of registration/acceptance and unofficial transcript",
        "Statement of goals (100–500 words)",
        "Budget showing tuition and textbook costs",
        "Two references",
      ],
      portal: {
        label: "CFBC application page",
        instructions: "Download the application and submit to info@cfbc.ca or via the CFBC bursary portal.",
        url: "https://cfbc.ca/mott-electric-gp-women-in-electrical-training-fund/",
      },
      tips: [
        "Have your references ready—applications without two references are ineligible.",
        "Attach your course start dates to confirm deadlines.",
      ],
    },
    requirements: [
      {
        id: "gender",
        label: "Identify as a woman",
        field: "gender",
        check: (profile) => includesAny(profile.gender, ["female", "woman"]),
      },
      {
        id: "program",
        label: "In electrical foundations or apprenticeship",
        field: "trade",
        check: (profile) =>
          includesAny(profile.trade, ["electrical", "electrician", "construction foundations"]),
      },
      {
        id: "apprentice",
        label: "Foundation or Level 1–4 apprentice",
        field: "apprenticeshipLevel",
        check: (profile) =>
          includesAny(profile.apprenticeshipLevel, [
            "construction foundations",
            "level 1",
            "first year",
            "first year apprentice",
            "level 2",
            "second year",
            "second year apprentice",
            "level 3",
            "third year",
            "third year apprentice",
            "level 4",
            "fourth year",
            "fourth year apprentice",
          ]),
      },
      {
        id: "institution",
        label: "Training institution recorded",
        field: "tradeSchoolName",
        check: (profile) => !!profile.tradeSchoolName.trim(),
      },
    ],
  },
  {
    id: "project-iset",
    title: "Project ISET – Indigenous Skills & Employment Training",
    organization: "Northwest Indigenous Council (CAP Affiliate)",
    amount: "Up to $10,000",
    deadline: "Rolling",
    category: "Training",
    summary:
      "Funding for Indigenous individuals who cannot access support from their Band, Métis Nation, or Inuit organizations. Covers tuition, books, equipment, and essential living supports.",
    description:
      "Supports Indigenous learners entering the labour market, especially non-Status, Eastern Métis, and Southern Inuit individuals, by covering training costs and reducing financial barriers.",
    fullDescription: defaultFullDescription(
      "Supports Indigenous learners entering the labour market, especially non-Status, Eastern Métis, and Southern Inuit individuals, by covering training costs and reducing financial barriers."
    ),
    active: true,
    tags: ["indigenous", "training", "tuition", "equipment", "living expenses"],
    imageUrl: grantLogos.nwic,
  
    detailFacts: [
      {
        id: "funding",
        label: "Training & Living Supports",
        icon: "cash-outline",
        bg: "#22C55E",
        details: [
          "Covers tuition, books, fees, equipment/supplies.",
          "May include relocation or essential living supports if tied to training."
        ],
      },
      {
        id: "date",
        label: "Rolling Intake",
        icon: "calendar-outline",
        bg: "#34D399",
        details: ["Applications accepted year-round; funding subject to availability."],
      },
      {
        id: "priority",
        label: "Funding Priority",
        icon: "flag-outline",
        bg: "#F97316",
        details: [
          "High priority: Non-status Indians, Eastern Métis, Southern Inuit, individuals with no other funding sources.",
          "Low priority: People with past training funding, university graduates, or significant work experience."
        ],
      },
      {
        id: "notes",
        label: "Important Notes",
        icon: "alert-circle-outline",
        bg: "#A3E635",
        details: [
          "Ineligible: Status First Nations living on-reserve, individuals recently funded by CAP, Master's/PhD programs, employed upskilling unless job loss risk.",
        ],
      },
    ],
  
    notes: [
      "Applicants **must** apply to their Band/Métis Nation first. If denied, the denial letter must be included.",
      "Funding is only provided if no other Indigenous organization can support you.",
      "Low-priority applicants may be placed on a waitlist."
    ],
  
    apply: {
      eligibilityChecks: [
        "Self-identify as Indigenous (non-status, Eastern Métis, Southern Inuit are priority).",
        "Not eligible for Band/Métis Nation/Inuit training funding.",
        "Training must support entering the labour market.",
        "Provide all required supporting documents."
      ],
      requiredDocuments: [
        "Proof of Indigenous ancestry (or contact CAP if unavailable).",
        "Resume.",
        "Letter of acceptance (training), OR job offer/letter of intent (employment programs).",
        "One-page essay describing career situation and goals.",
        "Cost breakdown from training institution.",
        "Letter from Band/organization showing denial of funding (if applicable)."
      ],
      portal: {
        label: "Project ISET Application",
        instructions:
          "Submit completed forms by email, fax, or mail to the CAP ISET department. Digital uploads accepted.",
        url: "https://www.nwindigenous.org/project-iset/",

      },
    },
  
    requirements: [
      {
        id: "citizenship",
        label: "Indigenous identity confirmed",
        field: "citizenshipStatus",
        check: (profile) =>
          includesAny(profile.citizenshipStatus, [
            "non-status",
            "indigenous",
            "indigenous citizen",
            "Indigenous Citizen",
            "first nations",
            "metis",
            "inuit",
            "eastern metis",
            "southern inuit",
          ]),
      },
      {
        id: "address",
        label: "Address provided",
        field: "address",
        check: (profile) => !!profile.address.trim(),
      },
      {
        id: "program",
        label: "Training program documented",
        field: "tradeProgramName",
        check: (profile) => !!profile.tradeProgramName.trim(),
      },
    ],
  },  
];

export const grantMap = grantCatalog.reduce<Record<string, GrantDefinition>>(
  (acc, grant) => {
    acc[grant.id] = grant;
    return acc;
  },
  {}
);

export const getGrantById = (id?: string) => {
  if (!id) return undefined;
  return grantMap[id];
};

export const evaluateGrantEligibility = (
  grant: GrantDefinition,
  profile: ProfileData
): EligibilityResult => {
  const unmetRequirements = grant.requirements.filter(
    (requirement) => !requirement.check(profile)
  );
  const metRequirements = grant.requirements.filter((requirement) =>
    requirement.check(profile)
  );

  return {
    eligible: unmetRequirements.length === 0,
    unmetRequirements,
    metRequirements,
  };
};
