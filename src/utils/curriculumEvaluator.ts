// Math curriculum template logic parser and evaluator
import type { MathQuestion } from './mathEngine';

// Common names and items list to inject into the evaluation context
const NAMES = ['Adam', 'Sarah', 'Liam', 'Emma', 'Zara', 'Hanhan', 'Tambi', 'Ali', 'Siti', 'Muthu', 'Chong', 'Gopal', 'Mei', 'Raju'];
const ITEMS = [
  { en: 'apple', ms: 'epal', emoji: '🍎' },
  { en: 'cookie', ms: 'biskut', emoji: '🍪' },
  { en: 'star', ms: 'bintang', emoji: '⭐' },
  { en: 'cupcake', ms: 'kek cawan', emoji: '🧁' },
  { en: 'balloon', ms: 'belon', emoji: '🎈' },
  { en: 'car', ms: 'kereta', emoji: '🚗' },
  { en: 'dinosaur', ms: 'dinosaur', emoji: '🦖' },
  { en: 'butterfly', ms: 'rama-rama', emoji: '🦋' }
];

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Scrambles distractor options
export function scrambleChoices(correct: string, distractors: string[]): string[] {
  const choicesSet = new Set<string>();
  choicesSet.add(correct);
  
  for (const d of distractors) {
    if (d !== correct && d.trim() !== '') {
      choicesSet.add(d);
    }
  }

  let fallbackValue = 0;
  const isNumeric = !isNaN(Number(correct));
  while (choicesSet.size < 4) {
    if (isNumeric) {
      const correctVal = Number(correct);
      const randomOffset = Math.floor(Math.random() * 16) - 8; // wider spread
      const val = correctVal + (randomOffset === 0 ? 3 : randomOffset);
      if ((correctVal < 0 || val >= 0) && val !== correctVal) {
        choicesSet.add(String(val));
      }
    } else {
      choicesSet.add(`Option ${fallbackValue + 1}`);
    }
    fallbackValue++;
  }

  return shuffleArray(Array.from(choicesSet).slice(0, 4));
}

// Generates choices based on correct answer and a step/offset
export function generateChoices(correct: number | string, rangeOffset = 4): string[] {
  const correctVal = Number(correct);
  const distractors = [
    String(correctVal + rangeOffset),
    String(correctVal - rangeOffset >= 0 ? correctVal - rangeOffset : correctVal + rangeOffset + 2),
    String(correctVal + Math.floor(rangeOffset / 2) + 1)
  ];
  return scrambleChoices(String(correct), distractors);
}

// Safe evaluation of mathematical and functional expressions in context
export function evaluateExpression(expr: any, context: Record<string, any>): any {
  if (typeof expr !== 'string') {
    return expr;
  }
  // Translate common mathematical notations to Javascript equivalents
  let parsedExpr = expr
    .replace(/(?<!Math\.)\bround\(/g, 'Math.round(')
    .replace(/(?<!Math\.)\babs\(/g, 'Math.abs(')
    .replace(/(?<!Math\.)\bceil\(/g, 'Math.ceil(')
    .replace(/(?<!Math\.)\bfloor\(/g, 'Math.floor(')
    .replace(/(?<!Math\.)\bsqrt\(/g, 'Math.sqrt(')
    .replace(/\brandom\(([^)]+)\)/g, (_, args) => 'randomRange(' + args.replace(/\.\./g, ',') + ')');

  const keys = Object.keys(context);
  const vals = Object.values(context);

  try {
    const fn = new Function(...keys, `return ${parsedExpr};`);
    return fn(...vals);
  } catch (err) {
    console.error('DSL evaluation error for:', expr, 'Parsed expression:', parsedExpr, 'Context values:', vals, err);
    return 0;
  }
}

// Evaluates a variable generation definition like "random(10..40)"
export function generateVariable(definition: string, context: Record<string, any>): any {
  const def = definition.trim();

  // 1. Check for random range: random(10..40) or random(-10..-5)
  const rangeMatch = def.match(/^random\((-?\d+)\.\.(-?\d+)\)$/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 2. Check for list selection: choose(item1, item2, item3)
  const chooseMatch = def.match(/^choose\((.+)\)$/);
  if (chooseMatch) {
    const items = chooseMatch[1].split(',').map(s => s.trim());
    const chosen = items[Math.floor(Math.random() * items.length)];
    if (/^['"].*['"]$/.test(chosen)) {
      return chosen.slice(1, -1);
    }
    const num = Number(chosen);
    if (!isNaN(num) && chosen !== '') {
      return num;
    }
    return evaluateExpression(chosen, context);
  }

  // 3. Fall back to standard expression evaluation
  return evaluateExpression(def, context);
}

// Fills template strings: "Emma has {a} apples" -> "Emma has 12 apples"
export function formatTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/\{([^}]+)\}/g, (_, key) => {
    const trimKey = key.trim();
    if (context[trimKey] !== undefined) {
      return String(context[trimKey]);
    }
    // Try evaluating key as expression
    return String(evaluateExpression(trimKey, context));
  });
}

export interface QuestionTemplate {
  question?: string;
  questionEn?: string;
  questionMs?: string;
  vars: Record<string, string>;
  answer: string;
  distractors: string;
  visual: {
    type: string;
    params: Record<string, string>;
  };
}

// Interface for database rows
export interface CurriculumNode {
  topicId: number;
  variationId: string;
  year: string;
  logic: string;
  template?: QuestionTemplate;
  templates?: QuestionTemplate[];
}

// Compiles a database template variation into an active question
export function compileQuestion(
  topicName: string,
  node: CurriculumNode,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  selectedTemplateIndex?: number
): MathQuestion {
  const id = `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const context: Record<string, any> = {};

  // Inject helper libraries into the calculation context
  context.generateChoices = generateChoices;
  context.scrambleChoices = scrambleChoices;
  context.abs = Math.abs;
  context.round = Math.round;
  context.randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  context.choose = (...args: any[]) => args[Math.floor(Math.random() * args.length)];

  // Pick the target template (support multi-template arrays)
  let t = node.template;
  if (Array.isArray(node.templates) && node.templates.length > 0) {
    let index = Math.floor(Math.random() * node.templates.length);
    if (selectedTemplateIndex !== undefined && selectedTemplateIndex >= 0 && selectedTemplateIndex < node.templates.length) {
      index = selectedTemplateIndex;
    }
    t = node.templates[index];
  }

  if (!t) {
    // Default fallback empty template
    t = {
      questionEn: 'Solve:',
      questionMs: 'Selesaikan:',
      vars: {},
      answer: '0',
      distractors: 'generateChoices(0, 4)',
      visual: { type: 'none', params: {} }
    };
  }

  // 1. Pick random entities and place in context
  const name1 = NAMES[Math.floor(Math.random() * NAMES.length)];
  let name2 = NAMES[Math.floor(Math.random() * NAMES.length)];
  while (name1 === name2) {
    name2 = NAMES[Math.floor(Math.random() * NAMES.length)];
  }
  const itemObj = ITEMS[Math.floor(Math.random() * ITEMS.length)];

  context.name1 = name1;
  context.name2 = name2;
  context.itemEn = itemObj.en;
  context.itemMs = itemObj.ms;
  context.itemEmoji = itemObj.emoji;

  // 2. Resolve variable equations sequentially
  if (t.vars) {
    for (const [varName, varDef] of Object.entries(t.vars)) {
      context[varName] = generateVariable(varDef, context);
    }
  }

  // 3. Resolve correct answer value
  const correctRaw = evaluateExpression(t.answer, context);
  const correctStr = String(correctRaw);
  context.ans = correctRaw;

  // 4. Resolve options list
  let optionsList: string[] = [];
  try {
    const optionsRaw = evaluateExpression(t.distractors, context);
    if (Array.isArray(optionsRaw)) {
      optionsList = optionsRaw.map(String);
    } else {
      optionsList = generateChoices(correctStr, 4);
    }
  } catch (err) {
    optionsList = generateChoices(correctStr, 4);
  }

  // 5. Compile questions text
  const rawQEn = t.questionEn || t.question || 'Solve:';
  const rawQMs = t.questionMs || t.question || 'Selesaikan:';
  const questionEn = formatTemplate(rawQEn, context);
  const questionMs = formatTemplate(rawQMs, context);

  // 6. Compile dynamic SVG parameters
  let visualData: any = null;
  if (t.visual && t.visual.type !== 'none') {
    visualData = {};
    if (t.visual.params) {
      for (const [paramName, paramDef] of Object.entries(t.visual.params)) {
        visualData[paramName] = evaluateExpression(paramDef, context);
      }
    }
  }

  return {
    id,
    topic: topicName,
    subtopic: node.logic || `${node.year} Variation`,
    difficulty,
    questionEn,
    questionMs,
    options: optionsList,
    correctAnswer: correctStr,
    visualType: (t.visual.type as any) || 'none',
    visualData
  };
}
