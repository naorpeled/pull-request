# 🚀 PullRequest.dev - Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Install Dependencies

```bash
pnpm install
```

### 2️⃣ Start the Chatbot

```bash
npx nx dev web
```

### 3️⃣ Open Your Browser

Visit: **http://localhost:4200**

---

## 💬 Try These Queries

Once the chatbot loads, try asking:

```
"I want to make my first pull request in JavaScript"
```

```
"Find easy Python issues for beginners"
```

```
"Help me contribute to a popular React project"
```

```
"I'm ready for my first Rust PR"
```

---

## 🎨 What You'll See

### Chat Interface
A beautiful, modern chat interface where you can:
- 💬 Ask for issues in natural language
- 🔍 Get filtered results instantly
- 📊 See issue details with stars, languages, and labels
- 🔗 Click to go directly to GitHub

### Quick Filters
One-click buttons for:
- 🟨 JavaScript
- 🐍 Python  
- ⚛️ React
- 🦀 Rust
- 🔥 Popular (500+ stars)
- 🆕 Recent

---

## 📁 Project Structure

```
pull-request/
├── apps/
│   ├── web/              # Next.js chatbot frontend
│   └── lambda-api/       # AWS Lambda backend (optional)
├── README.md             # Project overview
├── CHATBOT-GUIDE.md      # Detailed chatbot docs
└── PROJECT-SUMMARY.md    # Complete summary
```

---

## 🚢 Deploy to Production

### Option 1: Frontend Only (Easiest)

The chatbot works without deploying the Lambda! It fetches directly from GitHub.

```bash
cd apps/web
vercel
```

### Option 2: Full Stack (Lambda + Frontend)

**Step 1: Deploy Lambda**
```bash
cd apps/lambda-api
sam build
sam deploy --guided
```

**Step 2: Configure Next.js**
```bash
# Add to apps/web/.env.local
LAMBDA_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/issues
```

**Step 3: Deploy Frontend**
```bash
cd apps/web
vercel
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[CHATBOT-GUIDE.md](./CHATBOT-GUIDE.md)** - Complete chatbot documentation  
- **[PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)** - Technical deep dive
- **[Lambda README](./apps/lambda-api/README.md)** - Backend deployment

---

## 🆘 Troubleshooting

### Port Already in Use?

```bash
# Kill the process on port 4200
lsof -ti:4200 | xargs kill -9

# Or use a different port
PORT=3000 npx nx dev web
```

### Build Errors?

```bash
# Clean and rebuild
npx nx reset
pnpm install
npx nx build web
```

### Issues Not Loading?

Check the browser console for errors. The app will:
1. Try Lambda API (if `LAMBDA_API_URL` is set)
2. Fall back to direct GitHub fetch
3. Show error message if both fail

---

## ✨ Features

- ✅ Natural language chat interface
- ✅ Smart filtering (languages, stars, assignment)
- ✅ Beautiful UI with Tailwind CSS 4
- ✅ Real-time data from goodfirstissues
- ✅ Mobile responsive
- ✅ Works with or without Lambda backend
- ✅ Fully typed with TypeScript
- ✅ Production ready

---

## 🎉 You're Ready!

PullRequest.dev is now running and ready to help you make your first (or next) pull request!

**Happy Contributing! 🚀**

---

**Visit [pull-request.dev](https://pull-request.dev) for the live version**

