import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import chatHandler from './ai/chat';
import parseHandler from './ai/parse';
import langsmithHandler from './ai/langsmith';
import supabaseHandler from './supabase/handler';

console.log('Starting API server...');

// Load environment variables
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

// Load .env first (if it exists), then .env.local to override
console.log('Checking for environment files...');
dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

console.log('Environment files checked:', {
  '.env': envPath,
  '.env.local': envLocalPath
});

// Debug environment
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  API_PORT: process.env.API_PORT,
  HAS_OPENAI_KEY: !!process.env.OPENAI_API_KEY,
  HAS_LANGSMITH_KEY: !!process.env.LANGSMITH_API_KEY,
  HAS_SUPABASE_URL: !!process.env.SUPABASE_URL,
  HAS_SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required');
  process.exit(1);
}

if (!process.env.LANGSMITH_API_KEY) {
  console.error('❌ LANGSMITH_API_KEY is required');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body
  });
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Adapt Vercel handlers to Express
const vercelToExpress = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// Routes
app.post('/api/ai/chat', vercelToExpress(chatHandler));
app.post('/api/ai/parse', vercelToExpress(parseHandler));
app.post('/api/ai/langsmith', vercelToExpress(langsmithHandler));
app.post('/api/supabase', vercelToExpress(supabaseHandler));

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// Start server
try {
  const server = app.listen(port, () => {
    console.log(`
🚀 API server running at http://localhost:${port}
📝 Available endpoints:
   - POST /api/ai/chat
   - POST /api/ai/parse
   - POST /api/ai/langsmith
   - POST /api/supabase
   - GET  /api/health
    `);
  });

  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
} 