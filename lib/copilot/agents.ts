/**
 * Custom Agent Definitions for Copilot SDK
 *
 * Four core agents aligned with POC features.
 * Agents are automatically selected by intent matching (infer: true).
 */

import type { CustomAgentConfig } from "@github/copilot-sdk"

export const initAgent: CustomAgentConfig = {
  name: "init-agent",
  description:
    "Initialize API testing: fetch URLs, analyze specs, create initial scenarios",
  tools: [
    "fetchUrl",
    "createPlan",
    "restflow_get_schema",
    "restflow_create_scenario",
    "restflow_run_scenario",
    "restflow_list_scenarios",
  ],
  infer: true,
  prompt: `You initialize RestFlow projects. Steps:
1. Fetch and analyze API specs from user-provided URLs
2. Create a test plan, then generate initial scenarios
3. Run validation to confirm scenarios work`,
}

export const fixAgent: CustomAgentConfig = {
  name: "fix-agent",
  description:
    "Debug and fix failing test scenarios by analyzing execution results and updating assertions",
  tools: [
    "restflow_run_scenario",
    "restflow_debug_scenario",
    "restflow_get_scenario",
    "restflow_get_execution_result",
    "restflow_get_step_result",
    "restflow_update_scenario",
  ],
  infer: true,
  prompt: `You fix failing scenarios. Steps:
1. Run the failing scenario to reproduce
2. Use debug_scenario to analyze the failure
3. Inspect step-level results for root cause
4. Update the scenario to fix assertions or request data
5. Re-run to verify the fix`,
}

export const createAgent: CustomAgentConfig = {
  name: "create-agent",
  description:
    "Create new API test scenarios from user descriptions or API documentation",
  tools: [
    "fetchUrl",
    "createPlan",
    "restflow_get_schema",
    "restflow_create_scenario",
    "restflow_run_scenario",
    "restflow_list_scenarios",
  ],
  infer: true,
  prompt: `You create new test scenarios. Steps:
1. Understand the API endpoint(s) the user wants to test
2. Get the schema format with restflow_get_schema
3. Create the scenario with proper assertions
4. Run it to validate it works`,
}

export const updateAgent: CustomAgentConfig = {
  name: "update-agent",
  description:
    "Modify existing test scenarios: change assertions, update URLs, add steps, or refactor",
  tools: [
    "restflow_get_scenario",
    "restflow_get_scenario_step",
    "restflow_update_scenario",
    "restflow_run_scenario",
    "restflow_get_execution_result",
  ],
  infer: true,
  prompt: `You update existing scenarios. Steps:
1. Fetch the current scenario to understand its structure
2. Apply the requested changes
3. Run the updated scenario to verify it still passes`,
}

export const customAgents: CustomAgentConfig[] = [
  initAgent,
  fixAgent,
  createAgent,
  updateAgent,
]
