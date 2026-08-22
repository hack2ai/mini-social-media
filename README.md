# Mini Social Media

> A full-stack social platform built with Node.js, Express, MongoDB, and Vanilla JavaScript, with authentication, posts, social interactions, notifications, media uploads, and automated API smoke testing.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

## Overview

Mini Social Media is a portfolio-grade social networking application demonstrating a complete web stack without a frontend framework.

Users can create profiles, publish posts, interact through likes and comments, follow other users, receive notifications, upload images, and browse a personalized feed.

The backend uses a REST API architecture with MongoDB/Mongoose persistence and a security-focused middleware layer.

## Key Features

### Authentication

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Logout/session cleanup

### Social Platform

- Create, edit, and delete posts
- Image uploads
- Like/unlike posts
- Create, edit, and delete comments
- Follow/unfollow users
- User discovery and search
- Personalized home feed

### Profiles & Notifications

- User profiles
- Profile pictures and bios
- Follower/following counts
- Follow, like, and comment notifications
- Unread notification badge
- Mark-one / mark-all-as-read workflows
- Notification-to-resource navigation
- Paginated notification API
- Duplicate-notification prevention
- 90-day MongoDB TTL retention

### Security

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
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 • CSS3 • Vanilla JavaScript |
| Backend | Node.js • Express.js |
| Database | MongoDB • Mongoose |
| Authentication | JWT • bcrypt |
| Media | Cloudinary |
| Security | Helmet • CORS • express-rate-limit • express-validator |
| Testing | Jest • Supertest |
| Development | Nodemon • Git • GitHub |

## Project Structure

```text
mini-social-media/
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
├── app.js
├── server.js
├── package.json
├── .env.example
├── SECURITY.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB
- npm
- Cloudinary account if image uploads are enabled

### 1. Clone

```bash
git clone https://github.com/hack2ai/mini-social-media.git
cd mini-social-media
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a local `.env` from `.env.example` and configure the MongoDB connection, JWT secret, Cloudinary credentials, application port, and any frontend URL required by the current configuration.

Never commit `.env` or real production credentials.

### 4. Start the application

```bash
npm run dev
```

Default local URL:

`http://localhost:5000`

## API

Base URL:

`http://localhost:5000/api`

The API is organized around authentication, users/profiles, feed, posts, comments, follows, notifications, image uploads, and health checks.

Detailed endpoint documentation is available in [`docs/API.md`](docs/API.md).

## Testing

Run the complete Jest suite:

```bash
npm test
```

Run the API smoke suite:

```bash
npm test -- --runInBand tests/app.smoke.test.js
```

The smoke suite covers health checks, frontend availability, protected notification access, API 404 handling, and security headers.

## Security

This project implements multiple application-level security controls, but it should not be treated as a security-audited production service.

For production deployment, additionally consider:

- HTTPS and secure cookie configuration where applicable
- Secret management and rotation
- Stronger authentication/recovery controls
- Centralized audit logging
- Dependency vulnerability scanning
- Abuse detection and monitoring
- Strict CORS allowlists
- File-type/content validation for uploaded media
- Database backup and recovery procedures
- Threat modeling and penetration testing

See [`SECURITY.md`](SECURITY.md) for the repository's security guidance.

## Screenshots

Place product screenshots under `screenshots/` and document them here as the UI evolves.

Recommended showcase images:

- Login / registration
- Home feed
- Create post
- User profile
- Discover users
- Comments
- Notifications
- Follow system
- Automated test results

## AI-Assisted Development

AI tools were used as development assistants for architecture planning, debugging, security review, code review, test planning, and documentation. The resulting implementation was still manually reviewed and tested by the project author.

## Project Value

This project demonstrates practical **MERN-style backend engineering, REST API design, authentication, authorization, MongoDB data modeling, media handling, notification workflows, application security, and automated testing**.

## Author

**Pankaj (Tony) Kumar**  
AI Engineer • Full Stack Developer • Generative AI & RAG Specialist

[GitHub](https://github.com/hack2ai) • [LinkedIn](https://www.linkedin.com/in/pankaj-kumar-ab591a216)

## License

MIT — see [LICENSE](LICENSE).
