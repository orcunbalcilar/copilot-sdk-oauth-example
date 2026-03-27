/**
 * RestFlow Scenario JSON Schema — Core Properties
 */

import { assertionDefs, authConfigDefs } from "./schema-defs"

export const restflowScenarioJsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "RestFlow Scenario",
  description: "A RestFlow API test scenario definition",
  type: "object",
  required: ["name", "steps"],
  additionalProperties: false,
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 200,
      description: "Scenario name — a short human-readable label",
    },
    defaultHeaders: {
      type: "array",
      description: "Headers applied to every HTTP step in this scenario",
      items: { $ref: "#/$defs/header" },
    },
    stopOnFailure: {
      type: "boolean",
      default: true,
      description:
        "Stop executing remaining steps when any assertion fails",
    },
    steps: {
      type: "array",
      minItems: 1,
      description: "Ordered list of scenario steps (setup or HTTP)",
      items: {
        oneOf: [
          { $ref: "#/$defs/httpStep" },
          { $ref: "#/$defs/setupStep" },
        ],
      },
    },
  },
  $defs: {
    header: {
      type: "object",
      required: ["name", "value"],
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          minLength: 1,
          description: "Header name (e.g. Content-Type, Authorization)",
        },
        value: {
          type: "string",
          description:
            "Header value. Supports Handlebars templates: {{variableName}}",
        },
      },
    },
    httpStep: {
      type: "object",
      required: ["http"],
      additionalProperties: false,
      properties: {
        http: {
          type: "object",
          required: ["name", "method", "url"],
          additionalProperties: false,
          properties: {
            name: {
              type: "string",
              minLength: 1,
              description: "Step description",
            },
            method: {
              type: "string",
              enum: [
                "get",
                "post",
                "put",
                "patch",
                "delete",
                "head",
                "options",
              ],
              description: "HTTP method",
            },
            url: {
              type: "string",
              description:
                "Full request URL. Supports Handlebars: {{baseUrl}}/users/{{id}}",
            },
            body: {
              type: "string",
              description: "Request body (JSON string)",
            },
            headers: {
              type: "array",
              description: "Step-specific headers",
              items: { $ref: "#/$defs/header" },
            },
            assertions: {
              type: "array",
              description: "Assertions to validate the HTTP response",
              items: { $ref: "#/$defs/assertion" },
            },
            auth: { $ref: "#/$defs/authConfig" },
            retryTimes: {
              type: "integer",
              minimum: 0,
              maximum: 10,
              description: "Number of retry attempts on failure (0-10)",
            },
            retryDelaySeconds: {
              type: "integer",
              minimum: 1,
              description: "Delay in seconds between retries",
            },
            timeoutSeconds: {
              type: "integer",
              minimum: 1,
              maximum: 300,
              description: "HTTP request timeout in seconds (1-300)",
            },
          },
        },
      },
    },
    setupStep: {
      type: "object",
      required: ["setup"],
      additionalProperties: false,
      properties: {
        setup: {
          type: "object",
          required: ["name"],
          additionalProperties: false,
          properties: {
            name: {
              type: "string",
              minLength: 1,
              description: "Setup step name",
            },
            contextValues: {
              type: "object",
              description:
                "Key-value pairs to store in the scenario context",
              additionalProperties: true,
            },
          },
        },
      },
    },
    assertion: assertionDefs,
    authConfig: authConfigDefs,
  },
} as const
