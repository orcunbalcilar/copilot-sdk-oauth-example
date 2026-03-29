# Must Read Rules for Agents

<!-- BEGIN:coding-rules -->

## Coding: ALWAYS read relevant docs and code before coding

Your training data is outdated, you must always read the relevant documentation and code before making any code changes. Ensure that your changes are in line with the library/framework's best practices.

Code review is an important part of the development process. When you consider your work must be reviewed, use claude-opus-4.6 subagent(s) for review. Subagents MUST also follow all rules in this file — pass them the relevant rules explicitly.

<!-- END:coding-rules -->

<!-- BEGIN:copilot-sdk-agent-rules -->

## Copilot SDK: ALWAYS read docs before coding

Before any Copilot SDK work, find and read the relevant doc from the url `https://github.com/github/copilot-sdk/blob/main/docs/index.md`. Find the relevant section for your task and read it carefully. The docs are the source of truth for the SDK. Your training data knows nothing about copilot sdk.

<!-- END:copilot-sdk-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ui-testing-agent-rules -->

## UI Testing: MUST run for ANY change that affects the UI

This is NOT optional. Do NOT skip this. Do NOT defer this to the user.

If your change affects the UI (components, pages, styles, animations, layout), you MUST:

1. Read the `agent-browser` skill file FIRST
2. Connect to the running browser: `agent-browser --auto-connect snapshot -i`
3. Navigate to EVERY page you changed and visually verify each change
4. If you find ANY issues, fix them BEFORE moving on
5. Screenshot each verified page as evidence

Prerequisite: The user must have remote debugging enabled in their browser. If `agent-browser --auto-connect` fails, ask the user to enable it.

If authentication is required to test dashboard pages and browser automation cannot authenticate, ask the user to sign in via the browser WITHOUT interrupting the current turn. Continue with other work while waiting, and re-check after the user confirms sign-in.

Do NOT say "build passes" or "looks correct" without actually opening the browser and checking.

<!-- END:ui-testing-agent-rules -->

<!-- BEGIN:skills-agent-rules -->

## Skills: MUST read the relevant skills BEFORE starting work

This is NOT optional. Do NOT skip this. Skills contain critical domain knowledge.

Before starting ANY task, identify and read the relevant skill files from `~/.agents/skills/`. Examples:

- React/UI components → read `vercel-react-best-practices`, `frontend-design`, `web-design-guidelines`
- Browser testing → read `agent-browser`
- Library docs → read `context7`
- shadcn components → read `shadcn`

Subagents MUST also read the relevant skills. Pass skill file paths to subagents explicitly.

<!-- END:skills-agent-rules -->

<!-- BEGIN:up-to-date-code-agent-rules -->

## Up-to-date Code Docs For Any Prompt

Do NOT rely on training data for library APIs. Use the `context7` skill to fetch current docs

## Code References For Any Prompt

Source code is the single source of truth for how the system works. Always find and read the relevant code for your task to learn.

<!-- END:up-to-date-code-docs-agent-rules -->

## Rules

- Always use official docs and source codes of any library/framework to understand their behavior. Use **CONTEXT7** tools/skill.
- Any file bigger than 250 lines of code is a code smell. Refactor it into smaller files. This applies to both source and test files.
- Always work by using the unlimited Claude Opus 4.6 subagents.
- You are responsible for the ENTIRE project, not just your changes. "Not related to my changes" is NOT acceptable. If you see issues, fix them.
- Always run `codacy cli analysis` after edits. If issues are found, fix them.

<!-- END:project-rules -->
