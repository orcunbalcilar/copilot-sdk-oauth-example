/**
 * Shared constants for Copilot SDK integration.
 */

/** MCP tools that are read-only and can be auto-approved without user confirmation. */
export const READ_ONLY_MCP_TOOLS = new Set([
  "restflow_get_schema",
  "restflow_get_scenario",
  "restflow_list_scenarios",
  "restflow_get_scenario_step",
  "restflow_get_execution_result",
  "restflow_get_step_result",
  "restflow_get_scenario_version_diff",
]);

/** MCP tools that modify state and require explicit user approval. */
export const WRITE_MCP_TOOLS = new Set([
  "restflow_create_scenario",
  "restflow_update_scenario",
  "restflow_delete_scenario",
  "restflow_run_scenario",
  "restflow_run_scenario_suite",
  "restflow_generate_code",
]);
