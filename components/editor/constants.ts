/**
 * Editor Constants
 *
 * Selectable values, completions data, and shared constants
 * for the RestFlow schema editor.
 */

export const HTTP_STATUS_CODES = [
  { code: 200, label: "OK", category: "Success" },
  { code: 201, label: "Created", category: "Success" },
  { code: 202, label: "Accepted", category: "Success" },
  { code: 204, label: "No Content", category: "Success" },
  { code: 301, label: "Moved Permanently", category: "Redirect" },
  { code: 302, label: "Found", category: "Redirect" },
  { code: 304, label: "Not Modified", category: "Redirect" },
  { code: 400, label: "Bad Request", category: "Client Error" },
  { code: 401, label: "Unauthorized", category: "Client Error" },
  { code: 403, label: "Forbidden", category: "Client Error" },
  { code: 404, label: "Not Found", category: "Client Error" },
  { code: 405, label: "Method Not Allowed", category: "Client Error" },
  { code: 409, label: "Conflict", category: "Client Error" },
  { code: 415, label: "Unsupported Media Type", category: "Client Error" },
  { code: 422, label: "Unprocessable Entity", category: "Client Error" },
  { code: 429, label: "Too Many Requests", category: "Client Error" },
  { code: 500, label: "Internal Server Error", category: "Server Error" },
  { code: 502, label: "Bad Gateway", category: "Server Error" },
  { code: 503, label: "Service Unavailable", category: "Server Error" },
  { code: 504, label: "Gateway Timeout", category: "Server Error" },
] as const

export const COMMON_REQUEST_HEADERS = [
  "Accept",
  "Authorization",
  "Cache-Control",
  "Content-Type",
  "Cookie",
  "If-Match",
  "If-None-Match",
  "If-Modified-Since",
  "Origin",
  "Referer",
  "User-Agent",
  "X-Request-Id",
  "X-Correlation-Id",
  "X-Forwarded-For",
  "X-Api-Key",
  "Idempotency-Key",
  "X-Rate-Limit",
  "X-Tenant-Id",
  "X-Session-Id",
  "X-Trace-Id",
] as const

export const CONTENT_TYPES = [
  "application/json",
  "application/xml",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
  "text/html",
  "text/xml",
  "application/octet-stream",
  "application/pdf",
  "application/graphql",
] as const

export const AUTH_PREFIXES = [
  { label: "Bearer Token", insertText: "Bearer {{token}}" },
  { label: "Basic Auth", insertText: "Basic {{credentials}}" },
  { label: "API Key", insertText: "ApiKey {{apiKey}}" },
] as const

export const HANDLEBARS_HELPERS = [
  { name: "uuid", insertText: "{{uuid}}", documentation: "Generates a random UUID v4" },
  { name: "now", insertText: "{{now format='yyyy-MM-dd'}}", documentation: "Current timestamp with configurable format" },
  { name: "now (with offset)", insertText: "{{now format='yyyy-MM-dd' offset='+1d'}}", documentation: "Timestamp with time offset (e.g. +1d, -2h, +30m)" },
  { name: "randomValue", insertText: "{{randomValue length=8 type='ALPHANUMERIC'}}", documentation: "Random string (types: ALPHANUMERIC, NUMERIC, ALPHABETIC, UUID)" },
  { name: "randomInt", insertText: "{{randomInt min=1 max=100}}", documentation: "Random integer in range" },
  { name: "randomDecimal", insertText: "{{randomDecimal min=0 max=100}}", documentation: "Random decimal in range" },
  { name: "jsonPath", insertText: "{{jsonPath 'stepName' '$.path'}}", documentation: "Extract value from a previous step's response body" },
  { name: "xPath", insertText: "{{xPath 'stepName' '/root/path'}}", documentation: "Extract XML value from a previous step's response" },
  { name: "capitalize", insertText: "{{capitalize variableName}}", documentation: "Capitalize string" },
  { name: "upper", insertText: "{{upper variableName}}", documentation: "Uppercase string" },
  { name: "lower", insertText: "{{lower variableName}}", documentation: "Lowercase string" },
] as const

export const ASSERTION_SNIPPETS = {
  status: [
    { label: "Status Code Check", insertText: '{ "type": "statusCode", "value": 200 }' },
    { label: "Status Code In", insertText: '{ "type": "statusCodeIn", "values": [200, 201] }' },
    { label: "Success (2xx)", insertText: '{ "type": "success" }' },
  ],
  body: [
    { label: "Body Contains", insertText: '{ "type": "bodyContains", "value": "expected text" }' },
    { label: "Body Equals", insertText: '{ "type": "bodyEquals", "value": "exact body" }' },
    { label: "Body Not Empty", insertText: '{ "type": "bodyNotEmpty" }' },
  ],
  jsonPath: [
    { label: "JSON Path Value", insertText: '{ "type": "jsonPath", "path": "$.field", "value": "expected" }' },
    { label: "JSON Path Exists", insertText: '{ "type": "jsonPathExists", "path": "$.field" }' },
    { label: "JSON Path Not Exists", insertText: '{ "type": "jsonPathNotExists", "path": "$.field" }' },
    { label: "JSON Array Size", insertText: '{ "type": "jsonArraySize", "path": "$.items", "value": 5 }' },
  ],
  header: [
    { label: "Header Exists", insertText: '{ "type": "hasHeader", "path": "X-Request-Id" }' },
    { label: "Header Equals", insertText: '{ "type": "headerEquals", "path": "Content-Type", "value": "application/json" }' },
    { label: "Header Contains", insertText: '{ "type": "headerContains", "path": "Content-Type", "value": "json" }' },
  ],
  performance: [
    { label: "Response Time Max", insertText: '{ "type": "responseTimeMax", "value": 500 }' },
  ],
  xml: [
    { label: "XPath Value", insertText: '{ "type": "xmlPath", "path": "/root/field", "value": "expected" }' },
    { label: "XPath Exists", insertText: '{ "type": "xmlPathExists", "path": "/root/field" }' },
  ],
} as const

export const STEP_SCAFFOLDS = [
  { label: "HTTP GET Step", insertText: '{ "http": { "name": "Get resource", "method": "get", "url": "https://", "assertions": [{ "type": "statusCode", "value": 200 }] } }' },
  { label: "HTTP POST Step", insertText: '{ "http": { "name": "Create resource", "method": "post", "url": "https://", "body": "{}", "headers": [{ "name": "Content-Type", "value": "application/json" }], "assertions": [{ "type": "statusCode", "value": 201 }] } }' },
  { label: "HTTP PUT Step", insertText: '{ "http": { "name": "Update resource", "method": "put", "url": "https://", "body": "{}", "headers": [{ "name": "Content-Type", "value": "application/json" }], "assertions": [{ "type": "statusCode", "value": 200 }] } }' },
  { label: "HTTP DELETE Step", insertText: '{ "http": { "name": "Delete resource", "method": "delete", "url": "https://", "assertions": [{ "type": "statusCode", "value": 204 }] } }' },
  { label: "Setup Step", insertText: '{ "setup": { "name": "Initialize context", "contextValues": { "baseUrl": "https://api.example.com" } } }' },
  { label: "Auth Step (Basic)", insertText: '{ "http": { "name": "Authenticated request", "method": "get", "url": "https://", "auth": { "type": "basic", "username": "", "password": "" }, "assertions": [{ "type": "statusCode", "value": 200 }] } }' },
  { label: "Auth Step (OAuth2)", insertText: '{ "http": { "name": "OAuth2 request", "method": "get", "url": "https://", "auth": { "type": "oauth2", "tokenUrl": "", "clientId": "", "clientSecret": "", "scope": "" }, "assertions": [{ "type": "statusCode", "value": 200 }] } }' },
] as const

export const EDITOR_DEFAULTS = {
  height: 400,
  minHeight: 200,
  maxHeight: 800,
  bodyCollapseThreshold: 5,
  validationDebounceMs: 300,
  languageDetectionDebounceMs: 500,
} as const

export const METHOD_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  get: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
  post: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30" },
  put: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30" },
  patch: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/30" },
  delete: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" },
  head: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30" },
  options: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/30" },
}
