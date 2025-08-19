# AI Todo App

A modern, modular todo application with an AI assistant that helps manage your tasks using natural language. Built with Next.js, TypeScript, Tailwind CSS, Prisma, and SQLite.

## 🚀 Features

- **Smart Task Management**: Create, edit, delete, and organize todos with intuitive UI
- **AI Assistant**: Natural language task management with OpenAI integration
- **Advanced Filtering**: Filter by status, category, and priority
- **Local Database**: SQLite database with Prisma ORM for reliable data persistence
- **Modular Architecture**: Clean, maintainable codebase with separated concerns
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Optimistic UI updates for smooth user experience
- **Category System**: Organize todos by Work, Personal, Health, and Learning

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI**: OpenAI GPT-4
- **Development**: ESLint, TypeScript

## 📦 Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd todo_ai
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# OpenAI API Key
OPENAI_API_KEY=your_actual_openai_api_key_here
```

**Get your OpenAI API key from**: https://platform.openai.com/api-keys

### 3. Initialize the Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) View your database
npx prisma studio
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 Using the AI Assistant

The AI assistant is integrated into the right sidebar (desktop) or accessible via a floating button (mobile). You can interact with it using natural language:

### Example Commands:

```
✨ Creating Todos:
"Create a todo for buying groceries tomorrow"
"Add a high priority work task to review project proposals"
"Make a learning todo to study React hooks"

📋 Managing Todos:
"Show me all my pending todos"
"Mark the grocery shopping task as complete"
"Update the meeting todo to high priority"
"Delete all completed todos"

🔍 Searching & Filtering:
"Find todos about meetings"
"Show me all high priority tasks"
"List my health-related todos"
```

## 🗄️ Database Schema

```sql
-- Categories for organizing todos
Category {
  id        String   @id
  name      String   @unique
  color     String
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

-- Main todo items
Todo {
  id          String   @id @default(cuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  priority    Priority @default(MEDIUM)
  dueDate     DateTime
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── todos/route.ts      # CRUD operations for todos
│   │   └── ai-chat/route.ts    # AI assistant endpoint
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main application page
├── components/
│   ├── AIChat.tsx              # AI chat interface
│   ├── AIChatModal.tsx         # Mobile chat modal
│   ├── TodoForm.tsx            # Create/edit todo form
│   └── TodoItem.tsx            # Individual todo component
├── hooks/
│   ├── useAIChat.ts            # AI chat logic
│   └── useTodos.ts             # Todo management logic
├── lib/
│   └── prisma.ts               # Database client
├── services/
│   ├── aiChatService.ts        # AI API communication
│   ├── databaseService.ts      # Database operations
│   └── todoService.ts          # Todo API calls
├── types/
│   └── index.ts                # TypeScript definitions
└── utils/
    └── todoUtils.ts            # Helper functions
```

## 🔧 Database Commands

```bash
# View database in browser
npx prisma studio

# Reset database (⚠️ This will delete all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL="file:./dev.db"`
   - `OPENAI_API_KEY=your_api_key`
4. Deploy

### Other Platforms

For other deployment platforms, ensure you:
1. Set the environment variables
2. Run `npx prisma generate` during build
3. Run `npx prisma migrate deploy` for production

## 📝 Development Notes

- The app uses optimistic updates for smooth UX
- SQLite database is stored locally as `dev.db`
- Prisma handles all database operations with type safety
- The AI assistant uses OpenAI's function calling for structured responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run build`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).