/**
 * Standard Nigerian Curriculum Academic Standards (NERDC / WAEC / NECO / JAMB-aligned)
 * Comprehensive Nigerian subjects, departments, and Term 1 scheme of work topics.
 */

export interface NigerianSchemeEntry {
  week: number;
  topic: string;
  objectives: string;
}

export interface NigerianStandardSubject {
  name: string;
  code: string;
  category: "General" | "Science" | "Arts/Humanities" | "Commercial/Business" | "Vocational/Technology";
  description: string;
  schemesOfWork?: NigerianSchemeEntry[];
}

export interface NigerianStandardDepartment {
  name: string;
  code: string;
  description: string;
  recommendedSubjectCodes: string[];
}

/**
 * Standard Nigerian Departments for Primary, Junior, and Senior Secondary Institutions
 */
export const SUGGESTED_NIGERIAN_DEPARTMENTS: NigerianStandardDepartment[] = [
  {
    name: "Sciences & Mathematics",
    code: "SCI-MATH",
    description: "Natural sciences, applied mathematics, technology, and computing disciplines.",
    recommendedSubjectCodes: ["MTH", "ENG", "CVE", "PHY", "CHM", "BIO", "AGR", "CSC"],
  },
  {
    name: "Arts & Humanities",
    code: "ARTS-HUM",
    description: "Languages, literature, civic, historical, and religious studies.",
    recommendedSubjectCodes: ["ENG", "MTH", "CVE", "LIT", "GOV"],
  },
  {
    name: "Commercial & Business Studies",
    code: "COMM-BUS",
    description: "Financial accounting, commerce, economics, marketing, and business fundamentals.",
    recommendedSubjectCodes: ["ENG", "MTH", "CVE", "ECO", "ACC"],
  },
  {
    name: "Vocational & Technical Education",
    code: "VOC-TECH",
    description: "Applied technical drawing, food & nutrition, data processing, and trade crafts.",
    recommendedSubjectCodes: ["ENG", "MTH", "CVE", "CSC", "AGR"],
  },
  {
    name: "Basic Education (Junior Secondary)",
    code: "BASIC-EDU",
    description: "Foundational 9-year universal basic education subjects and core literacy.",
    recommendedSubjectCodes: ["ENG", "MTH", "CVE", "AGR", "CSC"],
  },
];

/**
 * Core Nigerian Curriculum Subjects with standard Term 1 NERDC scheme of work outlines
 */
export const SUGGESTED_NIGERIAN_SUBJECTS: NigerianStandardSubject[] = [
  {
    name: "Mathematics",
    code: "MTH",
    category: "General",
    description: "Core compulsory general mathematics across primary, junior, and senior secondary.",
    schemesOfWork: [
      { week: 1, topic: "Number Bases & Conversions", objectives: "Convert numbers between base 10 and other number bases (base 2, 8, 16)." },
      { week: 2, topic: "Modular Arithmetic", objectives: "Perform addition, subtraction, and multiplication in modular systems." },
      { week: 3, topic: "Indices & Logarithms", objectives: "Apply laws of indices and simplify logarithmic expressions." },
      { week: 4, topic: "Surds & Conjugates", objectives: "Rationalize surds and solve arithmetic problems involving square roots." },
      { week: 5, topic: "Simultaneous & Linear Equations", objectives: "Solve linear equations using substitution and elimination methods." },
      { week: 6, topic: "Mid-Term Review & Assessment", objectives: "Evaluate understanding of algebraic operations and number bases." },
      { week: 7, topic: "Quadratic Equations (Factorization & Formula)", objectives: "Solve quadratic equations using factorization and general formula." },
      { week: 8, topic: "Set Theory & Venn Diagrams", objectives: "Represent sets and solve 2-set and 3-set problems using Venn diagrams." },
      { week: 9, topic: "Trigonometry (Sine, Cosine, Tangent)", objectives: "Calculate angles of elevation, depression, and basic trigonometric ratios." },
      { week: 10, topic: "Statistics (Mean, Median, Mode)", objectives: "Compute measures of central tendency for ungrouped and grouped frequency data." },
    ],
  },
  {
    name: "English Language",
    code: "ENG",
    category: "General",
    description: "Core compulsory language instruction covering grammar, lexis, comprehension, and orals.",
    schemesOfWork: [
      { week: 1, topic: "Nouns & Nominal Group Functions", objectives: "Identify noun clauses, grammatical functions, and nominal phrases in sentences." },
      { week: 2, topic: "Reading Comprehension: Identifying Topic Sentences", objectives: "Analyze unseen prose passages and pinpoint main thematic arguments." },
      { week: 3, topic: "Vocabulary Development: Synonyms & Antonyms", objectives: "Differentiate word nuances and context-dependent antonyms." },
      { week: 4, topic: "Oral English: Vowel Sounds (Monophthongs & Diphthongs)", objectives: "Distinguish pure vowels and diphthongs with accurate pronunciation." },
      { week: 5, topic: "Continuous Writing: Formal & Informal Letter Writing", objectives: "Draft formal business letters and informal letters using correct register." },
      { week: 6, topic: "Mid-Term Review & Grammar Diagnostic", objectives: "Assess grammatical accuracy, concord, and tense agreements." },
      { week: 7, topic: "Verbs, Tenses & Concord", objectives: "Master subject-verb agreement and conditional clauses." },
      { week: 8, topic: "Summary Writing: Eliminating Redundancy", objectives: "Extract key salient points from factual passages into concise summaries." },
      { week: 9, topic: "Oral English: Consonant Clusters & Stress Patterns", objectives: "Identify primary and secondary syllable stress in polysyllabic words." },
      { week: 10, topic: "Essay Writing: Expository & Narrative Essays", objectives: "Compose well-structured expository essays with coherent paragraphing." },
    ],
  },
  {
    name: "Biology",
    code: "BIO",
    category: "Science",
    description: "Study of living organisms, ecological systems, cell biology, and genetics.",
    schemesOfWork: [
      { week: 1, topic: "Classification of Living Things (Kingdoms)", objectives: "Group living organisms into the 5 biological kingdoms based on cell structure." },
      { week: 2, topic: "Cell Structure & Organization", objectives: "Compare plant and animal cells under compound microscope." },
      { week: 3, topic: "Diffusion, Osmosis & Active Transport", objectives: "Demonstrate osmosis using living tissue and define selective permeability." },
      { week: 4, topic: "Nutrition in Animals & Enzymes", objectives: "Classify nutrients, enzyme properties, and biochemical test reagents." },
      { week: 5, topic: "Digestive Systems in Vertebrates", objectives: "Trace the alimentary canal and chemical digestion across vertebrates." },
      { week: 6, topic: "Mid-Term Evaluation & Laboratory Practical", objectives: "Conduct food tests for starch, proteins, and reducing sugars." },
      { week: 7, topic: "Excretory Systems & Osmoregulation", objectives: "Describe human nephron function and kidney dialysis mechanics." },
      { week: 8, topic: "Ecology: Biomes & Ecosystem Dynamics", objectives: "Analyze food chains, energy flow, and ecological pyramids in tropical biomes." },
      { week: 9, topic: "Photosynthesis & Respiration", objectives: "Distinguish light and dark reaction stages in C3 plants and aerobic respiration." },
      { week: 10, topic: "Genetics: Mendelian Monohybrid Crosses", objectives: "Calculate phenotypic and genotypic ratios using Punnett squares." },
    ],
  },
  {
    name: "Chemistry",
    code: "CHM",
    category: "Science",
    description: "Atomic structures, chemical bonding, periodicity, reactions, and stoichiometry.",
    schemesOfWork: [
      { week: 1, topic: "Introduction to Chemistry & Scientific Method", objectives: "Define standard lab apparatus, safety rules, and physical vs chemical change." },
      { week: 2, topic: "Atomic Structure & Electronic Configuration", objectives: "Write spdf configurations and identify subatomic particles." },
      { week: 3, topic: "Periodic Table & Periodicity Trends", objectives: "Analyze trends in electronegativity, ionization energy, and atomic radius." },
      { week: 4, topic: "Chemical Bonding (Ionic, Covalent, Metallic)", objectives: "Differentiate bonding forces and draw Lewis dot structures." },
      { week: 5, topic: "Stoichiometry & Mole Concept", objectives: "Calculate empirical formulas, percentage yield, and molar volumes of gases." },
      { week: 6, topic: "Mid-Term Assessment & Volumetric Analysis Prep", objectives: "Prepare standard acid/base solutions and calculate molarity." },
      { week: 7, topic: "Acids, Bases & Salts (pH & Titration)", objectives: "Conduct acid-base titration using methyl orange and phenolphthalein." },
      { week: 8, topic: "Gas Laws (Boyle's, Charles's, Ideal Gas Law)", objectives: "Solve PV = nRT problems and calculate molar volume at STP." },
      { week: 9, topic: "Redox Reactions & Oxidation Numbers", objectives: "Assign oxidation states and balance half-reactions in acidic media." },
      { week: 10, topic: "Rates of Chemical Reactions & Catalysis", objectives: "Investigate temperature, surface area, and catalyst impact on reaction speed." },
    ],
  },
  {
    name: "Physics",
    code: "PHY",
    category: "Science",
    description: "Mechanics, heat, light, electricity, magnetism, and modern physics.",
    schemesOfWork: [
      { week: 1, topic: "Units, Dimensions & Measurement", objectives: "Derive fundamental/derived units and use vernier calipers/micrometer screw gauges." },
      { week: 2, topic: "Scalar & Vector Quantities", objectives: "Resolve coplanar vectors using parallelogram and polygon laws." },
      { week: 3, topic: "Linear Motion & Kinematics Equations", objectives: "Solve v = u + at, s = ut + 0.5at², v² = u² + 2as under gravity." },
      { week: 4, topic: "Projectiles & Trajectory Equations", objectives: "Calculate time of flight, maximum height, and horizontal range." },
      { week: 5, topic: "Newton's Laws of Motion & Momentum", objectives: "Apply conservation of linear momentum in elastic and inelastic collisions." },
      { week: 6, topic: "Mid-Term Review & Mechanics Lab Practical", objectives: "Determine acceleration due to gravity using simple pendulum apparatus." },
      { week: 7, topic: "Work, Energy & Power", objectives: "Calculate mechanical work, kinetic/potential energy transformations, and efficiency." },
      { week: 8, topic: "Circular Motion & Gravitational Fields", objectives: "Derive centripetal force formula and state Kepler's and Newton's gravitational laws." },
      { week: 9, topic: "Heat Energy & Thermal Expansion", objectives: "Calculate linear, superficial, and cubical expansivity of solids." },
      { week: 10, topic: "Optics: Reflection & Refraction at Curved Surfaces", objectives: "Use mirror and lens formulas to locate real and virtual images." },
    ],
  },
  {
    name: "Economics",
    code: "ECO",
    category: "Commercial/Business",
    description: "Microeconomics, macroeconomics, fiscal policy, markets, and monetary systems.",
    schemesOfWork: [
      { week: 1, topic: "Introduction to Economics: Scarcity, Choice & Opportunity Cost", objectives: "Define fundamental economic problems and illustrate with Production Possibility Curves." },
      { week: 2, topic: "Theory of Consumer Demand & Demand Schedules", objectives: "Distinguish between shifts in demand curves vs movements along demand curves." },
      { week: 3, topic: "Theory of Supply & Market Equilibrium", objectives: "Calculate equilibrium price and quantity algebraically and graphically." },
      { week: 4, topic: "Elasticity of Demand & Supply", objectives: "Compute price, income, and cross elasticity of demand coefficients." },
      { week: 5, topic: "Production Theory & Diminishing Returns", objectives: "Analyze total, average, and marginal product curves." },
      { week: 6, topic: "Mid-Term Assessment & Economic Graphs Drill", objectives: "Examine market pricing mechanisms and elasticity calculations." },
      { week: 7, topic: "Market Structures (Perfect Competition vs Monopoly)", objectives: "Compare price determination and profit maximization under competition and monopoly." },
      { week: 8, topic: "Money, Commercial Banks & Central Bank Operations", objectives: "Explain monetary policy instruments (cash reserve ratio, open market operations)." },
      { week: 9, topic: "Inflation & Unemployment in Developing Economies", objectives: "Identify causes of demand-pull and cost-push inflation in Nigeria." },
      { week: 10, topic: "National Income Accounting (GDP, GNP, NNP)", objectives: "Calculate national income using output, income, and expenditure approaches." },
    ],
  },
  {
    name: "Financial Accounting",
    code: "ACC",
    category: "Commercial/Business",
    description: "Bookkeeping, ledger accounts, trial balances, final accounts, and balance sheets.",
    schemesOfWork: [
      { week: 1, topic: "Accounting Principles & Double-Entry Bookkeeping", objectives: "Explain dual aspect concept and debit/credit rules for asset, liability, and equity accounts." },
      { week: 2, topic: "Books of Original Entry & Prime Journals", objectives: "Record transactions in sales, purchases, returns journals, and general journal." },
      { week: 3, topic: "The Cash Book (Two-Column & Three-Column)", objectives: "Prepare three-column cash books with discounts allowed and received." },
      { week: 4, topic: "The General Ledger & Trial Balance", objectives: "Post journal entries to ledger T-accounts and extract a balanced trial balance." },
      { week: 5, topic: "Bank Reconciliation Statements", objectives: "Reconcile cash book balance with bank statement balance adjusting for unpresented cheques." },
      { week: 6, topic: "Mid-Term Practical Ledger Examination", objectives: "Assess trial balance accuracy and reconciliation exercises." },
      { week: 7, topic: "Correction of Errors & Suspense Accounts", objectives: "Identify errors that affect and do not affect trial balance agreement." },
      { week: 8, topic: "Trading, Profit & Loss Accounts", objectives: "Calculate cost of goods sold, gross profit, and net profit." },
      { week: 9, topic: "Balance Sheet & Balance Sheet Classification", objectives: "Classify current assets, non-current assets, current and long-term liabilities." },
      { week: 10, topic: "Adjustments in Final Accounts (Accruals & Prepayments)", objectives: "Treat bad debts, depreciation provisions, accruals, and prepayments in ledger." },
    ],
  },
  {
    name: "Government",
    code: "GOV",
    category: "Arts/Humanities",
    description: "Political systems, constitutional development, civil service, and Nigerian governance history.",
    schemesOfWork: [
      { week: 1, topic: "Basic Concepts: State, Sovereignty & Power", objectives: "Define sovereignty, legitimacy, authority, and power attributes." },
      { week: 2, topic: "Forms of Government: Democracy, Autocracy & Federalism", objectives: "Compare presidential and parliamentary systems of governance." },
      { week: 3, topic: "Rule of Law & Separation of Powers", objectives: "Examine checks and balances among executive, legislature, and judiciary arms." },
      { week: 4, topic: "Political Parties & Electoral Systems", objectives: "Analyze first-past-the-post vs proportional representation systems." },
      { week: 5, topic: "Public Administration & The Civil Service", objectives: "Explain civil service neutrality, anonymity, and bureaucratic recruitment." },
      { week: 6, topic: "Mid-Term Review & Political Theory Assessment", objectives: "Evaluate constitutional development and civil liberties understanding." },
      { week: 7, topic: "Pre-Colonial Administration in Nigeria (Hausa, Yoruba, Igbo)", objectives: "Contrast centralized Hausa-Fulani emirate system with decentralized Igbo republicanism." },
      { week: 8, topic: "Colonial Rule & Indirect Rule Policy", objectives: "Critique Lugard's indirect rule system in Northern, Western, and Eastern Nigeria." },
      { week: 9, topic: "Constitutional Conferences & Evolution (1922-1960)", objectives: "Track Clifford, Richards, Macpherson, and Lyttelton constitutions to independence." },
      { week: 10, topic: "Nigerian Federalism: Origin, Structure & Challenges", objectives: "Discuss revenue allocation, state creation, and federal character principle in Nigeria." },
    ],
  },
  {
    name: "Literature in English",
    code: "LIT",
    category: "Arts/Humanities",
    description: "Analysis of African and non-African drama, poetry, and prose texts.",
    schemesOfWork: [
      { week: 1, topic: "Literary Appreciation & Devices (Imagery, Metaphor, Irony)", objectives: "Identify literary techniques in unseen poems." },
      { week: 2, topic: "African Drama: Plot Overview & Character Analysis", objectives: "Analyze protagonist conflicts, stagecraft, and dramatic irony in prescribed African text." },
      { week: 3, topic: "Non-African Drama: Thematic Exposition", objectives: "Explore major themes, tragic flaws, and character foil in Shakespearean or modern play." },
      { week: 4, topic: "African Poetry: Themes & Tone Analysis", objectives: "Deconstruct colonial legacy, cultural identity, and poetic voice in selected African poems." },
      { week: 5, topic: "Non-African Poetry: Structure & Rhyme Scheme", objectives: "Scan metrical feet, sonnet conventions, and stanzaic forms." },
      { week: 6, topic: "Mid-Term Essay & Textual Analysis Assessment", objectives: "Write analytical essays on thematic conflicts in studied dramatic texts." },
      { week: 7, topic: "African Prose: Narrative Point of View & Setting", objectives: "Examine socio-political context, folklore, and authorial voice in prescribed African novel." },
      { week: 8, topic: "Non-African Prose: Character Arcs & Symbolism", objectives: "Track protagonist evolution and symbolic motifs in prescribed novel." },
      { week: 9, topic: "Comparative Literary Analysis", objectives: "Compare thematic treatments across African and Western literary traditions." },
      { week: 10, topic: "Critical Essay Writing on Prescribed Texts", objectives: "Construct thesis-driven examination essays adhering to WAEC/NECO marking schemes." },
    ],
  },
  {
    name: "Civic Education",
    code: "CVE",
    category: "General",
    description: "Compulsory national values, human rights, rule of law, citizenship, and civic duty.",
    schemesOfWork: [
      { week: 1, topic: "Values: Definition, Sources & Types", objectives: "Explain selflessness, honesty, cooperation, and integrity in society." },
      { week: 2, topic: "Citizenship: Rights, Duties & Obligations", objectives: "Identify constitutional fundamental human rights and citizen obligations under Nigerian law." },
      { week: 3, topic: "National Consciousness, Unity & Patriotism", objectives: "Discuss national symbols (flag, anthem, coat of arms) and ways of promoting national unity." },
      { week: 4, topic: "Democratic Practices & Rule of Law", objectives: "Analyze pillars of democracy and dangers of democratic breakdown." },
      { week: 5, topic: "Human Rights Violations & Legal Remedies", objectives: "Outline roles of human rights commissions, courts, and civil society organizations." },
      { week: 6, topic: "Mid-Term Value Assessment & Essay", objectives: "Examine case studies on civil liberties and youth civic participation." },
      { week: 7, topic: "Cultism: Causes, Consequences & Prevention", objectives: "Discuss preventive strategies against secret cult operations in schools and universities." },
      { week: 8, topic: "Drug Abuse, Trafficking & The Role of NDLEA", objectives: "Examine narcotic drug misuse and legal enforcement mechanisms." },
      { week: 9, topic: "Public Service: Roles & Challenges (Corruption & Inefficiency)", objectives: "Explain Code of Conduct Bureau, EFCC, and ICPC anti-corruption mandates." },
      { week: 10, topic: "Youth Empowerment & National Development", objectives: "Identify technical and vocational training programs driving entrepreneurship." },
    ],
  },
  {
    name: "Agricultural Science",
    code: "AGR",
    category: "Science",
    description: "Crop production, animal husbandry, soil science, agricultural economics, and farm tools.",
    schemesOfWork: [
      { week: 1, topic: "Importance of Agriculture & Subsistence vs Commercial Farming", objectives: "Outline economic contributions of agriculture to Nigeria's GDP and food security." },
      { week: 2, topic: "Soil Science: Soil Composition & Soil Profiles", objectives: "Differentiate sandy, loamy, and clay soil textures and measure soil pH." },
      { week: 3, topic: "Soil Fertility, Fertilizers & Crop Rotation", objectives: "Calculate NPK application rates and design 4-year crop rotation schedules." },
      { week: 4, topic: "Crop Production: Cereals, Legumes & Root Tubers", objectives: "Detail agronomic practices for cassava, yam, maize, and cowpea cultivation." },
      { week: 5, topic: "Farm Power, Machinery & Surveying Tools", objectives: "Identify tractors, ploughs, harrows, and optical square surveying tools." },
      { week: 6, topic: "Mid-Term Practical & Field Identification", objectives: "Identify agricultural weed specimens, pests, and farm tools in lab." },
      { week: 7, topic: "Weed & Pest Control in Crop Husbandry", objectives: "Classify weeds and compare cultural, biological, and chemical control techniques." },
      { week: 8, topic: "Animal Nutrition & Digestion in Ruminants vs Non-Ruminants", objectives: "Compare digestive systems of cattle and poultry with feed formulation principles." },
      { week: 9, topic: "Animal Health: Disease Symptoms & Vaccination Schedules", objectives: "Identify viral, bacterial, and protozoan livestock diseases (rinderpest, Newcastle disease)." },
      { week: 10, topic: "Agricultural Marketing & Farm Budgeting", objectives: "Calculate profit and loss accounts, balance sheets, and marketing margins for farm produce." },
    ],
  },
  {
    name: "Computer Studies / ICT",
    code: "CSC",
    category: "Vocational/Technology",
    description: "Digital literacy, computer systems, database design, internet fundamentals, and basic programming.",
    schemesOfWork: [
      { week: 1, topic: "Evolution of Computers & Generational Hardware", objectives: "Distinguish characteristics of 1st through 5th generation computing technologies." },
      { week: 2, topic: "Computer System Components: Hardware & Motherboard Architecture", objectives: "Identify CPU registers, RAM, ROM, buses, and secondary storage media." },
      { week: 3, topic: "System Software & Operating Systems", objectives: "Describe OS functions: memory management, process scheduling, and user interface." },
      { week: 4, topic: "Application Software: Word Processing & Spreadsheets", objectives: "Construct formatted documents and apply formulas/functions in spreadsheets." },
      { week: 5, topic: "Data Representation: Binary, Octal, Hexadecimal & ASCII", objectives: "Convert binary and hexadecimal numbers and explain ASCII encoding standards." },
      { week: 6, topic: "Mid-Term Hands-on Practical Lab Test", objectives: "Demonstrate spreadsheet formula calculations and directory file management." },
      { week: 7, topic: "Computer Networks: LAN, WAN, Topologies & The Internet", objectives: "Compare star, bus, and mesh network topologies with IP address fundamentals." },
      { week: 8, topic: "Database Management Systems (DBMS Fundamentals)", objectives: "Create relational tables with primary keys, fields, and records in SQL/Access." },
      { week: 9, topic: "Computer Ethics, Cyber Security & Virus Prevention", objectives: "Identify phishing, malware types, and cybercrime laws in Nigeria (Cybercrimes Act)." },
      { week: 10, topic: "Introduction to Algorithm Design & Flowcharts", objectives: "Write pseudocode and draw flowcharts for decision-making logic and iteration." },
    ],
  },
];

/**
 * Filter suggested departments excluding any department whose base code or name already exists in the school.
 */
export function getFilteredDepartmentSuggestions(
  existingDepartments: Array<{ code?: string; name?: string }>
): NigerianStandardDepartment[] {
  const existingCodes = (existingDepartments || [])
    .map((d) => (d.code || "").trim().toLowerCase())
    .filter(Boolean);
  const existingNames = new Set(
    (existingDepartments || []).map((d) => (d.name || "").trim().toLowerCase()).filter(Boolean)
  );

  return SUGGESTED_NIGERIAN_DEPARTMENTS.filter((sug) => {
    const sugCodeLower = sug.code.trim().toLowerCase();
    const sugNameLower = sug.name.trim().toLowerCase();
    const codeExists = existingCodes.some(
      (code) => code === sugCodeLower || code.startsWith(`${sugCodeLower}-`)
    );
    return !codeExists && !existingNames.has(sugNameLower);
  });
}

/**
 * Filter suggested subjects excluding any subject whose base code or name already exists in the school.
 */
export function getFilteredSubjectSuggestions(
  existingSubjects: Array<{ code?: string; name?: string }>
): NigerianStandardSubject[] {
  const existingCodes = (existingSubjects || [])
    .map((s) => (s.code || "").trim().toLowerCase())
    .filter(Boolean);
  const existingNames = new Set(
    (existingSubjects || []).map((s) => (s.name || "").trim().toLowerCase()).filter(Boolean)
  );

  return SUGGESTED_NIGERIAN_SUBJECTS.filter((sug) => {
    const sugCodeLower = sug.code.trim().toLowerCase();
    const sugNameLower = sug.name.trim().toLowerCase();
    const codeExists = existingCodes.some(
      (code) => code === sugCodeLower || code.startsWith(`${sugCodeLower}-`)
    );
    return !codeExists && !existingNames.has(sugNameLower);
  });
}

