# Contributing

Thank you for contributing to `mini-social-media`.

## Scope

Contributions should improve the social-platform functionality, REST API, security controls, data modeling, notification workflows, testing, documentation, or developer experience.

## Before contributing

- Never commit real credentials, JWT secrets, API keys, session tokens, `.env` files, production databases, or private user data.
- Use local/test databases and test-only credentials.
- Keep security claims limited to behavior that has actually been tested.

## Development workflow

Install the current dependencies:

```bash
npm install
```

Create a local `.env` from `.env.example` and provide the required development configuration. Never commit the real `.env` file.

Start the development server with:

```bash
npm run dev
```

## Testing

Run the full test suite:

```bash
npm test -- --runInBand
```

Run coverage when useful:

```bash
npm run test:coverage
```

GitHub Actions runs the automated Jest suite for relevant changes.

## API and security changes

For authentication, authorization, uploads, notifications, or other security-sensitive changes, explain:

- the problem or threat addressed
- the implementation change
- the tests that cover it
- any deployment or configuration assumptions

Do not weaken security controls simply to make a test pass.

## Media uploads

Changes involving uploads should preserve server-side validation and should consider file type, size, content, storage provider configuration, and access control.

## Pull requests

A pull request should include a concise summary, motivation, test results, and documentation updates when behavior or configuration changes.

## Security issues

Follow [`SECURITY.md`](SECURITY.md) for security-sensitive reports rather than publishing credentials, tokens, personal information, or detailed exploit material in public issues.