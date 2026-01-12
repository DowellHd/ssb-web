# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously at Smart Strategies Builder.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@[your-domain].com**

Include the following information:

1. **Description** — Clear description of the vulnerability
2. **Steps to reproduce** — Detailed steps to reproduce the issue
3. **Impact assessment** — Your assessment of the potential impact
4. **Affected components** — Which parts of the application are affected
5. **Suggested fix** — If you have a suggestion for how to fix the issue

### What to Expect

- **Acknowledgment:** We will acknowledge receipt within 48 hours
- **Initial assessment:** We will provide an initial assessment within 7 days
- **Resolution timeline:** Critical issues will be prioritized for immediate fix
- **Credit:** We will credit you (if desired) when the vulnerability is disclosed

### Scope

The following are in scope:
- Authentication and authorization bypass
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Injection vulnerabilities
- Sensitive data exposure
- Security misconfiguration

The following are out of scope:
- Denial of service attacks
- Social engineering
- Physical attacks
- Issues in demo mode (demo mode uses fake data by design)

## Security Best Practices for Users

1. **Environment variables:** Never commit `.env` files with real credentials
2. **Demo mode:** Demo mode should only be used for demonstrations, not production
3. **API keys:** Keep API keys secure and rotate them regularly
4. **Dependencies:** Regularly update dependencies to patch known vulnerabilities

## Security Features

### Frontend Security
- Content Security Policy (CSP) headers recommended
- XSS protection via React's default escaping
- CSRF protection when connecting to backend
- Secure cookie handling

### Authentication (via Backend)
- JWT-based authentication
- MFA/TOTP support
- Secure password hashing (Argon2id)
- Session management

## Acknowledgments

We thank the security research community for helping keep SSB secure.
