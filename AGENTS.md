# Must Read Rules for Agents

<!-- BEGIN:nextjs-agent-rules -->

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:copilot-sdk-agent-rules -->

## Copilot SDK: ALWAYS read docs before coding

Before any Copilot SDK work, read the docs from the url `https://github.com/github/copilot-sdk/blob/main/docs/index.md`. Find the relevant section for your task and read it carefully. The docs are the source of truth for the SDK. Your training data does nothing about copilot sdk.

<!-- END:copilot-sdk-agent-rules -->

<!-- BEGIN:project-rules -->

## Rules

- Always use official docs and source codes of any library/framework to understand , **USE CONTEXT7** tools/skill
- Any file bigger than 250 lines of code is a code smell. Refactor it into smaller files. This applies to both source and test files.
- Always work by using the unlimited Claude Opus 4.6 subagents.
- Always be responsible for the project and its code quality, use codacy cli analysis. "None of these are caused by my changes."/"not related to my changes" are not acceptable answers. If you see any issues, fix them.

<!-- END:project-rules -->
