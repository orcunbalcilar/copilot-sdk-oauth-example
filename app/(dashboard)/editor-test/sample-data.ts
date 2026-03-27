/**
 * Sample scenario JSON for the editor playground.
 */

export const SAMPLE_SCENARIO = JSON.stringify(
  {
    name: "User CRUD Flow",
    stopOnFailure: true,
    defaultHeaders: [
      { name: "Content-Type", value: "application/json" },
      { name: "Accept", value: "application/json" },
    ],
    steps: [
      {
        setup: {
          name: "Initialize context",
          contextValues: {
            baseUrl: "https://api.example.com/v1",
            adminToken: "Bearer test-token-123",
          },
        },
      },
      {
        http: {
          name: "Create user",
          method: "post",
          url: "{{baseUrl}}/users",
          headers: [
            { name: "Authorization", value: "{{adminToken}}" },
          ],
          body: '{"name":"Jane Doe","email":"jane@example.com"}',
          assertions: [
            { type: "statusCode", value: 201 },
            { type: "jsonPathExists", path: "$.id" },
            { type: "jsonPath", path: "$.name", value: "Jane Doe" },
          ],
        },
      },
      {
        http: {
          name: "Get created user",
          method: "get",
          url: "{{baseUrl}}/users/{{jsonPath 'Create user' '$.id'}}",
          headers: [
            { name: "Authorization", value: "{{adminToken}}" },
          ],
          assertions: [
            { type: "statusCode", value: 200 },
            { type: "jsonPath", path: "$.email", value: "jane@example.com" },
            { type: "responseTimeMax", value: 500 },
          ],
        },
      },
      {
        http: {
          name: "Delete user",
          method: "delete",
          url: "{{baseUrl}}/users/{{jsonPath 'Create user' '$.id'}}",
          headers: [
            { name: "Authorization", value: "{{adminToken}}" },
          ],
          assertions: [{ type: "statusCode", value: 204 }],
        },
      },
    ],
  },
  null,
  2,
)

export const SAMPLE_SCENARIO_MODIFIED = JSON.stringify(
  {
    name: "User CRUD Flow",
    stopOnFailure: true,
    defaultHeaders: [
      { name: "Content-Type", value: "application/json" },
      { name: "Accept", value: "application/json" },
      { name: "X-Request-Id", value: "{{uuid}}" },
    ],
    steps: [
      {
        setup: {
          name: "Initialize context",
          contextValues: {
            baseUrl: "https://api.staging.example.com/v2",
            adminToken: "Bearer staging-token-456",
          },
        },
      },
      {
        http: {
          name: "Create user",
          method: "post",
          url: "{{baseUrl}}/users",
          headers: [
            { name: "Authorization", value: "{{adminToken}}" },
          ],
          body: '{"name":"Jane Doe","email":"jane@example.com","role":"admin"}',
          assertions: [
            { type: "statusCode", value: 201 },
            { type: "jsonPathExists", path: "$.id" },
            { type: "jsonPath", path: "$.name", value: "Jane Doe" },
            { type: "jsonPath", path: "$.role", value: "admin" },
          ],
        },
      },
      {
        http: {
          name: "Get created user",
          method: "get",
          url: "{{baseUrl}}/users/{{jsonPath 'Create user' '$.id'}}",
          headers: [
            { name: "Authorization", value: "{{adminToken}}" },
          ],
          assertions: [
            { type: "statusCode", value: 200 },
            { type: "jsonPath", path: "$.email", value: "jane@example.com" },
            { type: "responseTimeMax", value: 300 },
          ],
        },
      },
      {
        http: {
          name: "Update user role",
          method: "put",
          url: "{{baseUrl}}/users/{{jsonPath 'Create user' '$.id'}}",
          headers: [
            { name: "Authorization", value: "{{adminToken}}" },
          ],
          body: '{"role":"superadmin"}',
          assertions: [
            { type: "statusCode", value: 200 },
            { type: "jsonPath", path: "$.role", value: "superadmin" },
          ],
        },
      },
      {
        http: {
          name: "Delete user",
          method: "delete",
          url: "{{baseUrl}}/users/{{jsonPath 'Create user' '$.id'}}",
          headers: [
            { name: "Authorization", value: "{{adminToken}}" },
          ],
          assertions: [{ type: "statusCode", value: 204 }],
        },
      },
    ],
  },
  null,
  2,
)
