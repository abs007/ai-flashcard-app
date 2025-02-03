# AI Flashcard Generator

An AI-powered application that automatically generates flashcards from uploaded documents using Perplexity AI.

## Features

- Upload PDF, DOC, or DOCX files
- AI-powered flashcard generation
- Difficulty levels for each flashcard
- Modern, responsive UI
- Real-time processing feedback

## Tech Stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Serverless: Netlify Functions
- AI: Perplexity AI

## Prerequisites

- Node.js >= 18
- npm >= 9
- A Perplexity AI API key

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-flashcard-app.git
   cd ai-flashcard-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment files:

   `.env` (root directory):
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

   `frontend/.env.development`:
   ```
   VITE_API_URL=http://localhost:8888
   ```

   `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-netlify-site.netlify.app
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Development

- Frontend code is in `frontend/src`
- Serverless functions are in `api/`
- Environment variables are managed in `.env` files

## Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Functions directory: `api`

3. Set environment variables in Netlify:
   - `PERPLEXITY_API_KEY`

4. Deploy!

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: PDF, DOC, DOCX

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 