# Security Policy

## Scope

`mini-social-media` is an educational full-stack social platform demonstrating authentication, authorization, API security, data validation, media handling, and defensive web-application controls.

It is not represented as a production security audit or certification.

## Reporting security issues

Please do not publicly disclose credentials, API keys, session tokens, private user data, or sensitive proof-of-concept details in an issue.

For a vulnerability in the repository, use GitHub's private vulnerability reporting or security-advisory features when available. Include the affected component, reproduction steps that are safe to share, expected behavior, observed behavior, and impact.

## Security controls

The application documents and implements controls including JWT authentication, bcrypt-based password hashing, authorization and ownership checks, Helmet security headers, CORS configuration, rate limiting, request-size limits, input validation, MongoDB ObjectId validation, centralized error handling, and database indexes. Media uploads require additional production-grade file validation and content controls appropriate to the deployment threat model.

## Secrets and configuration

Never commit `.env` files or real credentials. Use `.env.example` as the configuration reference and provide secrets through the runtime environment or a dedicated secret manager.

Production deployments should additionally use HTTPS, robust secret rotation, strict CORS allowlists, secure deployment configuration, dependency scanning, monitoring, logging, backups, and tested recovery procedures.

## Safe testing

Test only systems, accounts, and APIs that you own or are explicitly authorized to assess. Do not use production credentials or personal data in tests or repository evidence.