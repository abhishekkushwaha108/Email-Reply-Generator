# 📧 Email Reply Generator (AI-Powered)

An AI-powered **Email Reply Generator** that helps users generate context-aware, tone-based email replies instantly.

The project consists of:
- ✅ Spring Boot Backend (AI + API layer)
- ✅ React (Vite) Frontend (Web UI)
- ✅ Chrome Extension (Gmail integration)
- ✅ Railway Deployment (Cloud hosting)

---

## 🚀 Live URLs

### Backend API
(https://email-reply-generator-production-8c99.up.railway.app/)

### API Endpoint
POST /api/email/generate

---

## 🏗️ Tech Stack

### Backend
- Java 21
- Spring Boot 3.5.x
- REST APIs
- Groq LLM API
- Maven

### Frontend
- React
- Vite
- Material UI
- Axios

### Browser Extension
- Chrome Extension (Manifest v3)
- Content Scripts
- Gmail DOM Injection

### Deployment
- Railway (Frontend + Backend)

---

## 📂 Project Structure

Email-Reply-Generator/
│
├── email-writer-sb/        # Spring Boot backend
├── email-writer-react/     # React frontend
├── email-writer-ext/       # Browser extension
└── README.md

---

## ⚙️ Backend Setup (Local)

### Prerequisites
- Java 21
- Maven

### Environment Variable
GROQ_API_KEY=your_groq_api_key

### Run Backend
mvn spring-boot:run

---

## 🌐 Frontend Setup (Local)

cd email-writer-react
npm install
npm run dev

Create .env:
VITE_API_BASE=http://localhost:8080

---

## 🔌 API Usage

POST /api/email/generate

Request Body:
{
  "emailContent": "Can we reschedule the meeting?",
  "tone": "Professional",
  "senderName": "John"
}

---

## 🧩 Chrome Extension Setup

1. Open Chrome → chrome://extensions
2. Enable Developer Mode
3. Click Load unpacked
4. Select chrome-extension folder

---

## ☁️ Deployment (Railway)

### Backend
Build:
mvn clean package

Start:
java -jar target/*.jar

### Frontend
Build:
npm install && npm run build

Start:
npx serve -s dist -l $PORT

---

## 👨‍💻 Author

Abhishek Kushwaha  
GitHub: https://github.com/abhishekkushwaha108
