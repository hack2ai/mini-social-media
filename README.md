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

Home feed

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

Browser
  │
  ▼
HTML / CSS / Vanilla JavaScript
  │
  ▼
Express.js REST API
  │
  ├── Authentication
  ├── Users / Profiles
  ├── Posts
  ├── Comments
  ├── Follows
  ├── Feed
  └── Notifications
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
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── SECURITY.md
└── docs/
    └── API.md

Local Setup

1. Clone

git clone https://github.com/YOUR_USERNAME/mini-social-media.git
cd mini-social-media

2. Install dependencies

npm install

3. Configure environment variables

Copy .env.example to .env and fill in the real values.

# Windows PowerShell
Copy-Item .env.example .env

Required services/configuration include MongoDB, JWT configuration, and Cloudinary credentials for image handling.

4. Start development server

npm run dev

Open:

http://localhost:5000

5. Run tests

npm test -- --runInBand tests/app.smoke.test.js

The current smoke suite verifies:

/api/health

frontend entry point

protected notifications endpoint

API 404 handling

Helmet security headers

API

See docs/API.md.

Security

See SECURITY.md.

Testing

The project was manually regression-tested across:

Login / logout

Post creation and management

Like / unlike

Comments

Follow / unfollow

Like, comment, and follow notifications

Notification navigation

Notification pagination

Read/unread notification handling

The automated smoke suite currently reports:

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total

AI-Assisted Development

AI tools were used as development assistants during the project.

ChatGPT

Architecture planning

Debugging assistance

Security review

Code review

Test planning

Documentation assistance

Blackbox AI

In-editor development assistance

Debugging and implementation iteration

AI tools were used as productivity and development aids. The application was manually tested, reviewed, debugged, and validated with automated API smoke tests.

Screenshots

Recommended repository screenshots:

screenshots/
├── login.png
├── home-feed.png
├── create-post.png
├── profile.png
├── discover-users.png
├── comments.png
├── notifications.png
└── jest-tests.png

Repository Topics

Recommended GitHub topics:

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

License

MIT License. See LICENSE.