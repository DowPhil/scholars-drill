/**
 * Simulated practice, used until the backend can assemble drills
 * (`POST /api/practice/sessions`, PRD §2.2). Set PRACTICE_API=on to switch to
 * the real endpoint.
 *
 * A small sample bank, every answer worked through by hand: the product's
 * promise is that answers are right, sample or not.
 */

export const SIMULATE_PRACTICE = process.env.PRACTICE_API !== "on";

export type SimQuestion = {
  id: string;
  subject: string;
  topic: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  /** Why each wrong option is wrong, keyed by option index. */
  why: Record<number, string>;
  /** A passage several questions share, read once (JAMB Use of English). */
  passage?: { id: string; title: string; text: string };
  /** A diagram the question needs. Content, not decoration (WEB-PRD 10). */
  image?: { src: string; alt: string; width: number; height: number };
};

const OYO_PASSAGE = {
  id: "oyo-farm",
  title: "Read the passage and answer the questions on it.",
  text: "When the rains failed for a second year, Mrs Adeyemi did not abandon her tomato farm outside Oyo. Instead, she laid thin rubber pipes along each row and fed them from a single tank on a raised platform. Water now dripped slowly onto the roots rather than flooding the whole field. Her neighbours laughed at first, calling the pipes \"Mama's spaghetti\". By harvest, however, her yield had doubled while she used less than half the water of the previous season. The following year, three of the neighbours who had laughed asked her to help them install the same system.",
};

const BANK: SimQuestion[] = [
  // Mathematics
  {
    id: "m1", subject: "Mathematics", topic: "Indices and logarithms",
    prompt: "If $\\log_{10} 2 = 0.3010$, find the value of $\\log_{10} 8$.",
    options: ["0.6020", "0.9030", "2.4080", "0.0903"], answer: 1,
    explanation: "$8 = 2^3$, so $\\log_{10} 8 = 3 \\times \\log_{10} 2 = 3 \\times 0.3010 = 0.9030$.",
    why: { 0: "0.6020 is $2 \\times \\log_{10} 2$, which is $\\log_{10} 4$.", 2: "2.4080 multiplies by 8 instead of by the power, 3.", 3: "Right digits, decimal point in the wrong place." },
  },
  {
    id: "m2", subject: "Mathematics", topic: "Indices and logarithms",
    prompt: "Evaluate $8^{\\frac{2}{3}}$.",
    options: ["2", "4", "16/3", "6"], answer: 1,
    explanation: "Take the cube root first: $\\sqrt[3]{8} = 2$. Then square it: $2^2 = 4$.",
    why: { 0: "2 is only the cube root; it still has to be squared.", 2: "$\\frac{16}{3}$ multiplies 8 by $\\frac{2}{3}$ instead of raising it to that power.", 3: "6 has no route from $8^{\\frac{2}{3}}$." },
  },
  {
    id: "m3", subject: "Mathematics", topic: "Quadratic equations",
    prompt: "Find the roots of $x^2 - 5x + 6 = 0$.",
    options: ["2 and 3", "−2 and −3", "1 and 6", "−1 and 6"], answer: 0,
    explanation: "$x^2 - 5x + 6 = (x - 2)(x - 3) = 0$, so $x = 2$ or $x = 3$.",
    why: { 1: "These are the roots of $x^2 + 5x + 6 = 0$; the signs are flipped.", 2: "1 × 6 = 6, but 1 + 6 = 7, not 5.", 3: "−1 × 6 = −6, not +6." },
  },
  {
    id: "m4", subject: "Mathematics", topic: "Probability",
    prompt: "A fair die is thrown once. What is the probability of getting a number greater than 4?",
    options: ["$\\frac{1}{6}$", "$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$"], answer: 1,
    explanation: "Only 5 and 6 are greater than 4: 2 outcomes out of 6, so $\\frac{2}{6} = \\frac{1}{3}$.",
    why: { 0: "1/6 counts only one of the two numbers, 5 and 6.", 2: "1/2 would be three outcomes; 4 itself is not greater than 4.", 3: "2/3 is the probability of 4 or less." },
  },
  {
    id: "m5", subject: "Mathematics", topic: "Statistics",
    prompt: "Find the mean of 2, 4, 6, 8 and 10.",
    options: ["5", "6", "30", "8"], answer: 1,
    explanation: "Sum = 2 + 4 + 6 + 8 + 10 = 30. Mean = 30 ÷ 5 = 6.",
    why: { 0: "5 is the number of values, not the mean.", 2: "30 is the sum; it still has to be divided by 5.", 3: "8 is just one of the values." },
  },
  // Physics
  {
    id: "p1", subject: "Physics", topic: "Motion",
    prompt: "A body starts from rest and accelerates uniformly at $2 \\text{ m/s}^2$. What is its velocity after 2.5 s?",
    options: ["0 m/s", "5 m/s", "10 m/s", "20 m/s"], answer: 1,
    explanation: "$v = u + at = 0 + (2 \\times 2.5) = 5$ m/s.",
    why: { 0: "0 m/s is the starting velocity, before it accelerates.", 2: "10 m/s doubles the correct answer.", 3: "20 m/s does not follow from v = u + at." },
  },
  {
    id: "p2", subject: "Physics", topic: "Electricity",
    prompt: "A current of 3 A flows through a resistor connected to a 12 V supply. What is the resistance?",
    options: ["36 Ω", "4 Ω", "0.25 Ω", "15 Ω"], answer: 1,
    explanation: "$R = \\frac{V}{I} = \\frac{12}{3} = 4 \\Omega$.",
    why: { 0: "36 multiplies V by I, which gives power in watts.", 2: "0.25 is I ÷ V, the formula upside down.", 3: "15 adds the numbers." },
  },
  {
    id: "p3", subject: "Physics", topic: "Measurement and units",
    prompt: "What is the SI unit of power?",
    options: ["Joule", "Watt", "Newton", "Pascal"], answer: 1,
    explanation: "Power is the rate of doing work, measured in watts: one watt is one joule per second.",
    why: { 0: "The joule is the unit of work and energy.", 2: "The newton is the unit of force.", 3: "The pascal is the unit of pressure." },
  },
  {
    id: "p4", subject: "Physics", topic: "Waves",
    prompt: "A wave has a frequency of 50 Hz and a wavelength of 2 m. What is its speed?",
    options: ["25 m/s", "52 m/s", "100 m/s", "0.04 m/s"], answer: 2,
    explanation: "$v = f\\lambda = 50 \\times 2 = 100$ m/s.",
    why: { 0: "25 divides frequency by wavelength.", 1: "52 adds the two numbers.", 3: "0.04 divides wavelength by frequency." },
  },
  // Chemistry
  {
    id: "c1", subject: "Chemistry", topic: "Stoichiometry",
    prompt: "How many moles are there in 22 g of carbon(IV) oxide? (C = 12, O = 16)",
    options: ["0.25 mol", "0.50 mol", "1.00 mol", "2.00 mol"], answer: 1,
    explanation: "The molar mass of $\\ce{CO2}$ is $12 + (2 \\times 16) = 44$ g/mol. Moles $= \\frac{22}{44} = 0.50$ mol.",
    why: { 0: "0.25 mol of $\\ce{CO2}$ would weigh 11 g.", 2: "1.00 mol of $\\ce{CO2}$ weighs 44 g, twice the mass given.", 3: "2.00 mol of $\\ce{CO2}$ would weigh 88 g." },
  },
  {
    id: "c2", subject: "Chemistry", topic: "Atomic structure",
    prompt: "Sodium has atomic number 11 and mass number 23. How many neutrons are in its nucleus?",
    options: ["11", "12", "23", "34"], answer: 1,
    explanation: "Neutrons = mass number − atomic number = 23 − 11 = 12.",
    why: { 0: "11 is the number of protons.", 2: "23 is the mass number: protons and neutrons together.", 3: "34 adds the two numbers." },
  },
  {
    id: "c3", subject: "Chemistry", topic: "Acids, bases and salts",
    prompt: "What is the pH of a neutral solution at 25 °C?",
    options: ["0", "1", "7", "14"], answer: 2,
    explanation: "At 25 °C pure water and neutral solutions have pH 7. Below 7 is acidic, above 7 is alkaline.",
    why: { 0: "pH 0 is very strongly acidic.", 1: "pH 1 is strongly acidic.", 3: "pH 14 is very strongly alkaline." },
  },
  {
    id: "c4", subject: "Chemistry", topic: "Organic chemistry",
    prompt: "What is the general formula of the alkanes?",
    options: ["$\\ce{C_nH_{2n}}$", "$\\ce{C_nH_{2n+2}}$", "$\\ce{C_nH_{2n-2}}$", "$\\ce{C_nH_{2n+1}OH}$"], answer: 1,
    explanation: "Alkanes are saturated: each carbon makes four single bonds, giving $\\ce{C_nH_{2n+2}}$, as in methane $\\ce{CH4}$ and ethane $\\ce{C2H6}$.",
    why: { 0: "$\\ce{C_nH_{2n}}$ is the alkenes.", 2: "$\\ce{C_nH_{2n-2}}$ is the alkynes.", 3: "$\\ce{C_nH_{2n+1}OH}$ is the alkanols." },
  },
  // Biology
  {
    id: "b1", subject: "Biology", topic: "Respiration",
    prompt: "In which organelle does aerobic respiration mainly take place?",
    options: ["Ribosome", "Mitochondrion", "Nucleus", "Golgi body"], answer: 1,
    explanation: "The Krebs cycle and the electron transport chain run in the mitochondria, which release most of the cell's energy.",
    why: { 0: "Ribosomes make proteins.", 2: "The nucleus holds the genetic material and controls the cell.", 3: "The Golgi body packages and transports materials." },
  },
  {
    id: "b2", subject: "Biology", topic: "Genetics",
    prompt: "Tallness (T) is dominant over shortness (t). What fraction of the offspring of Tt × Tt will be tall?",
    options: ["1/4", "1/2", "3/4", "All of them"], answer: 2,
    explanation: "The cross gives TT, Tt, Tt and tt. Three of the four carry T and are tall: 3/4.",
    why: { 0: "1/4 is the fraction that is short (tt).", 1: "1/2 is the fraction that is Tt only, leaving out TT.", 3: "One in four is tt and short." },
  },
  {
    id: "b3", subject: "Biology", topic: "Nutrition",
    prompt: "A lack of vitamin C in the diet causes",
    options: ["rickets", "scurvy", "beriberi", "night blindness"], answer: 1,
    explanation: "Vitamin C (ascorbic acid) deficiency causes scurvy: bleeding gums and slow-healing wounds.",
    why: { 0: "Rickets is caused by a lack of vitamin D.", 2: "Beriberi is caused by a lack of vitamin B₁ (thiamine).", 3: "Night blindness is caused by a lack of vitamin A." },
  },
  {
    id: "b4", subject: "Biology", topic: "Cell biology",
    prompt: "Which of these structures is found in plant cells but not in animal cells?",
    options: ["Cell membrane", "Cell wall", "Nucleus", "Mitochondrion"], answer: 1,
    explanation: "Plant cells have a cellulose cell wall outside the cell membrane. Animal cells do not.",
    why: { 0: "Both plant and animal cells have a cell membrane.", 2: "Both have a nucleus.", 3: "Both have mitochondria." },
  },
  {
    id: "p5", subject: "Physics", topic: "Electricity",
    prompt: "In the circuit shown, what current flows from the 12 V cell?",
    image: { src: "/questions/series-circuit.svg", alt: "A 12 V cell connected in series with a 2 ohm resistor and a 4 ohm resistor.", width: 320, height: 180 },
    options: ["0.5 A", "2 A", "3 A", "9 A"], answer: 1,
    explanation: "In series the resistances add: $2 + 4 = 6 \\Omega$. $I = \\frac{V}{R} = \\frac{12}{6} = 2$ A.",
    why: { 0: "0.5 A is R ÷ V, the formula upside down.", 2: "3 A uses only the 4 Ω resistor.", 3: "9 A treats the resistors as parallel (1.33 Ω); here they are in series." },
  },
  {
    id: "b5", subject: "Biology", topic: "Classification",
    prompt: "Which of these animals is NOT a mammal?",
    options: ["Whale", "Bat", "Shark", "Dolphin", "Human"], answer: 2,
    explanation: "A shark is a cartilaginous fish: it breathes through gills and has no mammary glands. The others all feed their young on milk.",
    why: { 0: "Whales are mammals that live in water.", 1: "Bats are flying mammals.", 3: "Dolphins are mammals; they breathe air.", 4: "Humans are mammals." },
  },
  // Use of English
  {
    id: "e5", subject: "Use of English", topic: "Comprehension", passage: OYO_PASSAGE,
    prompt: "The passage is mainly about",
    options: ["how a farmer got through a drought with a new way of watering", "why tomatoes need a lot of rain", "how neighbours mocked a farmer", "the cost of irrigation equipment"], answer: 0,
    explanation: "Every sentence follows Mrs Adeyemi's drip pipes: why she laid them, how they worked, and what they achieved in the dry seasons.",
    why: { 1: "The passage never explains tomatoes' need for rain.", 2: "The mockery is one detail, not the main idea.", 3: "Cost is not mentioned." },
  },
  {
    id: "e6", subject: "Use of English", topic: "Comprehension", passage: OYO_PASSAGE,
    prompt: "The neighbours' request in the last sentence shows that they",
    options: ["still found the pipes funny", "were convinced by her results", "wanted to buy her farm", "had more water than she did"], answer: 1,
    explanation: "They had laughed, but after her yield doubled on half the water they asked for the same system: her results convinced them.",
    why: { 0: "Asking for help installing the pipes is the opposite of finding them funny.", 2: "Nothing suggests buying the farm.", 3: "The passage says nothing about their water supply." },
  },
  {
    id: "e7", subject: "Use of English", topic: "Comprehension", passage: OYO_PASSAGE,
    prompt: "The word \"abandon\", as used in the passage, means",
    options: ["give up", "sell", "water", "expand"], answer: 0,
    explanation: "She did not abandon the farm: she did not give it up, but found another way to keep it going.",
    why: { 1: "Selling is one way to give something up, but the sentence is about giving up, not a sale.", 2: "Watering is what she did instead, not what abandon means.", 3: "Expand is unrelated to abandon." },
  },
  {
    id: "e1", subject: "Use of English", topic: "Antonyms",
    prompt: "Choose the option opposite in meaning to the word in quotes: The reviewers were \"laudatory\" about her first novel.",
    options: ["critical", "flattering", "detailed", "hesitant"], answer: 0,
    explanation: "Laudatory means expressing praise, so its opposite is critical.",
    why: { 1: "Flattering is close in meaning to laudatory.", 2: "Detailed describes how much was said, not whether it was praise.", 3: "Hesitant describes doubt, not the opposite of praise." },
  },
  {
    id: "e2", subject: "Use of English", topic: "Synonyms",
    prompt: "Choose the option nearest in meaning to the word in quotes: The manager gave a \"candid\" account of the loss.",
    options: ["frank", "brief", "false", "cautious"], answer: 0,
    explanation: "Candid means open and honest, so frank is nearest in meaning.",
    why: { 1: "Brief is about length, not honesty.", 2: "False is close to the opposite of candid.", 3: "Cautious suggests holding back, which candid does not." },
  },
  {
    id: "e3", subject: "Use of English", topic: "Lexis and structure",
    prompt: "Choose the option that best completes the sentence: Neither the teacher nor the students ___ present.",
    options: ["was", "were", "is", "has been"], answer: 1,
    explanation: "With neither … nor, the verb agrees with the nearer subject. \"Students\" is plural, so were.",
    why: { 0: "Was would agree with the teacher, but the nearer subject is the students.", 2: "Is is singular and in the wrong tense.", 3: "Has been is singular." },
  },
  {
    id: "e4", subject: "Use of English", topic: "Oral English",
    prompt: "Which of these words is stressed on the second syllable?",
    options: ["table", "begin", "window", "happy"], answer: 1,
    explanation: "be-GIN puts the stress on the second syllable. The others are stressed on the first.",
    why: { 0: "TA-ble is stressed on the first syllable.", 2: "WIN-dow is stressed on the first syllable.", 3: "HAP-py is stressed on the first syllable." },
  },
];

/** Deterministic shuffle, so a refresh shows the same drill in the same order. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSimDrill(opts: { subject: string; topic?: string; count?: number; seed: number }): SimQuestion[] {
  const pool = BANK.filter((q) => q.subject === opts.subject && (!opts.topic || q.topic === opts.topic));
  const random = seeded(opts.seed);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return groupByPassage(shuffled.slice(0, opts.count ?? shuffled.length));
}

/** Questions on one passage sit together, so it is read once, not re-found. */
function groupByPassage(questions: SimQuestion[]): SimQuestion[] {
  const out: SimQuestion[] = [];
  for (const q of questions) {
    if (out.includes(q)) continue;
    out.push(q);
    if (q.passage) out.push(...questions.filter((o) => o !== q && o.passage?.id === q.passage!.id));
  }
  return out;
}

export type SimExam = {
  id: string;
  title: string;
  exam: string;
  subjects: string[];
  minutes: number;
};

/**
 * Sample CBT simulations, standing in for admin-published quizzes. The real
 * UTME is four subjects, 180 questions in 120 minutes; the sample bank is
 * small, so this one is scaled down and its clock with it.
 */
export const SIM_EXAMS: SimExam[] = [
  {
    id: "utme-sample",
    title: "UTME sample mock",
    exam: "JAMB",
    subjects: ["Use of English", "Mathematics", "Physics", "Chemistry"],
    minutes: 15,
  },
];

export function findSimExam(id: string): SimExam | undefined {
  return SIM_EXAMS.find((e) => e.id === id);
}

/** Every sample question for the exam's subjects, in subject order. */
export function buildSimExam(exam: SimExam, seed: number): SimQuestion[] {
  return exam.subjects.flatMap((subject, i) => buildSimDrill({ subject, seed: seed + i }));
}

/** Sample questions by id, in the order given; unknown ids are dropped. */
export function getSimQuestions(ids: string[]): SimQuestion[] {
  return ids.map((id) => BANK.find((q) => q.id === id)).filter((q): q is SimQuestion => Boolean(q));
}
