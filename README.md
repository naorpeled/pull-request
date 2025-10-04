# PullRequest.dev 🚀

Your AI-powered guide to making your first pull request. Discover good first issues and start contributing to open source projects.

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

## 🌟 Features

- 🤖 **AI-Powered Guide** - Natural language interface to find the perfect first issue
- 🔍 **Smart Filtering** - Filter by languages, stars, assignment status, and difficulty
- 🎨 **Beautiful UI** - Modern, responsive chat interface
- ⚡ **Fast Backend** - AWS Lambda API with fallback to direct fetching
- 📊 **Real-time Data** - Always fresh from [goodfirstissues](https://github.com/iedr/goodfirstissues)
- 🚀 **Beginner Friendly** - Helping developers make their first pull request

## 🚀 Quick Start

### Install Dependencies

```sh
pnpm install
```

### Run the Chatbot

```sh
npx nx dev web
```

Visit `http://localhost:4200` to start chatting!

### Build for Production

```sh
npx nx build web
```

## 📦 Project Structure

This is an Nx monorepo containing:

- **`apps/web`** - Next.js chatbot frontend
- **`apps/lambda-api`** - AWS Lambda backend (optional)

## 📚 Documentation

- **[Chatbot Guide](./CHATBOT-GUIDE.md)** - Complete chatbot documentation
- **[Lambda API Guide](./apps/lambda-api/README.md)** - Backend deployment guide

## 💬 Example Queries

Try asking:

- "I want to make my first pull request in JavaScript"
- "Find easy Python issues for beginners"
- "Show me popular React projects I can contribute to"
- "I'm ready for my first Rust PR"

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: AWS Lambda (optional), TypeScript
- **Data Source**: [goodfirstissues](https://github.com/iedr/goodfirstissues)
- **Deployment**: Vercel (frontend), AWS (backend)

## 🔧 Development

View available commands:

```sh
npx nx show project web
```

Build the Lambda:

```sh
npx nx build lambda-api
npx nx package lambda-api
```

## 🚢 Deployment

### Frontend (Vercel)

```sh
cd apps/web
vercel
```

### Backend (AWS Lambda)

See [Lambda API README](./apps/lambda-api/README.md) for detailed deployment instructions:

```sh
cd apps/lambda-api
sam build
sam deploy --guided
```

## 📖 Learn More

- [Nx Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## 🤝 Contributing

We welcome contributions! PullRequest.dev helps people make their first PR - how meta! 😄

Want to contribute? Check out our good first issues (of course!).

## 📄 License

MIT

## 🙏 Credits

- Data provided by [goodfirstissues](https://github.com/iedr/goodfirstissues)
- Built with [Nx](https://nx.dev), Next.js, and React
- Powered by AWS Lambda

---

**Live at [pull-request.dev](https://pull-request.dev)** | **[Chatbot Guide](./CHATBOT-GUIDE.md)** | **[Lambda API Guide](./apps/lambda-api/README.md)**
