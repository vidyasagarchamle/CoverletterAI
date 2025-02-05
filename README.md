# CoverletterAI

An AI-powered cover letter generator that creates personalized, ATS-friendly cover letters based on your resume and job description.

## Features

- 🤖 AI-powered cover letter generation
- 📝 ATS-friendly formatting
- 🎯 Skill matching and keyword optimization
- 🔒 Secure authentication with Supabase
- 💾 Save and manage your cover letters
- 🎨 Beautiful and responsive UI

## Tech Stack

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Supabase Client

### Backend
- FastAPI
- OpenAI API
- Python 3.11+

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.11+
- OpenAI API key
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vidyasagarchamle/CoverletterAI.git
cd CoverletterAI
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:

Create `.env` files in both frontend and backend directories:

Frontend `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Backend `.env`:
```
OPENAI_API_KEY=your_openai_api_key
```

5. Start the development servers:

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
uvicorn main:app --reload
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 