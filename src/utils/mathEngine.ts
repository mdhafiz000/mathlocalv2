import curriculumDB from '../data/curriculumDB.json';
import { compileQuestion } from './curriculumEvaluator';

export interface MathQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  questionEn: string;
  questionMs: string;
  options: string[]; // Always exactly 4 choices
  correctAnswer: string; // Must match one of the choices exactly
  visualType: string; // E.g., 'none', 'counting', 'sequence', 'number-bond', 'clock', etc.
  visualData: any; // Extra parameters for SVG drawings
}

// Map topic names to topic IDs in the database
const TOPIC_MAPPING: Record<string, number> = {
  'numbers': 1,
  'missing-numbers': 2,
  'addition-subtraction': 3,
  'multiplication-division': 4,
  'fractions': 5,
  'money-shopping': 6,
  'telling-time': 7,
  'measurement-units': 8,
  'shapes-geometry': 9,
  'data-graphs': 10
};

export function generateQuestion(
  year: string,
  topic: string,
  variationIndex?: number,
  selectedTemplateIndex?: number
): MathQuestion {
  const t = topic.toLowerCase();
  const topicId = TOPIC_MAPPING[t] || TOPIC_MAPPING[t.replace(/-/g, ' ')];
  if (!topicId) {
    throw new Error(`Unknown topic: ${topic}`);
  }

  const dbTopic = curriculumDB.find(x => x.id === topicId);
  if (!dbTopic) {
    throw new Error(`Topic ID ${topicId} not found in database`);
  }

  // Filter variations for this topic that match the selected year (e.g., "Y1")
  const yearVars = dbTopic.variations.filter((v: any) => v.year === year);
  if (yearVars.length === 0) {
    throw new Error(`No subtopics found for year ${year} in topic ${topic}`);
  }

  // Determine the variation node to compile
  let selectedVarNode = null;
  if (variationIndex !== undefined && variationIndex >= 0 && variationIndex < yearVars.length) {
    selectedVarNode = yearVars[variationIndex];
  } else {
    const rIdx = Math.floor(Math.random() * yearVars.length);
    selectedVarNode = yearVars[rIdx];
  }

  // Compile using curriculumEvaluator compiler
  return compileQuestion(dbTopic.en, selectedVarNode as any, 'easy', selectedTemplateIndex);
}
