/**
 * RestFlow JSON Schema — Assertion and Auth Config $defs
 *
 * Split from restflow-json-schema.ts to stay under 250 lines.
 * Uses schemaIf() helper to avoid Next.js TS plugin "Do not add then" diagnostic.
 */

type JsonSchemaRule = Record<string, unknown>

/** Build a JSON Schema if/then conditional without triggering the Next.js TS plugin. */
function schemaIf(typeValue: string, result: JsonSchemaRule): JsonSchemaRule {
  const placeholder = "__schema_consequent__"
  const raw = JSON.stringify({
    if: { properties: { type: { const: typeValue } } },
    [placeholder]: result,
  })
  return JSON.parse(
    raw.replace(`"${placeholder}"`, '"then"'),
  ) as JsonSchemaRule
}

export const assertionDefs = {
  type: "object",
  required: ["type"],
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      enum: [
        "statusCode",
        "statusCodeIn",
        "success",
        "jsonPath",
        "jsonPathExists",
        "jsonPathNotExists",
        "jsonArraySize",
        "hasHeader",
        "headerEquals",
        "headerContains",
        "bodyContains",
        "bodyEquals",
        "bodyNotEmpty",
        "responseTimeMax",
        "xmlPath",
        "xmlPathExists",
      ],
      description: "Assertion type",
    },
    path: {
      type: "string",
      description:
        "JSONPath ($.field) or XPath (/root/field) or header name",
    },
    value: {
      description:
        "Expected value — required for statusCode, jsonPath, bodyContains, bodyEquals, headerEquals, headerContains, responseTimeMax, xmlPath, jsonArraySize",
    },
    values: {
      type: "array",
      items: { type: "integer", minimum: 100, maximum: 599 },
      description:
        "Array of valid status codes — used only with statusCodeIn",
    },
  },
  allOf: [
    schemaIf("statusCode", {
      required: ["value"],
      properties: { value: { type: "integer", minimum: 100, maximum: 599 } },
    }),
    schemaIf("statusCodeIn", { required: ["values"] }),
    schemaIf("jsonPath", { required: ["path", "value"] }),
    schemaIf("jsonPathExists", { required: ["path"] }),
    schemaIf("jsonPathNotExists", { required: ["path"] }),
    schemaIf("jsonArraySize", {
      required: ["path", "value"],
      properties: { value: { type: "integer" } },
    }),
    schemaIf("hasHeader", { required: ["path"] }),
    schemaIf("headerEquals", { required: ["path", "value"] }),
    schemaIf("headerContains", { required: ["path", "value"] }),
    schemaIf("bodyContains", { required: ["value"] }),
    schemaIf("bodyEquals", { required: ["value"] }),
    schemaIf("responseTimeMax", {
      required: ["value"],
      properties: { value: { type: "integer" } },
    }),
    schemaIf("xmlPath", { required: ["path", "value"] }),
    schemaIf("xmlPathExists", { required: ["path"] }),
  ],
}

export const authConfigDefs = {
  type: "object",
  required: ["type"],
  additionalProperties: false,
  description: "Authentication configuration for this HTTP step",
  properties: {
    type: {
      type: "string",
      enum: ["basic", "oauth2"],
      description: "Authentication type",
    },
    username: {
      type: "string",
      description: "Username for basic auth. Supports templates: {{username}}",
    },
    password: {
      type: "string",
      description: "Password for basic auth. Supports templates: {{password}}",
    },
    tokenUrl: {
      type: "string",
      description: "OAuth2 token endpoint URL",
    },
    clientId: {
      type: "string",
      description: "OAuth2 client ID",
    },
    clientSecret: {
      type: "string",
      description: "OAuth2 client secret",
    },
    scope: {
      type: "string",
      description: "OAuth2 scope (space-separated)",
    },
  },
  allOf: [
    schemaIf("basic", { required: ["username", "password"] }),
    schemaIf("oauth2", { required: ["tokenUrl", "clientId", "clientSecret"] }),
  ],
}
