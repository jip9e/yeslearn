# Model Routing Lessons (YesLearn) — 2026-02-11

## What happened
Early in this project round, some tasks were delegated to lower-priority model choices (e.g., Sonnet 4.5 / Gemini 2.5 Pro) for speed.
Abdo explicitly corrected this and requested premium routing based on task type.

## User preference (must follow)
Use this routing by default for this project:

1. **Claude Opus 4.6**
   - Best for deep UX critique, product judgment, spec quality, consistency review, trust/copy decisions.

2. **Gemini 3 Pro**
   - Best for strict audits/checklists, a11y/visual QA sweeps, cross-page consistency analysis.

3. **GPT-5.3 Codex**
   - Best for direct implementation/refactors/code edits and technical execution.

## Mistake to avoid next time
- Do **not** default to cheaper/faster model lanes for high-stakes review tasks when premium models are available and explicitly preferred by Abdo.

## Practical orchestration rule
Before parallel work starts, map each job to model by function:
- Spec/strategy/quality judgment → Opus 4.6
- Audit/checklist/compliance sweep → Gemini 3 Pro
- Code change implementation → GPT-5.3 Codex

## Confirmation style
When routing tasks, explicitly tell Abdo which model handles what and why (briefly).

## Current confidence
This routing was applied later in the session and worked well; continue using it as baseline for future YesLearn work.