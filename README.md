# 🚀 HireNest - Modern Job Portal Application

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-4169e1?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
</div>

<br>

HireNest is a **production-ready, full-stack job portal** connecting candidates and recruiters through secure, resume-based hiring workflows. Built with modern technologies and industry-standard practices, it features role-based authentication, admin oversight, and a beautiful responsive UI.

---

## ✨ Features

### For Candidates
- 📝 **Complete Profile Management** - Upload profile photo, phone number, and resume
- 🔍 **Smart Job Search** - Browse, search, and filter job listings
- 📄 **One-Click Apply** - Resume automatically attached to applications
- 📊 **Application Tracking** - Monitor status (Pending, Viewed, Shortlisted, Rejected)
- 🔐 **Mandatory Resume** - Backend-enforced resume upload before applying

### For Recruiters
- 🏢 **Company Profile** - Manage company information and branding
- 📋 **Job Management** - Post, edit, and close job listings
- 👥 **Applicant Review** - View candidate profiles, resumes, and cover letters
- ✅ **Status Updates** - Mark applications as Viewed, Shortlisted, or Rejected
- 📈 **Dashboard Analytics** - Track applications and job performance

### For Admins
- 🛡️ **Platform Overview** - Monitor all users, jobs, and applications
- 👤 **User Management** - View and remove users (candidates/recruiters)
- 📊 **Job Moderation** - Review and remove job postings
- 📉 **Statistics Dashboard** - Real-time platform metrics

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons |
| **Animations** | Framer Motion |
| **Backend** | Next.js API Routes (REST) |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | JWT (jose) + bcryptjs |
| **File Storage** | Cloudinary |
| **Theming** | Dark/Light mode (next-themes) |

---

## 📁 Project Structure

```
hirenest/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin endpoints
│   │   │   ├── applications/  # Application status
│   │   │   ├── auth/          # Auth endpoints
│   │   │   ├── candidate/     # Candidate endpoints
│   │   │   ├── jobs/          # Job CRUD
│   │   │   ├── recruiter/     # Recruiter endpoints
│   │   │   └── upload/        # File upload
│   │   ├── dashboard/         # Role dashboards
│   │   │   ├── admin/
│   │   │   ├── candidate/
│   │   │   └── recruiter/
│   │   ├── jobs/              # Job pages
│   │   │   └── [id]/          # Job detail
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── navbar.tsx         # Navigation
│   │   ├── theme-provider.tsx # Theme context
│   │   └── theme-toggle.tsx   # Dark/light toggle
│   └── lib/
│       ├── auth.ts            # Auth utilities
│       ├── cloudinary.ts      # File upload
│       └── prisma.ts          # Database client
├── .env.example               # Environment template
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or [Supabase](https://supabase.com) account)
- [Cloudinary](https://cloudinary.com) account for file storage

### 1. Clone & Install

```bash
cd hirenest
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Database (Supabase or local PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Security Highlights

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with 12 salt rounds |
| **Token Storage** | JWT in httpOnly cookies |
| **Token Signing** | HS256 algorithm via jose |
| **Session Duration** | 7-day expiration |
| **Role Authorization** | Middleware-enforced RBAC |
| **Input Validation** | Backend validation on all endpoints |
| **Resume Requirement** | API-level enforcement for job applications |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/list` | List all jobs |
| POST | `/api/jobs/create` | Create job (Recruiter) |
| GET | `/api/jobs/[id]` | Get job details |
| PATCH | `/api/jobs/[id]` | Update job |
| DELETE | `/api/jobs/[id]` | Delete job |
| POST | `/api/jobs/apply` | Apply for job (Candidate) |

### Recruiter
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recruiter/jobs` | Get recruiter's jobs |
| GET | `/api/recruiter/applications` | Get applications |
| PATCH | `/api/applications/status` | Update app status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/overview` | Platform stats |
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users` | Delete user |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file (photo/resume) |

---

## 🗄️ Database Schema

```prisma
enum Role {
  ADMIN
  RECRUITER
  CANDIDATE
}

enum JobStatus {
  OPEN
  CLOSED
}

enum ApplicationStatus {
  PENDING
  VIEWED
  SHORTLISTED
  REJECTED
}

model User {
  id            String   @id
  email         String   @unique
  password_hash String
  role          Role
  // Relations: candidateProfile, recruiterProfile, jobs, applications
}

model CandidateProfile {
  phone      String?
  photo_url  String?
  resume_url String?
}

model RecruiterProfile {
  company_name  String
  company_email String
  description   String?
}

model Job {
  title       String
  description String
  location    String
  salary      String?
  job_type    String?
  skills      String[]
  status      JobStatus
}

model Application {
  resume_url   String
  cover_letter String?
  status       ApplicationStatus
}
```

---

## 🎨 UI/UX Features

- ✅ **Dark/Light Mode** - System-aware theme toggle
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Smooth Animations** - Framer Motion transitions
- ✅ **Skeleton Loaders** - Loading state placeholders
- ✅ **Toast Notifications** - Action feedback
- ✅ **Empty States** - Helpful UX when no data
- ✅ **Card-Based Layouts** - Modern, scannable design

---

## 🔮 Future Scope

- [ ] Email notifications for application updates
- [ ] Advanced job search with filters
- [ ] Resume parsing and skill extraction
- [ ] Company reviews and ratings
- [ ] Interview scheduling
- [ ] Social authentication (Google, LinkedIn)
- [ ] AI-powered job recommendations
- [ ] Real-time chat between recruiters and candidates

---

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>Built with ❤️ for modern hiring</strong>
  <br><br>
  <em>HireNest - Connecting Talent with Opportunity</em>
</div>
