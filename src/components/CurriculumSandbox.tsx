import { useState } from 'react';
import curriculumDBRaw from '../data/curriculumDB.json';
import { generateQuestion, type MathQuestion } from '../utils/mathEngine';
import { MathVisualizer } from './MathVisualizer';

interface SandboxQuestionState {
  question: MathQuestion | null;
  error: string | null;
}

export function CurriculumSandbox() {
  const [dbState, setDbState] = useState<any[]>(curriculumDBRaw);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>('Y1');
  
  const [activeTab, setActiveTab] = useState<'preview' | 'inspector' | 'bulk'>('preview');
  const [activeQuestion, setActiveQuestion] = useState<SandboxQuestionState>({ question: null, error: null });
  
  // Edited JSON state for the inspector
  const [jsonEditText, setJsonEditText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Bulk test results
  const [bulkTestRunning, setBulkTestRunning] = useState(false);
  const [bulkTestResult, setBulkTestResult] = useState<string | null>(null);
  const [auditRows, setAuditRows] = useState<any[] | null>(null);

  const dbTopic = dbState.find(t => t.id === selectedTopicId) || dbState[0];
  const activeVarNode = dbTopic?.variations[selectedVarIndex];

  // Helper to load selected node into JSON editor
  const loadNodeIntoEditor = (node: any) => {
    setJsonEditText(JSON.stringify(node, null, 2));
    setJsonError(null);
  };

  // Trigger a question generation for the active subtopic
  const handleTestVariation = (originalIdx: number, filteredIdx: number, subtypeIdx?: number) => {
    setSelectedVarIndex(originalIdx);
    const varNode = dbTopic?.variations[originalIdx];
    if (!varNode) return;

    try {
      // Map topic ID back to string key for generateQuestion
      const topicKeys = ['numbers', 'missing-numbers', 'addition-subtraction', 'multiplication-division', 'fractions', 'money-shopping', 'telling-time', 'measurement-units', 'shapes-geometry', 'data-graphs'];
      const topicKey = topicKeys[selectedTopicId - 1];

      let q = generateQuestion(selectedYear, topicKey, filteredIdx, subtypeIdx);
      let dedupeAttempts = 0;
      while (activeQuestion.question && q.questionEn === activeQuestion.question.questionEn && dedupeAttempts < 15) {
        q = generateQuestion(selectedYear, topicKey, filteredIdx, subtypeIdx);
        dedupeAttempts++;
      }
      setActiveQuestion({ question: q, error: null });
    } catch (err: any) {
      console.error(err);
      setActiveQuestion({ question: null, error: err.message || 'Error generating question' });
    }
  };

  // Save JSON edits to local state & send to Vite server endpoint to write to disk
  const handleSaveNodeJson = async () => {
    try {
      const parsedNode = JSON.parse(jsonEditText);
      
      // Update local state
      const newDbState = dbState.map(topic => {
        if (topic.id === selectedTopicId) {
          const updatedVars = topic.variations.map((v: any, idx: number) => {
            if (idx === selectedVarIndex) {
              return parsedNode;
            }
            return v;
          });
          return { ...topic, variations: updatedVars };
        }
        return topic;
      });

      setDbState(newDbState);
      setJsonError(null);

      // Write directly to disk using our custom Vite server POST endpoint
      const response = await fetch('/api/save-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDbState)
      });
      const resData = await response.json();
      
      if (resData.status === 'success') {
        alert('🎉 Saved changes directly to curriculumDB.json on disk!');
      } else {
        alert('❌ Error saving to disk: ' + resData.message);
      }
    } catch (err: any) {
      setJsonError('Invalid JSON format: ' + err.message);
    }
  };

  // Run stress tests: 100x runs for each variation of the active topic
  const runStressTest = async () => {
    setBulkTestRunning(true);
    setBulkTestResult(`Initializing Topic Stress Test for ${selectedYear} (100 iterations per variation)...`);
    
    let errorsCount = 0;
    let failures: string[] = [];
    const topicKeys = ['numbers', 'missing-numbers', 'addition-subtraction', 'multiplication-division', 'fractions', 'money-shopping', 'telling-time', 'measurement-units', 'shapes-geometry', 'data-graphs'];
    const topicKey = topicKeys[selectedTopicId - 1];

    const yearVariations = dbTopic.variations.map((v: any, originalIdx: number) => ({ ...v, originalIdx }))
      .filter((v: any) => v.year === selectedYear);

    for (let i = 0; i < yearVariations.length; i++) {
      const vNode = yearVariations[i];
      const vIdx = vNode.originalIdx;
      setBulkTestResult(`Testing subtopic "${vNode.logic}" (100 runs)...`);
      await new Promise(resolve => setTimeout(resolve, 15));

      // Determine template count to sweep
      const subtypeCount = Array.isArray(vNode.templates) ? vNode.templates.length : 1;

      for (let subtypeIdx = 0; subtypeIdx < subtypeCount; subtypeIdx++) {
        for (let run = 0; run < 100; run++) {
          try {
            const q = generateQuestion(selectedYear, topicKey, i, subtypeIdx);
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
            errorsCount++;
            failures.push(`Var ${vIdx + 1} Subtype ${subtypeIdx + 1} Run ${run + 1}: ${err.message || err}`);
          }
        }
      }
    }

    setBulkTestRunning(false);
    if (errorsCount === 0) {
      setBulkTestResult(`🟢 Stress Test Passed!\n- Total Variations: ${yearVariations.length}\n- Total Runs: ${yearVariations.length * 100}\n- Failures: 0`);
    } else {
      setBulkTestResult(`🔴 Stress Test Failed with ${errorsCount} errors:\n\n${failures.slice(0, 30).join('\n')}`);
    }
  };

  // Run full system sweep
  const runFullSystemSweep = async () => {
    setBulkTestRunning(true);
    setBulkTestResult(`Initializing Full System Audit for ${selectedYear}...`);
    
    let totalRuns = 0;
    let errorsCount = 0;
    let failures: string[] = [];
    const topicKeys = ['numbers', 'missing-numbers', 'addition-subtraction', 'multiplication-division', 'fractions', 'money-shopping', 'telling-time', 'measurement-units', 'shapes-geometry', 'data-graphs'];

    let totalSubtopics = 0;
    for (let tIdx = 0; tIdx < dbState.length; tIdx++) {
      const topic = dbState[tIdx];
      const topicKey = topicKeys[tIdx];

      setBulkTestResult(`Auditing Topic: "${topic.en}"...`);
      await new Promise(resolve => setTimeout(resolve, 15));

      const yearVariations = topic.variations.map((v: any, originalIdx: number) => ({ ...v, originalIdx }))
        .filter((v: any) => v.year === selectedYear);
      totalSubtopics += yearVariations.length;

      for (let i = 0; i < yearVariations.length; i++) {
        const vNode = yearVariations[i];
        const vIdx = vNode.originalIdx;
        const subtypeCount = Array.isArray(vNode.templates) ? vNode.templates.length : 1;

        for (let subtypeIdx = 0; subtypeIdx < subtypeCount; subtypeIdx++) {
          for (let run = 0; run < 100; run++) {
            totalRuns++;
            try {
              const q = generateQuestion(selectedYear, topicKey, i, subtypeIdx);
              if (!q.questionEn || !q.questionMs || q.options.length !== 4 || !q.options.includes(q.correctAnswer)) {
                throw new Error('Validation failed');
              }
            } catch (err: any) {
              errorsCount++;
              failures.push(`${topic.en} Var ${vIdx + 1} Subtype ${subtypeIdx + 1}: ${err.message || err}`);
            }
          }
        }
      }
    }

    setBulkTestRunning(false);
    if (errorsCount === 0) {
      setBulkTestResult(`🟢 Full System Audit Passed!\n- Total Subtopics Audited: ${totalSubtopics}\n- Total Runs Simulated: ${totalRuns}\n- Failures: 0`);
    } else {
      setBulkTestResult(`🔴 Audit Failed with ${errorsCount} errors:\n\n${failures.slice(0, 30).join('\n')}`);
    }
  };

  // Generate 3-pass spreadsheet report
  const runThreePassAudit = async () => {
    setBulkTestRunning(true);
    setBulkTestResult(`Generating 3-Pass Audit Report for ${selectedYear}...`);
    
    let healthyCount = 0;
    let staticCount = 0;
    const rows: any[] = [];
    const topicKeys = ['numbers', 'missing-numbers', 'addition-subtraction', 'multiplication-division', 'fractions', 'money-shopping', 'telling-time', 'measurement-units', 'shapes-geometry', 'data-graphs'];

    for (let tIdx = 0; tIdx < dbState.length; tIdx++) {
      const topic = dbState[tIdx];
      const topicKey = topicKeys[tIdx];

      setBulkTestResult(`Auditing topic: "${topic.en}"...`);
      await new Promise(resolve => setTimeout(resolve, 15));

      const yearVariations = topic.variations.map((v: any, originalIdx: number) => ({ ...v, originalIdx }))
        .filter((v: any) => v.year === selectedYear);

      for (let i = 0; i < yearVariations.length; i++) {
        const vNode = yearVariations[i];
        const vIdx = vNode.originalIdx;
        const subtypeCount = Array.isArray(vNode.templates) ? vNode.templates.length : 1;

        for (let subtypeIdx = 0; subtypeIdx < subtypeCount; subtypeIdx++) {
          let q1: MathQuestion;
          let q2: MathQuestion;
          let q3: MathQuestion;
          try {
            q1 = generateQuestion(selectedYear, topicKey, i, subtypeIdx);
            q2 = generateQuestion(selectedYear, topicKey, i, subtypeIdx);
            q3 = generateQuestion(selectedYear, topicKey, i, subtypeIdx);
          } catch (err: any) {
            const errMsg = err.message || String(err);
            const fallbackQ: MathQuestion = {
              id: 'err',
              topic: topic.en,
              subtopic: vNode.logic,
              difficulty: 'easy',
              questionEn: `ERROR: ${errMsg}`,
              questionMs: `ERROR: ${errMsg}`,
              options: [],
              correctAnswer: '',
              visualType: 'none',
              visualData: null
            };
            q1 = q2 = q3 = fallbackQ;
          }

          let status: 'healthy' | 'static' = 'healthy';
          let statusLabel = '🟢 Healthy';

          if (q1.questionEn === q2.questionEn && q2.questionEn === q3.questionEn) {
            status = 'static';
            statusLabel = '🔴 Static';
            staticCount++;
          } else {
            statusLabel = '🟢 Healthy';
            healthyCount++;
          }

          rows.push({
            topicEn: topic.en,
            varIndex: vIdx,
            subtypeIdx,
            logic: vNode.logic,
            q1: q1.questionEn,
            q2: q2.questionEn,
            q3: q3.questionEn,
            ans1: q1.correctAnswer,
            status,
            statusLabel
          });
        }
      }
    }

    setBulkTestRunning(false);
    setAuditRows(rows);
    
    setBulkTestResult(`### 📊 3-Pass Audit Report Summary\n- **Total Subtypes Audited:** ${rows.length}\n- **🟢 Healthy:** ${healthyCount}\n- **🔴 Static (Same prompt/numbers):** ${staticCount}\n\nClick **"Download Offline HTML Audit Sheet"** below to save the complete spreadsheet compare.`);
  };

  const downloadAuditReport = () => {
    if (!auditRows || auditRows.length === 0) return;

    const tableRows = auditRows.map((r: any) => {
      return `
        <tr>
          <td><strong>${r.topicEn}</strong></td>
          <td>Var ${r.varIndex + 1} (Subtype ${r.subtypeIdx + 1})</td>
          <td>${r.logic}</td>
          <td>${r.q1} <br><span style="color: #64748b; font-size: 11px;">Ans: <strong>${r.ans1}</strong></span></td>
          <td>${r.q2}</td>
          <td>${r.q3}</td>
          <td><span class="badge badge-${r.status}">${r.statusLabel}</span></td>
        </tr>
      `;
    }).join('');

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Year 1 Math Curriculum 3-Pass Audit Report</title>
  <style>
    body { font-family: -apple-system, sans-serif; padding: 20px; background: #f8fafc; color: #0f172a; }
    h1 { color: #4f46e5; margin-bottom: 5px; }
    .badge { padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; }
    .badge-healthy { background: #dcfce7; color: #15803d; }
    .badge-static { background: #fee2e2; color: #b91c1c; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; margin-top: 20px; }
    th { background: #0f172a; color: #fff; text-align: left; padding: 12px; font-size: 14px; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; vertical-align: top; }
    tr:hover { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>📊 Year 1 Math Curriculum 3-Pass Audit Report</h1>
  <p>Generates 3 distinct randomized generation runs for each subtopic to verify dynamic variation.</p>
  <table>
    <thead>
      <tr>
        <th>Topic</th>
        <th>Subtopic / Var</th>
        <th>Logic Specification</th>
        <th>Pass 1 Output (EN)</th>
        <th>Pass 2 Output (EN)</th>
        <th>Pass 3 Output (EN)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>`;

    const htmlData = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    const a = document.createElement('a');
    a.href = htmlData;
    a.download = 'year1_math_3_pass_audit_report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="sandbox-panel max-w-7xl mx-auto w-full text-left" style={{ padding: '20px' }}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-slate-800">
        <div>
          <h2 className="font-fun text-3xl text-indigo-600 mb-1" style={{ textShadow: '2px 2px 0px #1e293b' }}>
            🛠️ Curriculum Sandbox ({selectedYear})
          </h2>
          <p className="text-slate-600 font-medium">Verify {selectedYear} curriculum subtopics and live-preview templates.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`chunky-btn ${activeTab === 'preview' ? 'chunky-btn-primary' : 'chunky-btn-light'}`}
          >
            🔍 Playground Preview
          </button>
          <button
            onClick={() => {
              setActiveTab('inspector');
              loadNodeIntoEditor(activeVarNode);
            }}
            className={`chunky-btn ${activeTab === 'inspector' ? 'chunky-btn-success' : 'chunky-btn-light'}`}
          >
            📝 Template Inspector
          </button>
          <button
            onClick={() => {
              setActiveTab('bulk');
              setBulkTestResult(null);
            }}
            className={`chunky-btn ${activeTab === 'bulk' ? 'chunky-btn-warning' : 'chunky-btn-light'}`}
          >
            ⚡ Stress Test
          </button>
        </div>
      </div>

      {activeTab === 'preview' && (
        <div className="flex flex-col gap-6">
          {/* Year Select */}
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-chunky">
            <h3 className="font-fun text-xl mb-4 pb-2 border-b-2 border-slate-200">1. Select Grade Level / Pilih Tahun</h3>
            <div className="flex gap-3 flex-wrap">
              {['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].map(y => {
                const isActive = selectedYear === y;
                const labelMap: Record<string, string> = {
                  Y1: 'Year 1 / Tahun 1',
                  Y2: 'Year 2 / Tahun 2',
                  Y3: 'Year 3 (Coming Soon)',
                  Y4: 'Year 4 (Coming Soon)',
                  Y5: 'Year 5 (Coming Soon)',
                  Y6: 'Year 6 (Coming Soon)',
                };
                return (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setSelectedVarIndex(0);
                      setActiveQuestion({ question: null, error: null });
                    }}
                    className={`chunky-btn ${isActive ? 'chunky-btn-primary' : 'chunky-btn-light'}`}
                    style={{ padding: '10px 20px' }}
                  >
                    <span className="font-fun font-bold">{labelMap[y]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Select */}
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-chunky">
            <h3 className="font-fun text-xl mb-4 pb-2 border-b-2 border-slate-200">2. Select Topic / Pilih Topik</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {dbState.map(t => {
                const isActive = selectedTopicId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTopicId(t.id);
                      setSelectedVarIndex(0);
                      setActiveQuestion({ question: null, error: null });
                    }}
                    className={`chunky-btn justify-start text-sm ${isActive ? 'chunky-btn-primary' : 'chunky-btn-light'}`}
                    style={{ textAlign: 'left', padding: '12px 16px' }}
                  >
                    <span className="mr-2 text-lg">💡</span>
                    <span className="truncate font-fun font-bold">{t.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtopic / Variation Selection */}
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-chunky">
            <div className="mb-4 pb-2 border-b-2 border-slate-200">
              <h3 className="font-fun text-xl mb-1 text-slate-800">
                3. Subtopics / Subtopik (Variations)
              </h3>
              <span className="text-sm font-sans text-indigo-600 font-bold">Category: {dbTopic?.en}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {(() => {
                const yearVariations = (dbTopic?.variations || []).map((v: any, originalIdx: number) => ({ ...v, originalIdx }))
                  .filter((v: any) => v.year === selectedYear);
                
                if (yearVariations.length === 0) {
                  return (
                    <div className="col-span-full text-slate-400 font-medium italic text-center py-8 text-sm">
                      No variations are configured for {selectedYear} under this topic yet.
                    </div>
                  );
                }

                return yearVariations.map((v: any, idx: number) => {
                  const isSelected = selectedVarIndex === v.originalIdx;
                  const templateCount = Array.isArray(v.templates) ? v.templates.length : 1;
                  return (
                    <div
                      key={idx}
                      className={`p-4 border-3 border-slate-800 rounded-2xl flex flex-col justify-between gap-3 transition-all ${
                        isSelected ? 'bg-indigo-50 border-indigo-500 shadow-chunky' : 'bg-slate-50'
                      }`}
                    >
                      <div className="text-left">
                        <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-white font-bold text-xs rounded-full mb-2">
                          Var {idx + 1} ({templateCount} subtype{templateCount > 1 ? 's' : ''})
                        </span>
                        <h4 className="font-semibold text-sm text-slate-800 mb-2 leading-snug min-h-[40px]">{v.logic}</h4>
                      </div>

                      <div className="flex gap-1 flex-col">
                        <button
                          onClick={() => {
                            handleTestVariation(v.originalIdx, idx);
                          }}
                          className={`chunky-btn text-xs py-2 px-4 w-full ${
                            isSelected ? 'chunky-btn-primary' : 'chunky-btn-light'
                          }`}
                        >
                          Play / Uji
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Sandbox Player Visual Card & Console Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-chunky flex flex-col justify-center items-center min-h-[350px]">
              <h3 className="font-fun text-lg mb-3 self-start border-b-2 border-slate-100 pb-1 w-full text-left">🎨 Visual Drawing Preview / Pratinjau Lukisan</h3>
              {activeQuestion.question ? (
                activeQuestion.question.visualType !== 'none' ? (
                  <div className="visualizer-wrapper border-3 border-slate-800 rounded-2xl bg-sky-50/20 overflow-hidden flex justify-center items-center w-full" style={{ minHeight: '260px' }}>
                    <MathVisualizer
                      visualType={activeQuestion.question.visualType}
                      visualData={activeQuestion.question.visualData}
                    />
                  </div>
                ) : (
                  <div className="text-slate-400 font-medium italic text-center text-sm py-20">
                    No dynamic SVG layout is specified for this variation.
                  </div>
                )
              ) : (
                <div className="text-slate-400 font-medium italic text-center py-20 text-sm">
                  Select a variation to render its interactive visual blueprint.
                </div>
              )}
            </div>

            <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-chunky text-left flex flex-col justify-between">
              <div>
                <h3 className="font-fun text-lg mb-3 border-b-2 border-slate-100 pb-1">📝 Live Question Output / Paparan Soalan</h3>
                {activeQuestion.error && (
                  <div className="p-3 bg-red-100 text-red-700 border-2 border-red-800 rounded-xl font-medium text-sm mb-4">
                    ⚠️ Error: {activeQuestion.error}
                  </div>
                )}
                {activeQuestion.question ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Question (EN)</span>
                      <p className="font-fun font-bold text-slate-800 text-lg leading-snug mt-0.5">{activeQuestion.question.questionEn}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Question (MS)</span>
                      <p className="font-fun font-bold text-indigo-700 text-lg leading-snug mt-0.5">{activeQuestion.question.questionMs}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {activeQuestion.question.options.map((option, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-3 border-2 rounded-xl text-center font-bold text-sm ${
                            option === activeQuestion.question?.correctAnswer
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {option} {option === activeQuestion.question?.correctAnswer && ' (✓)'}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 font-medium italic text-center py-16 text-sm">
                    Question outputs will display here in real-time.
                  </div>
                )}
              </div>
              {activeQuestion.question && (
                <div className="text-[11px] font-mono text-slate-400 mt-4 border-t pt-2">
                  Generated ID: {activeQuestion.question.id} | Subtopic: {activeQuestion.question.subtopic}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inspector' && (
        <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-chunky">
          <div className="mb-4 pb-2 border-b-2 border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-fun text-xl mb-1 text-slate-800">
                📝 Template Inspector & Local Writer
              </h3>
              <span className="text-sm font-sans text-indigo-600 font-bold">
                Editing: {dbTopic?.en} &rarr; Var {selectedVarIndex + 1} ({activeVarNode?.logic})
              </span>
            </div>
            <button
              onClick={() => loadNodeIntoEditor(activeVarNode)}
              className="chunky-btn chunky-btn-light text-xs"
            >
              🔄 Reset Editor
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              Modify the JSON template directly. You can add new subtypes by adding them into a `templates` array, or configure variables. Click <strong>"Save Template changes to Disk"</strong> to write your edits directly back to the database.
            </p>

            <textarea
              value={jsonEditText}
              onChange={(e) => setJsonEditText(e.target.value)}
              className="w-full font-mono text-xs p-4 bg-slate-900 text-green-400 border-4 border-slate-800 rounded-2xl"
              style={{ minHeight: '380px' }}
            />

            {jsonError && (
              <div className="p-3 bg-red-100 text-red-700 border-2 border-red-800 rounded-xl font-medium text-xs">
                ⚠️ {jsonError}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleSaveNodeJson}
                className="chunky-btn chunky-btn-primary text-sm px-6 py-3"
              >
                💾 Save Template changes to Disk
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-chunky">
          <h3 className="font-fun text-2xl text-slate-800 mb-2">⚡ Stress Test Suite</h3>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Verify Year 1 curriculum subtopics using simulated sweeps. This executes validation cycles checking distractors formatting, correct answer matching, and dynamic variable boundaries.
          </p>
          
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <button
              onClick={runStressTest}
              disabled={bulkTestRunning}
              className="chunky-btn chunky-btn-warning text-sm px-6 py-3"
            >
              {bulkTestRunning ? '⏳ Testing...' : '🚀 Test Selected Topic (100x/var)'}
            </button>
            <button
              onClick={runFullSystemSweep}
              disabled={bulkTestRunning}
              className="chunky-btn chunky-btn-primary text-sm px-6 py-3"
            >
              {bulkTestRunning ? '⏳ Auditing...' : '🔥 Full System Audit (3,100x)'}
            </button>
            <button
              onClick={runThreePassAudit}
              disabled={bulkTestRunning}
              className="chunky-btn chunky-btn-success text-sm px-6 py-3"
            >
              {bulkTestRunning ? '⏳ Running...' : '📊 Generate 3-Pass Audit Report'}
            </button>
            {!bulkTestRunning && auditRows && (
              <button
                onClick={downloadAuditReport}
                className="chunky-btn chunky-btn-light text-sm px-6 py-3"
              >
                📥 Download Offline HTML Audit Sheet
              </button>
            )}
            {bulkTestRunning && (
              <span className="animate-pulse text-sm font-bold text-indigo-600 ml-2">Running validation checks...</span>
            )}
          </div>

          {bulkTestResult && (
            <div className="p-5 border-3 border-slate-800 rounded-2xl bg-slate-50 font-mono text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {bulkTestResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
