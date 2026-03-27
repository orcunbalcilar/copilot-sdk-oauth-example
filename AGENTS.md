# Must Read Rules for Agents

<!-- BEGIN:nextjs-agent-rules -->

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:copilot-sdk-agent-rules -->

## Copilot SDK: ALWAYS read docs before coding

Before any Copilot SDK work, find and read the relevant doc from the url `https://github.com/github/copilot-sdk/blob/main/docs/index.md`. Find the relevant section for your task and read it carefully. The docs are the source of truth for the SDK. Your training data knows nothing about copilot sdk.

<!-- END:copilot-sdk-agent-rules -->

<!-- BEGIN:ui-testing-agent-rules -->

## UI Testing: MUST be done for changes that affect the UI

Don't expect the prompt to ask you to do UI testing for your changes. If your change affects the UI, follow these steps:

1. Use chrome devtools to run the regression tests by using the open browser (Prequisite: user has to activate the open browser for remote debugging in the settings, if not activated, ask him to do it)
2. Verify the change works as expected and doesn't break anything else in the UI
3. If you find any issues, fix them before submitting the change
4. If everything looks good, create a playwright test that does your manual testing steps

<!-- END:ui-testing-agent-rules -->

<!-- BEGIN:skills-agent-rules -->

## Skills: ALWAYS read the relevant skills for your task

Don't expect the prompt to ask you to read the relevant skills. You have the skills. Always read the relevant skills for your task.

For example:

- React components: read the vercel react best practices, frontend-design, web-design-guidelines

<!-- BEGIN:skills-agent-rules -->

<!-- BEGIN:up-to-date-code-agent-rules -->

## Up-to-date Code Docs For Any Prompt

Don't expect the prompt to ask you to read the relevant code docs. Always read the relevant code docs for your task. The code is the source of truth, not your training data. Use the **CONTEXT7** tools/skill to find the relevant code docs for your task and read them carefully.

## Code References For Any Prompt

Source code is the single source of truth for how the system works. Always find and read the relevant code for your task to learn.

<!-- END:up-to-date-code-docs-agent-rules -->

## Rules

- Always use official docs and source codes of any library/framework to understand their behavior. Use **CONTEXT7** tools/skill.
- Any file bigger than 250 lines of code is a code smell. Refactor it into smaller files. This applies to both source and test files.
- Always work by using the unlimited Claude Opus 4.6 subagents.
- Always be responsible for the project and its code quality, use codacy cli analysis. "None of these are caused by my changes."/"not related to my changes" are not acceptable answers. If you see any issues, fix them.

<!-- END:project-rules -->
