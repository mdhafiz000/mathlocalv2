import { generateQuestion } from '../utils/mathEngine';
import curriculumDB from '../data/curriculumDB.json';

export interface TestResult {
  success: boolean;
  totalRun: number;
  failuresCount: number;
  errors: string[];
}

export function runValidationTests(iterationsPerVar = 100): TestResult {
  const errors: string[] = [];
  let totalRun = 0;
  let failuresCount = 0;

  const topics = [
    'numbers', 'missing-numbers', 'addition-subtraction', 'multiplication-division',
    'fractions', 'money-shopping', 'telling-time', 'measurement-units', 'shapes-geometry', 'data-graphs'
  ];

  for (let tIdx = 0; tIdx < topics.length; tIdx++) {
    const topic = topics[tIdx];
    const dbTopic = curriculumDB.find(x => x.id === tIdx + 1);
    if (!dbTopic) continue;

    for (let vIdx = 0; vIdx < dbTopic.variations.length; vIdx++) {
      const vNode = dbTopic.variations[vIdx];
      const subtypeCount = Array.isArray((vNode as any).templates) ? (vNode as any).templates.length : 1;

      for (let subtypeIdx = 0; subtypeIdx < subtypeCount; subtypeIdx++) {
        for (let run = 0; run < iterationsPerVar; run++) {
          totalRun++;
          try {
            const q = generateQuestion('Y1', topic, vIdx, subtypeIdx);
            
            if (!q.questionEn || !q.questionMs) {
              throw new Error(`Empty question string`);
            }
            if (!q.options || q.options.length !== 4) {
              throw new Error(`Options count is not 4 (found ${q.options?.length})`);
            }
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Correct answer "${q.correctAnswer}" is missing from choices: [${q.options.join(', ')}]`);
            }
          } catch (err: any) {
            failuresCount++;
            errors.push(`Topic: ${topic}, Var ${vIdx + 1} Run ${run + 1}: ${err.message || err}`);
            if (errors.length > 10) {
              return {
                success: false,
                totalRun,
                failuresCount,
                errors
              };
            }
          }
        }
      }
    }
  }

  return {
    success: failuresCount === 0,
    totalRun,
    failuresCount,
    errors
  };
}
