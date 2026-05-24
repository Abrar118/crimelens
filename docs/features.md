# CrimeLens Feature List

All features from the NSU WebXtreme Hackathon 2025 project description. We'll decide on each one together.

## Decided Stack
- **Frontend:** Next.js (App Router) on Vercel, shadcn/ui + Tailwind CSS
- **Auth:** Firebase Auth (including Firebase Phone Auth for OTP)
- **Database:** MongoDB Atlas
- **Storage:** Firebase Storage
- **AI:** Google Gemini
- **Realtime:** Firebase Realtime DB / Firestore listeners
- **API:** Next.js API Routes (serverless functions)

---

## Core Features (from original PDF)

| #  | Feature                        | Status   | Notes |
|----|--------------------------------|----------|-------|
| 1  | User Registration (email, phone, password) | Pending | Migrate from custom JWT to Firebase Auth |
| 2  | User Login                     | Pending | Firebase Auth email/password |
| 3  | Password Management (change + recovery) | Pending | Firebase Auth built-in |
| 4  | Refresh Token                  | Pending | Handled by Firebase Auth SDK automatically |
| 5  | Phone Number Verification (OTP) | Pending | Firebase Phone Auth |
| 6  | Admin Ban (prevent user interactions) | Pending | Custom claims or DB flag |
| 7  | Crime Reporting (image required, optional video) | Pending | Firebase Storage uploads |
| 8  | Division/District Selection (Bangladesh) | Pending | Static JSON data already exists |
| 9  | AI-Generated Crime Description (from image) | Pending | Gemini 1.5 Flash — already integrated |
| 10 | Crime Post Details (title, desc, location, time, media) | Pending | MongoDB schema design |
| 11 | Upvote/Downvote                | Pending | Community verification |
| 12 | Comments with Mandatory Proof  | Pending | Image/video required per comment |
| 13 | Post Verification Score        | Pending | Computed from votes + verified comments |
| 14 | Crime Feed with Pagination     | Pending | Server-side cursor pagination |
| 15 | Feed Filtering (division, district, score) | Pending | MongoDB queries |
| 16 | Feed Sorting (date, upvotes, score) | Pending | |
| 17 | Feed Searching (keyword in title/desc) | Pending | MongoDB text index or Atlas Search |
| 18 | User Roles (unverified, verified, admin) | Pending | Firebase custom claims |
| 19 | User Profile Page              | Pending | Profile image, bio, crime reports list |
| 20 | Edit Profile                   | Pending | Update picture, bio, contact info |

## Day-2 Features (disclosed at hackathon)

| #  | Feature                        | Status   | Notes |
|----|--------------------------------|----------|-------|
| 21 | Real-Time Notifications        | Pending | Firebase Realtime DB — comments, votes, admin actions |
| 22 | Notification Preferences       | Pending | Bonus: let users customize which notifications they receive |
| 23 | Crime Report Verification Badge | Pending | Auto-badge based on upvotes + verified comments threshold |
| 24 | Admin Manual Verification Override | Pending | Bonus: admins can override automated badge |
| 25 | Anonymous Reporting            | Pending | Post anonymously, still require evidence, no comment/vote ability |
| 26 | Anonymous Claim Ownership      | Pending | Bonus: claim anonymous post later by verifying identity |
| 27 | AI-Powered Fake Report Detection | Pending | Sentiment analysis + image recognition, flag + confidence score |
| 28 | Emergency Contact Integration  | Pending | Location-based police/hospital contacts, click-to-call |
| 29 | Image Compression              | Pending | Compress on upload, maintain quality balance |
| 30 | Watermarking                   | Pending | Auto-watermark uploaded images for content protection |

## Bonus Features (from original PDF)

| #  | Feature                        | Status   | Notes |
|----|--------------------------------|----------|-------|
| 31 | Crime Heatmap                  | Pending | Leaflet map with crime density visualization |
| 32 | Leaderboard                    | Pending | Top contributors by posts + helpful comments |

## Infrastructure

| #  | Feature                        | Status   | Notes |
|----|--------------------------------|----------|-------|
| 33 | Migrate Vite+React Router to Next.js App Router | Pending | Foundation for everything |
| 34 | Remove crimelens_server/       | Pending | Replace with Next.js API routes |
| 35 | Firebase Auth setup            | Pending | Replace custom JWT system |
| 36 | Firebase Storage setup         | Pending | Replace Cloudinary |
| 37 | Firebase Realtime DB setup     | Pending | For notifications |
| 38 | Vercel deployment              | Pending | CI/CD pipeline |
