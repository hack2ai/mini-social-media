# Mini Social Media

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)
[![CI](https://github.com/hack2ai/mini-social-media/actions/workflows/ci.yml/badge.svg)](https://github.com/hack2ai/mini-social-media/actions/workflows/ci.yml)

> A full-stack social platform built with Node.js, Express, MongoDB, and Vanilla JavaScript, with authentication, posts, social interactions, notifications, media uploads, and automated API testing.

## Project status

The core social-platform implementation and repository documentation are in place. GitHub Actions is configured to install dependencies with `npm ci` and execute the Jest test suite. The current CI result should be considered verified only after a workflow run for the current repository state has completed.

## Overview

Mini Social Media is a portfolio-oriented social networking application built without a frontend framework. Users can create profiles, publish posts, interact through likes and comments, follow other users, receive notifications, upload images, and browse a personalized feed.

The backend follows a REST API architecture with MongoDB/Mongoose persistence and a security-focused middleware layer.

## Key features

### Authentication

- User registration and login
- JWT-based authentication
- bcrypt password hashing
- Protected API routes
- Logout/session cleanup

### Social platform

- Create, edit, and delete posts
- Image uploads
- Like/unlike posts
- Create, edit, and delete comments
- Follow/unfollow users
- User discovery and search
- Personalized home feed

### Profiles and notifications

- User profiles and profile pictures
- Bios and follower/following counts
- Follow, like, and comment notifications
- Unread notification badge
- Mark-one / mark-all-as-read workflows
- Notification-to-resource navigation
- Paginated notification API
- Duplicate-notification prevention
- 90-day MongoDB TTL retention

### Application security

- Helmet security headers
- CORS configuration
- JWT authentication
- Rate limiting
- Request-size limits
- Input validation
- MongoDB ObjectId validation
- Authorization/ownership checks
- Centralized error handling
- MongoDB indexes

These controls are documented as application features; this repository is not represented as a formal production security audit. fileciteturn121file0

## Architecture

```text
                        Browser
                  HTML / CSS / JavaScript
                            │
                            ▼
                     Express REST API
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 Authentication       Routes / Controllers   Middleware
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                        Services
                            │
                            ▼
                         Mongoose
                            │
                            ▼
                         MongoDB
                            │
                            └──────► TTL / Indexes

                 Image Uploads
                       │
                       ▼
                   Cloudinary

                 CI pipeline
             npm ci → Jest tests
```

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Media | Cloudinary |
| Security | Helmet, CORS, express-rate-limit, express-validator |
| Testing | Jest, Supertest |
| CI | GitHub Actions |
| Development | Nodemon, Git, GitHub |

The repository's current dependency manifest includes the backend, security, testing, and development packages used by the project. fileciteturn122file0

## Project structure

```text
mini-social-media/
├── .github/
│   └── workflows/
│       └── ci.yml
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── validators/
├── utils/
├── tests/
├── scripts/
├── public/
├── views/
├── docs/
│   └── API.md
├── evidence/
│   ├── README.md
│   └── verified-results.md
├── package.json
├── package-lock.json
├── .env.example
├── SECURITY.md
├── CONTRIBUTING.md
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB
- npm
- Cloudinary account when image uploads are enabled

### 1. Clone

```bash
git clone https://github.com/hack2ai/mini-social-media.git
cd mini-social-media
```

### 2. Install dependencies

```bash
npm install
```

For reproducible CI-style installation, use `npm ci` with the committed lockfile. fileciteturn123file0

### 3. Configure environment

Create `.env` from `.env.example` and provide the required MongoDB connection, JWT secret, Cloudinary credentials, application port, and allowed frontend origin as required by the current configuration.

Never commit `.env` or real production credentials.

### 4. Start the application

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5000
```

## API

Base URL:

```text
http://localhost:5000/api
```

The REST API covers authentication, users/profiles, feed, posts, comments, follows, notifications, image uploads, and health checks.

Detailed endpoint documentation: [`docs/API.md`](docs/API.md)

## Testing

Run the complete Jest suite:

```bash
npm test
```

Run the API smoke suite:

```bash
npm test -- --runInBand tests/app.smoke.test.js
```

The repository's package manifest defines both normal and coverage-oriented Jest commands. fileciteturn122file0

## CI

GitHub Actions runs the project's Node.js test workflow for relevant changes:

```text
Checkout
   ↓
Node.js 20
   ↓
npm ci
   ↓
npm test -- --runInBand
```

The workflow intentionally uses the committed `package-lock.json` for deterministic installation.

## Evidence

See [`evidence/README.md`](evidence/README.md) and [`evidence/verified-results.md`](evidence/verified-results.md).

Evidence should be sanitized before publication. Never commit JWT secrets, API keys, session tokens, private user information, or production database exports.

## Screenshots

Recommended showcase screenshots:

- Login / registration
- Home feed
- Create post
- User profile
- User discovery
- Comments
- Notifications
- Follow system
- Test results

Do not claim screenshot evidence exists until the files are actually committed to `screenshots/` or `evidence/screenshots/`.

## Security

This project demonstrates application-level defensive controls but is **not a production security-audited service**.

For production deployment, additionally consider HTTPS, secure secret management and rotation, strict CORS allowlists, stronger authentication/recovery controls, dependency vulnerability scanning, upload content validation, centralized logging, abuse monitoring, database backup/recovery, threat modeling, and penetration testing.

See [`SECURITY.md`](SECURITY.md) for the repository security policy.

## AI-assisted development

AI tools may be used as development assistants for architecture planning, debugging, security review, testing, and documentation. Any generated changes should remain subject to human review and actual runtime verification.

## Project value

This project demonstrates practical **full-stack JavaScript engineering, REST API design, authentication, authorization, MongoDB data modeling, media handling, notification workflows, application security, and automated testing**.

## Author

**Pankaj (Tony) Kumar**  
AI Engineer • Full Stack Developer • Generative AI & RAG Specialist

[GitHub](https://github.com/hack2ai) • [LinkedIn](https://www.linkedin.com/in/pankaj-kumar-ab591a216)

## License

MIT — see [`LICENSE`](LICENSE).
