# BharatKathaAI

A full-stack AI chatbot specialized in Indian culture and heritage. BharatKathaAI combines a sleek React-based web interface with a FastAPI backend, powered by Groq's `llama-3.3-70b-versatile` model. It answers questions exclusively about Indian culture, traditions, history, philosophy, arts, and heritage — with responses streamed in real-time.

## 🌟 Features

- 🤖 AI-powered chat using Groq's `llama-3.3-70b-versatile` model
- 🇮🇳 Specialized knowledge restricted to Indian culture and heritage
- 🌐 Full-stack: React + Vite frontend, FastAPI backend
- 💬 Multi-session chat with persistent conversation history (SQLite)
- ⚡ Real-time streaming responses via Server-Sent Events (SSE)
- ✏️ Rename and 🗑️ delete individual chat sessions
- 🔍 Search across past sessions in the sidebar
- 📥 Export any chat session as a Markdown file
- 🎨 Dark glassmorphism UI with smooth Framer Motion animations
- 🔒 API key secured on the backend via `.env`

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Dependencies](#dependencies)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [Future Improvements](#future-improvements)
- [License](#license)

## Prerequisites

- **Python 3.8+** — for the backend
- **Node.js 18+ & npm** — for the frontend
- **Groq API key** — [Get one here](https://console.groq.com/)
- Stable internet connection

### Checking Versions

```bash
python --version
node --version
npm --version
```

## Installation

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd "Python chatbot"
```

### Step 2: Backend Setup

```bash
cd Backend
pip install -r requirements.txt
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

## Configuration

Create a `.env` file inside the `Backend/` directory with your Groq API key:

```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

> The backend loads this automatically via `python-dotenv`. Never commit this file to version control.

### Getting Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key (shown only once)

## Running the App

You need **two terminals** running simultaneously:

### Terminal 1 — Start the Backend

```bash
cd Backend
python -m uvicorn main:app --reload --port 8000
```

The API will be available at: `http://127.0.0.1:8000`

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

The app will be available at: `http://localhost:5173` (Vite default)

Open your browser and navigate to `http://localhost:5173` to start chatting.

## How It Works

1. On load, the React frontend fetches all existing chat sessions from `GET /api/sessions`
2. When a user sends a message, the frontend calls `POST /api/session/{id}/stream`
3. The backend saves the user message to SQLite, builds the full message history, and calls the Groq API with streaming enabled
4. Streamed response chunks arrive as Server-Sent Events (`text/event-stream`) and are rendered token-by-token in the UI
5. Once streaming is complete, the final assistant reply is persisted to SQLite
6. The session title is auto-generated from the first message (first 25 characters)

### System Prompt

The backend enforces this system prompt for every request:

```
"You are an excellent Indian culture and heritage bot who has all the knowledge
about Indian culture and heritage only. You will not answer any questions outside
of Indian heritage, philosophy, history, geography, arts, and traditions.
Format responses using beautiful Markdown."
```

## Project Structure

```
Python chatbot/
├── Backend/                    # FastAPI backend
│   ├── main.py                 # API routes, SSE streaming, Groq integration
│   ├── database.py             # SQLAlchemy models (ChatSession, ChatMessage) & SQLite engine
│   ├── bharatkatha.db          # Auto-created SQLite database
│   ├── requirements.txt        # Backend Python dependencies
│   └── .env                    # Environment variables (GROQ_API_KEY) — not committed
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main chat UI (sidebar, message thread, input, SSE reader)
│   │   ├── App.css             # Component-level styles
│   │   ├── main.jsx            # React 19 entry point
│   │   └── index.css           # Global styles & Tailwind v4 imports
│   ├── public/
│   │   ├── favicon.svg         # App favicon
│   │   └── icons.svg           # Icon assets
│   ├── index.html              # HTML entry point
│   ├── package.json            # Node dependencies & scripts
│   ├── vite.config.js          # Vite + @tailwindcss/vite + @vitejs/plugin-react
│   ├── eslint.config.js        # ESLint flat config
│   └── .gitignore              # Frontend-specific git ignore
├── apibot.py                   # Legacy CLI chatbot (original version)
├── requirements.txt            # Root-level Python dependencies
├── README.md                   # Project documentation
└── .gitignore                  # Root git ignore
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | Fetch all chat sessions ordered by newest first |
| `POST` | `/api/sessions` | Create a new chat session `{ id, title }` |
| `DELETE` | `/api/session/{session_id}` | Delete a session and all its messages (cascade) |
| `POST` | `/api/session/{session_id}/stream` | Send a message; streams AI response as SSE |
| `PUT` | `/api/session/{session_id}` | Rename a session `{ title }` |

### SSE Streaming Format

Each chunk arrives as:
```
data:{"chunk": "...token..."}
```

## Dependencies

### Backend (Python)

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework for building the REST API |
| `uvicorn` | ASGI server to run FastAPI |
| `sqlalchemy` | ORM — manages `ChatSession` and `ChatMessage` tables in SQLite |
| `python-dotenv` | Loads `GROQ_API_KEY` from `.env` |
| `openai` ≥ 1.0.0 | OpenAI-compatible client for the Groq API |
| `pydantic` | Request/response data validation |

### Frontend (Node.js)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.6 | UI library |
| `react-dom` | ^19.2.6 | React DOM renderer |
| `framer-motion` | ^12.40.0 | Animations and motion transitions |
| `lucide-react` | ^1.17.0 | Icon library |
| `tailwindcss` | ^4.3.0 | Utility-first CSS framework (v4) |
| `@tailwindcss/vite` | ^4.3.0 | Tailwind v4 Vite plugin |
| `vite` | ^8.0.12 | Frontend build tool and dev server |
| `@vitejs/plugin-react` | ^6.0.1 | React Fast Refresh support |

## Security Best Practices

### ⚠️ Important Notes

1. **Never commit your API key** — keep it in `Backend/.env` which is listed in `.gitignore`
2. **Never put the API key in frontend code** — all Groq calls are made server-side only
3. **Rotate your key** if it is accidentally exposed; monitor usage in the Groq dashboard

### Recommended `.gitignore` Entries

```
# Environment variables
.env
*.env

# Python
__pycache__/
*.py[cod]
*.so
venv/
env/
ENV/

# SQLite database
*.db

# Node
node_modules/
dist/
```

## Troubleshooting

### `ModuleNotFoundError` for a Python package

```bash
pip install -r Backend/requirements.txt
```

### Frontend shows network error / messages don't send

- Ensure the backend is running on port `8000`
- Check the browser console for CORS errors
- CORS is configured as `allow_origins=["*"]` in `main.py` by default

### `401 Unauthorized` from Groq API

- Verify `GROQ_API_KEY` is correct in `Backend/.env`
- Ensure there are no extra spaces or quotes around the key
- Try regenerating the API key in the [Groq Console](https://console.groq.com/)

### Model not found error

- The backend uses `llama-3.3-70b-versatile` — verify this is available in your Groq account
- Check [Groq's model list](https://console.groq.com/docs/models) for currently available models

### Frontend dev server not starting

```bash
cd frontend
npm install   # reinstall dependencies
npm run dev
```

### Getting Help

1. Check the [Groq API Documentation](https://console.groq.com/docs)
2. Review error messages in both terminals
3. Ensure Python ≥ 3.8 and Node.js ≥ 18 are installed

## FAQ

### Q: Can I ask about topics other than Indian culture?

**A:** No — the system prompt strictly restricts the bot to Indian culture, heritage, history, philosophy, arts, and traditions. Questions outside this domain are declined.

### Q: Is the Groq API free?

**A:** Groq offers a free tier with usage limits. Check their [pricing page](https://console.groq.com/) for current rates and limits.

### Q: Are my conversations saved?

**A:** Yes — all chat sessions and messages are persisted in a local SQLite database (`Backend/bharatkatha.db`). They are restored on every page reload.

### Q: How do I export a conversation?

**A:** Click the **Export MD** button in the top-right of the chat panel. It downloads the active session as a `.md` Markdown file.

### Q: Can I rename or delete a session?

**A:** Yes — hover over any session in the sidebar to reveal **✏️ rename** and **🗑️ delete** action buttons.

### Q: Can I change the AI model?

**A:** Yes — edit the `model` field inside the `event_generator` function in `Backend/main.py`. Check [Groq's docs](https://console.groq.com/docs/models) for available models.

### Q: What Python version is required?

**A:** Python 3.8 or higher. Python 3.10+ is recommended for best compatibility.

## Limitations

- **Focused domain only** — restricted to Indian culture and heritage by design
- **Local SQLite database** — not suitable for multi-user cloud deployments without switching to PostgreSQL or similar
- **No authentication** — the app does not include user login or access control
- **Internet required** — the Groq API requires an active internet connection
- **API rate limits** — subject to Groq's rate limiting policies on the free tier
- **Single-user local setup** — designed for local development; production deployment requires additional configuration

## Contributing

Contributions are welcome! Here are some ways you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Areas for Contribution

- User authentication and profiles
- Cloud database support (PostgreSQL / Neon)
- Support for multiple Indian languages (Hindi, Tamil, etc.)
- Voice input/output support
- Mobile responsive PWA
- Unit and integration tests
- Multimodal support (image-based questions)

### Code Style

- **Python**: Follow PEP 8; use docstrings for functions
- **JavaScript/React**: Follow standard React patterns; use functional components and hooks

## Future Improvements

### Planned Features

- [x] Persistent conversation history (SQLite via SQLAlchemy)
- [x] Streaming responses (Server-Sent Events)
- [x] Multi-session management (create, rename, delete)
- [x] Search across chat sessions
- [x] Export chat as Markdown
- [x] Web UI (React 19 + Vite + Tailwind v4)
- [ ] User authentication and access control
- [ ] Cloud database support (PostgreSQL / Neon)
- [ ] Configurable system prompts via UI
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Voice input/output
- [ ] Deploy backend to Railway / Render
- [ ] Deploy frontend to Vercel / Netlify
- [ ] Mobile-first responsive layout improvements

## License

This project is open source and available for personal and educational use.

---

## Acknowledgments

- Built with [Groq](https://groq.com/) API
- Powered by `llama-3.3-70b-versatile` model
- Uses [OpenAI Python Library](https://github.com/openai/openai-python) (OpenAI-compatible client for Groq)
- Frontend built with [React 19](https://react.dev/), [Vite 8](https://vite.dev/), [Tailwind CSS v4](https://tailwindcss.com/), and [Framer Motion](https://www.framer.com/motion/)
- Icons by [Lucide](https://lucide.dev/)
- Backend powered by [FastAPI](https://fastapi.tiangolo.com/) and [SQLAlchemy](https://www.sqlalchemy.org/)

---

**Made with ❤️ for preserving and sharing Indian culture and heritage**

For questions, issues, or contributions, please open an issue on the repository.
