# YesLearn — AI-Powered Learning Platform

YesLearn is an AI-powered study platform that transforms your learning materials into interactive study tools. Upload PDFs, YouTube videos, websites, or audio recordings, and YesLearn will generate summaries, quizzes, and an AI chat tutor — all grounded in your content.

## Features

### 📚 Multi-Format Content Upload
- **YouTube Videos** — Paste a YouTube URL to extract and learn from the transcript
- **PDFs & Documents** — Upload PDFs to extract and study the text content
- **Websites** — Paste any URL to pull in and analyze web content
- **Audio Recordings** — Upload audio files for transcription and study

### 🧠 AI-Powered Summaries
Automatically generate concise, structured summaries of your uploaded content. Summaries highlight key concepts, important details, and main takeaways.

### 💬 Interactive AI Chat
Chat with an AI tutor that has full context of your uploaded materials. Ask questions, request explanations, and get answers with references to your content.

### ✅ Auto-Generated Quizzes
Test your knowledge with multiple-choice quizzes created by AI from your learning materials. Review correct answers and track your progress.

### 📂 Learning Spaces
Organize your materials into focused learning spaces (e.g., "Biology 101", "ML Research"). Each space keeps your content, chat history, summaries, and quizzes together.

### 🎨 Customizable Spaces
Personalize each space with custom names, colors, icons, tags, and descriptions.

### 🌗 Dark Mode
Full dark mode support for comfortable studying at any hour.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router, Turbopack) |
| **UI** | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [Lucide Icons](https://lucide.dev) |
| **Database** | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) |
| **Authentication** | [better-auth](https://www.better-auth.com) with OAuth provider support |
| **AI** | Configurable AI providers (Google Gemini, GitHub Copilot) |
| **PDF Parsing** | [pdf-parse](https://www.npmjs.com/package/pdf-parse), [react-pdf](https://www.npmjs.com/package/react-pdf) |
| **Markdown** | [react-markdown](https://www.npmjs.com/package/react-markdown) with GFM support |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/jip9e/orchids-yeslearn-ai.git
cd orchids-yeslearn-ai

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Setup

YesLearn stores data locally using SQLite. The database file is created automatically at `~/.YesLearn/yeslearn.db` (or `%APPDATA%/.YesLearn/` on Windows).

To configure AI providers, visit the **Settings** page in the app (`/settings`) and connect your preferred AI provider.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout with metadata
│   ├── dashboard/          # Main dashboard with spaces overview
│   │   ├── page.tsx        # Dashboard home (stats, quick add, spaces)
│   │   └── add/            # Content upload page
│   ├── space/              # Learning space pages
│   │   ├── [id]/page.tsx   # Individual space (content, chat, quiz, summary)
│   │   └── new/page.tsx    # Create new space
│   ├── pricing/            # Pricing page
│   ├── settings/           # App settings & AI provider config
│   ├── careers/            # Careers page
│   ├── contact/            # Contact page
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   └── api/                # API routes
│       ├── auth/           # Authentication endpoints
│       ├── chat/           # AI chat endpoint
│       ├── content/        # Content upload & extraction
│       ├── quiz/           # Quiz generation
│       ├── spaces/         # CRUD for learning spaces
│       ├── stats/          # Dashboard statistics
│       ├── summary/        # AI summary generation
│       ├── models/         # Available AI models
│       └── settings/       # App settings API
├── components/
│   ├── sections/           # Landing page sections
│   │   ├── navigation.tsx  # Top navigation bar
│   │   ├── hero.tsx        # Hero section
│   │   ├── trusted-by.tsx  # Trusted-by logo ticker
│   │   ├── features-grid.tsx # Features showcase
│   │   ├── testimonials.tsx  # User testimonials
│   │   ├── coming-soon.tsx   # Upcoming features
│   │   └── footer.tsx      # Footer
│   ├── app/
│   │   └── sidebar.tsx     # App sidebar navigation
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── lib/
│   ├── ai/                 # AI client configuration
│   ├── auth/               # OAuth provider setup
│   ├── db/                 # Database schema & connection
│   └── utils.ts            # Utility functions
└── hooks/                  # Custom React hooks
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Coming Soon

- 🎙️ **AI Podcast Generation** — Convert learning materials into listenable audio
- 🃏 **Flashcards** — Auto-generate spaced-repetition flashcards
- 👥 **Collaborative Spaces** — Share and study with classmates in real time
- 📱 **Mobile App** — Study on the go

## License

This project is private and proprietary.

