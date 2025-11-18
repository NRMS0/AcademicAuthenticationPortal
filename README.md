# Academic Web Authentication Portal
A full-stack academic submission and authentication portal supporting secure login, assignment submissions, grading, achievements, 2FA, and role-based access for lecturers and students.

---

## Features

-  User authentication with JWT and optional 2FA
-  Secure file uploads via Cloudinary
-  Lecturer dashboard with assignment + grading tools
-  Student dashboard with course views, achievements, and feedback
-  System health logs and monitoring
-  Easily switch between hosted or local environments

---

## Requirements

- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account (for file hosting)

---

## Setup Instructions

1. **Clone the repo**

   git clone https://github.com/NRMS0/AcademicAuthenticationPortal
   cd webauthenticationportal

2. **Run setup script This installs dependencies and creates a .env file in the backend:**

node setup.cjs

#  **Start servers**

**In /backend**
node server.js

**In project root (frontend)**
npm run dev

---

## Roles

Lecturer

-Create courses

-Upload assignments

-Grade and give feedback

Student

-View assignments

-Submit files

-Track achievements and feedback

## Example deployment
---
The web app is deployed below as an example
DISCLAIMER: some features are not functioning due to removal of cloud services (high price of running the service these will work on personal set-up)
https://webauthenticationportal-z87p.vercel.app/
