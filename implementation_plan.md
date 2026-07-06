# Implementation Plan - Math Local v2 (Multi-Template & Inspector Sandbox)

This plan details the architecture and roadmap for creating **Math Local v2** under [math local v2](file:///c:/Coding/math%20local%20v2). The focus is to set up a clean React workspace, implement the **Multi-Template Array** generator engine, and build a **Curriculum Inspector Sandbox** for Year 1 topics.

---

## Technical Architecture

### 1. Multi-Template Array Engine
- In [curriculumDB.json](file:///c:/Coding/math%20local%20v2/src/data/curriculumDB.json), a sub-topic variation can optionally contain a `templates` array instead of a single `template` object.
- Each item in the `templates` array represents a distinct question subtype (e.g. *subtraction equation* vs *multiplication equation* under the same algebra topic, or *coin flip* vs *dice roll* under probability).
- The compiler in [curriculumEvaluator.ts](file:///c:/Coding/math%20local%20v2/src/utils/curriculumEvaluator.ts) automatically checks if `templates` is an array:
  - If yes, it randomly selects one sub-template to compile for the student.
  - If no, it falls back to the single `template`.

### 2. Developer Curriculum Inspector & Editor UI
- **Curriculum Tree:** Sidebar showing all topics, subtopics, and whether they use a single template or multi-template array.
- **Subtype Tabs:** Interface tabs to toggle between different subtypes within a multi-template array.
- **JSON Inspector:** Live code block displaying the exact JSON definition of the active template.
- **Live Simulator Playground:** Dynamic rendering block that compiles the selected template/subtype on the fly, rendering 5 test questions with their drawings instantly.
- **Visual Builder Form:** Inputs to easily add new templates or subtypes and save them directly.

### 3. Local Save-to-Disk Dev Endpoint
- Enhance `vite.config.ts` to intercept `POST` requests to `/api/save-curriculum`.
- The endpoint takes the updated curriculum JSON body and saves it directly back to [curriculumDB.json](file:///c:/Coding/math%20local%20v2/src/data/curriculumDB.json) on disk.

---

## Year 1 Topics to Implement

We will implement the following 20 Year 1 topics using this architecture:
1. **Numbers & Counting:** Count items in 1x1 to 1x10 grid (count 1..10)
2. **Numbers & Counting:** Count items in 2x5 grid (count 10..20)
3. **Numbers & Counting:** Write word name for numeral (1..10)
4. **Missing Numbers:** Simple Sequential Counting (Forward)
5. **Missing Numbers:** Backward Counting Sequence
6. **Missing Numbers:** Number Bonds (Part-Whole Relationship)
7. **Missing Numbers:** Skip Counting by 2s, 5s, or 10s
8. **Missing Numbers:** Missing Addend (a + [?] = c)
9. **Missing Numbers:** Missing Subtrahend (c - [?] = a)
10. **Missing Numbers:** Missing Minuend ([?] - b = a)
11. **Missing Numbers:** Missing Addend ([?] + b = c)
12. **Missing Numbers:** Place Value Missing Numbers
13. **Missing Numbers:** Word-Based / Language Comparison
14. **Missing Numbers:** Balance Equations (Two-Step Evaluation)
15. **Addition & Subtraction:** Basic single-digit addition: a + b (Sum <= 10)
16. **Addition & Subtraction:** Addition with carrying under 20
17. **Addition & Subtraction:** Subtraction within 10: a - b
18. **Addition & Subtraction:** Subtraction within 20 with borrowing
19. **Multiplication & Division:** Repeated addition array matching
20. **Multiplication & Division:** Sharing equally

---

## Proposed Changes

### Setup & Infrastructure

#### [NEW] [math local v2 Directory Setup](file:///c:/Coding/math%20local%20v2)
- Copy index.html, package.json, configs, and visual components from version 1 to version 2.
- Run `npm install` to prepare dependencies.

### Core Compiler & Database

#### [NEW] [curriculumDB.json](file:///c:/Coding/math%20local%20v2/src/data/curriculumDB.json)
- Set up Year 1 topics structure supporting both single `template` and `templates` arrays.

#### [NEW] [curriculumEvaluator.ts](file:///c:/Coding/math%20local%20v2/src/utils/curriculumEvaluator.ts)
- Upgraded evaluator supporting `templates` array selection, variable evaluation, and choice scrambling.

#### [NEW] [mathEngine.ts](file:///c:/Coding/math%20local%20v2/src/utils/mathEngine.ts)
- Delegation wrapper directing question generation requests to the compiler.

### Developer Sandbox UI

#### [NEW] [App.tsx](file:///c:/Coding/math%20local%20v2/src/App.tsx) & [CurriculumSandbox.tsx](file:///c:/Coding/math%20local%20v2/src/components/CurriculumSandbox.tsx)
- Port and extend sandbox UI to host the **Curriculum Inspector & Editor** dashboard alongside the 3-Pass Audit report suite.

---

## Verification Plan
- Build check: `tsc -b && vite build`.
- Playcheck: Open the sandbox, inspect Year 1 topics, select any subtype, compile 10 random questions, and verify that all variations generate without error.
