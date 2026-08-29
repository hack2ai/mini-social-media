# Verification Evidence

This directory contains concise, reproducible verification documentation for the Mini Social Media platform.

## Evidence policy

Only sanitized, project-relevant evidence should be committed. Never include `.env` files, JWT secrets, API keys, session tokens, private user data, production database exports, or sensitive third-party credentials.

## Recommended evidence

- Jest test output
- CI workflow results
- API smoke-test output
- screenshots of login/registration and core social flows
- screenshots of security headers and protected-route behavior
- sanitized API response examples

## Current baseline

The repository includes Jest/Supertest tests and an automated GitHub Actions workflow that runs the test suite for relevant changes. The exact pass/fail result should be recorded here only after the current workflow run has been observed.

See [`verified-results.md`](verified-results.md) for the verification matrix.