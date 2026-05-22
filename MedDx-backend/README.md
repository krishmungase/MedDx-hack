# MedDx Backend

Node + Express + Mongoose API for [MedDx](../) — an AI-enabled telehealth web app
that connects rural patients to specialist doctors over scheduled video
consultations.

## Stack
- Node 18 (see `.nvmrc`), ESM modules
- Express 4, Mongoose 8 (MongoDB Atlas)
- JWT (`jsonwebtoken`) + bcrypt
- Nodemailer (Gmail App Password) + Mailgen
- Razorpay Node SDK (TEST mode, added in Phase 6)
- Groq SDK (`llama-3.3-70b-versatile`, added in Phase 5)
- Cloudinary uploads

## Run locally

```bash
cd MedDx-backend
cp .env.example .env       # then fill in the values
npm install
npm run dev                # nodemon api/index.js
```

The server listens on `APP_PORT` (defaults to 5555). `GET /` returns
`{"ok": true}` once Mongo is connected.

## Required env vars
See [.env.example](./.env.example). Notable ones:
- `MONGO_URI` — full Atlas connection string including the database name
- `JWT_SECRET` — long random string used to sign tokens
- `CLIENT_URL` — frontend origin (`http://localhost:8888` in dev)
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — Gmail App Password for transactional
  email. **If left blank**, the doctor-invitation endpoint will not throw —
  it returns the set-password link in the API response so the admin UI can
  display it for the admin to share manually.
- `GROQ_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_URL`
  — needed in later phases.

## Promoting the first user to admin

There is no admin-self-registration endpoint by design — admins are seeded
manually in Mongo. The flow is:

1. Start both servers (`npm run dev` in `MedDx-backend` and `MedDx-frontend`).
2. Visit `http://localhost:8888/auth/sign-up` and create an account with
   the email you want to become the first admin. It will be created with
   `role: "patient"`.
3. In **MongoDB Atlas → your cluster → Collections → `users`**, find that
   user's document and change `"role": "patient"` to `"role": "admin"`.
   Save the document.
4. Sign out and sign back in. You'll be redirected to `/admin`.

From there, the admin dashboard lets you onboard doctors. Each doctor gets a
one-time 24-hour set-password link by email — or, if Gmail isn't configured,
the link appears in the admin UI for you to copy and share manually.

## Project layout

```
src/
  config/       env loading (reads MONGO_URI, JWT_SECRET, ...)
  constants/    enums + log messages
  controllers/  class-based controllers with constructor DI
    auth/
    admin/
    ai/
  db/           Mongoose connect()
  logger/       Winston
  middlewares/  verifyJWT, requireRole, validate, error handler, ...
  models/
    auth/, slot/, appointment/, medical-record/, transaction/
  routes/       express.Router mounting
  services/     class-based services
    auth/       UserService
    shared/     HashService, TokenService, NotificationService, MailgenService, UploadService
    ai/         LLMServices
  utils/        ApiError, ApiResponse, asyncHandler
  validators/   express-validator chains
api/
  index.js      entry that re-exports src/index.js for serverless deploy
```

Every route handler is wrapped in `asyncHandler`, throws `ApiError` on
failure, and returns `ApiResponse` on success.

## Auth endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Patient sign-up (rejects `role=doctor\|admin`) |
| POST | `/api/v1/auth/login` | Email + password login; blocks non-`active` accounts |
| GET  | `/api/v1/auth/verify-setup-token?token=` | Pre-flight check for the doctor set-password page |
| POST | `/api/v1/auth/set-password` | Doctor sets initial password; clears token; logs in |

## Admin endpoints (require `verifyJWT` + `requireRole("admin")`)

| Method | Path | Purpose |
|---|---|---|
| POST   | `/api/v1/admin/register-doctor` | Create doctor (`accountStatus: "pending_setup"`) and email/return the set-password link |
| GET    | `/api/v1/admin/doctors` | List all doctors (any account status) |
| GET    | `/api/v1/admin/stats` | Counts of patients / doctors / appointments |
| PATCH  | `/api/v1/admin/doctors/:id` | Suspend or re-activate a doctor (`{ accountStatus: "active"\|"suspended" }`) |
| DELETE | `/api/v1/admin/doctors/:id` | Permanently remove a doctor |

## Health
`GET /` → `{ ok: true }`
