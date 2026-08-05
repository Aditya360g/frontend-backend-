# SelfB Authentication Project

SelfB is a learning-focused full-stack authentication project built with React, TypeScript, Spring Boot, JWT, and MySQL.

## Features

- User registration
- Email verification
- Login with JWT access token
- Refresh-token rotation
- Logout
- Logout from all devices
- Active session management
- User profile update
- Change password
- Forgot password
- Reset password
- Protected frontend routes
- Backend validation
- Global exception handling

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- React Hook Form
- Zod
- Axios

### Backend

- Java 21
- Spring Boot
- Spring Security
- OAuth2 Resource Server
- JWT
- Spring Data JPA
- Flyway
- MySQL

## Project Structure

```text
selfb/
├── backend/
├── src/
├── package.json
└── README.md
```

## Database

Database name:

```text
selfb_db
```

MySQL port:

```text
3306
```

Flyway manages database schema migrations.

## Run Backend

From the project root:

```powershell
npm run backend
```

Backend URL:

```text
http://localhost:8080
```

## Run Frontend

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Build Frontend

```powershell
npm run build
```

## Compile Backend

```powershell
cd backend

.\mvnw.cmd clean compile
```

## Email Verification

The project currently uses development-mode email verification.

After registration, the verification URL is printed in the backend terminal.

```text
Register
→ Copy verification URL from backend terminal
→ Open URL in browser
→ Email verified
→ Login
```

A real email provider will be connected during production deployment.

## Authentication Flow

```text
Register
→ Verify Email
→ Login
→ Receive Access Token
→ Receive Refresh Token Cookie
→ Access Protected APIs
→ Rotate Refresh Token
→ Logout
```

## Security Notes

- Passwords are stored using BCrypt hashing.
- Refresh tokens are stored as hashes.
- Refresh tokens are delivered through an HTTP-only cookie.
- Access tokens are short-lived JWTs.
- Refresh-token reuse is detected.
- Password reset and email verification tokens are single-use.
- Protected APIs require authentication.

## Current Status

The learning version of the authentication project is functionally complete.

Docker setup, real email delivery, and production deployment will be added later.