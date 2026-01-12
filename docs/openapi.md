# OpenAPI Specification

## Overview

The Smart Strategies Builder API follows the OpenAPI 3.0 specification. The specification file is automatically generated from the FastAPI backend.

## Viewing the Specification

### Option 1: Swagger UI (Recommended)

If you have access to the running backend:

```
http://localhost:8000/docs
```

This provides an interactive interface to explore and test API endpoints.

### Option 2: ReDoc

Alternative documentation UI:

```
http://localhost:8000/redoc
```

### Option 3: Local File

The OpenAPI specification is available as a JSON file:

```
docs/openapi.json
```

You can view this in any OpenAPI-compatible tool:

- [Swagger Editor](https://editor.swagger.io/)
- [Stoplight Studio](https://stoplight.io/studio)
- VS Code with OpenAPI extension

## Specification File

The `openapi.json` file in this repository is a sanitized export from the backend. It contains:

- All endpoint definitions
- Request/response schemas
- Authentication requirements
- Error response formats

**Note:** The file does not contain:
- Server URLs (configure in your environment)
- Authentication tokens or keys
- Internal implementation details

## Regenerating the Specification

If you have access to the backend repository (`ssb-api`), you can regenerate the OpenAPI spec:

```bash
cd ssb-api
make openapi
```

This will create a fresh `openapi.json` file.

## API Authentication

Most endpoints require authentication via JWT bearer token:

```
Authorization: Bearer <your-jwt-token>
```

Obtain a token via the `/api/v1/auth/login` endpoint.

## Rate Limiting

The API implements rate limiting:

| Tier | Requests/Minute |
|------|-----------------|
| Free | 60 |
| Starter | 120 |
| Pro | 300 |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "detail": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## API Versioning

The API uses URL path versioning:

```
/api/v1/...
```

Breaking changes will increment the version number. Deprecated endpoints will be announced with a minimum 6-month migration window.
