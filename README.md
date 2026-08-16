Mini Social Media

A full-stack social media web application built with Node.js, Express.js, MongoDB, Mongoose, and Vanilla JavaScript.

The application provides authentication, profiles, posts, image uploads, likes, comments, follow/unfollow, user discovery, a personalized feed, and a notification system.

Features

Authentication

User registration and login

JWT-based authentication

Protected API routes

Logout and session cleanup

Password hashing with bcrypt

Social Features

Create, edit, and delete posts

Image uploads

Like / unlike posts

Create, edit, and delete comments

Follow / unfollow users

Followers / following counts

User discovery and search

Personalized home feed

Profiles

User profile pages

Profile picture

Bio

Post count

Follower count

Following count

Notifications

Follow notifications

Like notifications

Comment notifications

Unread notification badge

Mark one notification as read

Mark all notifications as read

Notification-to-profile/post navigation

Paginated notification API

Duplicate unread-notification protection

Unread notification cleanup on unlike/unfollow

90-day notification retention using MongoDB TTL

Security

Helmet security headers

CORS configuration

JWT authentication

Request size limits

Rate limiting

Input validation

MongoDB ObjectId validation

Authorization and ownership checks

Centralized error handling

Notification cleanup and deduplication

MongoDB query indexes

Testing

Jest

Supertest

API smoke tests

Manual end-to-end regression testing

Tech Stack

Layer

Technology

Frontend

HTML5, CSS3, Vanilla JavaScript

Backend

Node.js, Express.js

Database

MongoDB, Mongoose

Authentication

JWT, bcrypt

Media

Cloudinary

Security

Helmet, CORS, express-rate-limit, express-validator

Testing

Jest, Supertest

Development

Nodemon, Git, GitHub

Architecture

                         ┌──────────────────────┐
                         │       Browser        │
                         │ HTML / CSS / JS      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Express.js API    │
                         │      Node.js         │
                         └──────────┬───────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
 Authentication             Controllers / Routes         Middleware
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
                               Mongoose
                                    │
                                    ▼
                                 MongoDB

                         Post/Profile Images
                                    │
                                    ▼
                                Cloudinary

Project Structure

mini-social-media/
├── config/
├── controllers/
├── middleware/
├── models/
├── public/
│   ├── css/
│   ├── images/
│   ├── js/
│   └── uploads/
├── routes/
├── scripts/
├── services/
├── tests/
├── utils/
├── validators/
├── views/
│
├── docs/
│   └── API.md
│
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
└── SECURITY.md

Getting Started

1. Clone the repository

git clone https://github.com/hack2ai/mini-social-media.git
cd mini-social-media

2. Install dependencies

npm install

3. Configure environment variables

Create a local .env file from .env.example.

Windows PowerShell

Copy-Item .env.example .env

Then configure the required values for your local environment, including:

MongoDB connection string

JWT secret

Cloudinary credentials

Application port

Frontend URL when required

Never commit your real .env file or production secrets to GitHub.

4. Start the development server

npm run dev

Open:

http://localhost:5000

5. Run the automated smoke tests

npm test -- --runInBand tests/app.smoke.test.js

Current verified result:

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total

API

Base URL:

http://localhost:5000/api

Main API areas include:

Authentication

Users / profiles

Feed

Posts

Comments

Follow / unfollow

Notifications

Image upload

Health check

Detailed endpoint documentation:

API Documentation

Security

The application includes several security controls:

JWT-based authentication

Password hashing with bcrypt

Protected API endpoints

Authorization and ownership checks

Helmet security headers

CORS configuration

Rate limiting

Request-size limits

Input validation

ObjectId validation

Centralized error handling

Notification deduplication and cleanup

MongoDB indexes

90-day notification retention using TTL

For more information:

Security Documentation

Testing

Automated regression smoke tests

The current Jest + Supertest smoke suite verifies:

GET /api/health

Frontend entry point

Protected notifications endpoint

API 404 handling

Helmet security headers

Result:

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total

Manual end-to-end regression testing

The application was also manually tested across:

Login / logout

Home feed

Post creation and management

Like / unlike

Comment creation

Follow / unfollow

Like notifications

Comment notifications

Follow notifications

Notification navigation

Notification pagination

Read / unread notification handling

AI-Assisted Development

AI tools were used as development assistants, not as a replacement for testing or engineering review.

ChatGPT

Used for:

Architecture planning

Debugging assistance

Security review

Code review

Test planning

Documentation assistance

Development troubleshooting

Blackbox AI

Used for:

In-editor development assistance

Debugging and implementation iteration

The final application was manually tested, debugged, reviewed, and validated with automated API smoke tests.

Screenshots

Add your project screenshots under:

screenshots/
├── 01-login.png
├── 02-home-feed.png
├── 03-create-post.png
├── 04-profile.png
├── 05-discover-users.png
├── 06-comments.png
├── 07-notifications.png
├── 08-follow-system.png
└── 09-jest-tests.png

Login



Home Feed



Profile



Notifications



Automated Tests



GitHub Topics

Recommended repository topics:

nodejs
expressjs
mongodb
mongoose
javascript
social-media
jwt
rest-api
full-stack
jest
supertest
helmet
cloudinary
web-development

Development

Run the development server:

npm run dev

Run all Jest tests:

npm test

Run the smoke suite specifically:

npm test -- --runInBand tests/app.smoke.test.js

Contributing

Fork the repository.

Create a feature branch.

Make your changes.

Add or update tests where appropriate.

Commit your changes with a clear message.

Open a pull request.

Example:

git checkout -b feature/your-feature
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

License

This project is licensed under the MIT License.

See LICENSE.