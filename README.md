# AI Flashcard App

An intelligent flashcard learning application that converts PDFs and documents into interactive flashcards using AI.

## Features

- PDF/Document Upload: Upload study materials in various formats
- AI-Powered Flashcard Generation: Automatically extract key points and create flashcards
- Customizable Flashcards: Edit questions/answers and adjust difficulty levels
- Spaced Repetition System: Optimize learning with smart review scheduling
- Quiz Mode: Test your knowledge with interactive quizzes
- Progress Tracking: Monitor your learning progress
- Offline Access: Study without internet connection

## Tech Stack

- Frontend: React with TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- AI Integration: OpenAI GPT for text processing
- File Storage: AWS S3

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development servers:
   ```bash
   npm run dev
   ```

## Project Structure

```
ai-flashcard-app/
├── frontend/          # React frontend application
├── backend/           # Node.js backend server
└── package.json       # Root package.json for workspace management
```

## Environment Setup

Create `.env` files in both frontend and backend directories. Example environment variables:

```env
# Backend
PORT=3000
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name

# Frontend
VITE_API_URL=http://localhost:3000
```

## License

MIT 