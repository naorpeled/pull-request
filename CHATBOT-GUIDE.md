# PullRequest.dev - AI Chatbot Guide

Your intelligent guide to discovering good first issues and making your first pull request to open source projects.

## 🎯 Features

### **Intelligent Conversation**
- Natural language processing to understand user intent
- Recognizes programming languages (JavaScript, Python, Rust, Go, etc.)
- Detects preferences for repository popularity, issue difficulty, and assignment status

### **Smart Filtering**
- Filter by programming languages
- Filter by repository stars (popularity)
- Show only unassigned issues
- Limit by number of comments (for beginner-friendly issues)

### **Beautiful UI**
- Modern, responsive chat interface
- Quick filter buttons for common queries
- Real-time issue cards with repository information
- Animated loading states
- Mobile-friendly design

### **Flexible Backend**
- Can use AWS Lambda API (if deployed)
- Falls back to direct GitHub fetching if Lambda not available
- Built-in caching and filtering in Next.js API routes

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run the Development Server

```bash
npx nx dev web
```

The chatbot will be available at `http://localhost:4200`

### 3. (Optional) Configure Lambda API

If you've deployed the AWS Lambda backend:

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   ```

2. Add your Lambda API Gateway URL:
   ```
   LAMBDA_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/issues
   ```

If not configured, the app will fetch directly from GitHub (works great for development!).

## 💬 How to Use

### Example Queries

**By Language:**
- "Show me JavaScript issues"
- "Find Python good first issues"
- "I want to contribute to Rust projects"

**By Popularity:**
- "Show me popular React issues"
- "Find issues from famous repositories"

**By Status:**
- "Show unassigned JavaScript issues"
- "Find available Python issues"

**For Beginners:**
- "Show me easy JavaScript issues"
- "Find beginner-friendly Python issues"
- "I'm new to React, what can I work on?"

### Quick Filters

Use the quick filter buttons at the top for instant results:
- 🟨 JavaScript
- 🐍 Python
- ⚛️ React
- 🦀 Rust
- 🔥 Popular (500+ stars)
- 🆕 Recent

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                      (Next.js Frontend)                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
                    ┌────────────────┐
                    │  Chat API      │
                    │  /api/chat     │
                    └────────┬───────┘
                             │
                             ↓
                    ┌────────────────┐
                    │  Issues API    │
                    │  /api/issues   │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                ↓                         ↓
      ┌─────────────────┐      ┌──────────────────┐
      │  AWS Lambda     │      │  GitHub Direct   │
      │  (Optional)     │      │  (Fallback)      │
      └─────────────────┘      └──────────────────┘
                │                        │
                └────────────┬───────────┘
                             ↓
                ┌────────────────────────┐
                │  goodfirstissues       │
                │  GitHub Repository     │
                └────────────────────────┘
```

## 📁 File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main chatbot page
│   │   ├── layout.tsx            # Root layout
│   │   └── api/
│   │       ├── chat/route.ts     # Chat logic & intent parsing
│   │       └── issues/route.ts   # Issue fetching & filtering
│   ├── components/
│   │   ├── ChatMessage.tsx       # Individual message component
│   │   ├── ChatInput.tsx         # Message input component
│   │   ├── IssueCard.tsx         # Issue display card
│   │   └── QuickFilters.tsx      # Quick filter buttons
│   └── types/
│       └── issue.ts              # TypeScript types
```

## 🎨 Customization

### Adding New Languages

Edit `apps/web/src/app/api/chat/route.ts`:

```typescript
const languageKeywords = {
  javascript: ['javascript', 'js', 'node'],
  // Add your language here:
  kotlin: ['kotlin', 'kt'],
};
```

### Modifying Quick Filters

Edit `apps/web/src/components/QuickFilters.tsx`:

```typescript
const filters = [
  { label: '🟨 JavaScript', query: 'Show me JavaScript issues' },
  // Add your filter here:
  { label: '☕ Java', query: 'Show me Java issues' },
];
```

### Changing the Welcome Message

Edit `apps/web/src/app/page.tsx`:

```typescript
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    role: 'assistant',
    content: "Your custom welcome message here!",
    timestamp: new Date(),
  },
]);
```

## 🔧 API Routes

### `/api/chat` (POST)

Processes user messages and returns filtered issues.

**Request:**
```json
{
  "message": "Show me JavaScript issues"
}
```

**Response:**
```json
{
  "success": true,
  "message": "I found 150 good first issues for javascript...",
  "issues": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 5
  }
}
```

### `/api/issues` (GET)

Fetches and filters issues.

**Query Parameters:**
- `languages` - Comma-separated languages (e.g., `javascript,python`)
- `minStars` - Minimum repository stars
- `maxComments` - Maximum issue comments
- `unassignedOnly` - `true` to show only unassigned issues
- `page` - Page number for pagination
- `limit` - Number of results per page

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `LAMBDA_API_URL` (optional) - Your Lambda API Gateway URL

## 🎯 Future Enhancements

- [ ] Add user authentication
- [ ] Save favorite issues
- [ ] Issue bookmarking
- [ ] Email notifications for new issues
- [ ] Integration with GitHub OAuth
- [ ] Contribution tracking
- [ ] Repository recommendations based on skills
- [ ] Multi-language support for UI

## 🤝 Contributing

We welcome contributions! The chatbot itself helps people contribute to open source - how meta! 😄

## 📝 License

MIT

## 🙏 Credits

- Data provided by [goodfirstissues](https://github.com/iedr/goodfirstissues)
- Built with Next.js, React, and Tailwind CSS
- Deployed on AWS Lambda (optional)

