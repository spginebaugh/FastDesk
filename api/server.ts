import express from 'express';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import cors from 'cors';
import chatHandler from './ai/chat';


// Load environment variables
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

console.log('Loading environment variables from:', {
  envPath,
  envLocalPath
});

// Load .env first (if it exists), then .env.local to override
dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

// Debug environment variables (without showing sensitive values)
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  HAS_OPENAI_KEY: !!process.env.OPENAI_API_KEY,
  ENV_FILES_LOADED: [envPath, envLocalPath].map(path => ({ 
    path, 
    exists: existsSync(path) 
  }))
});

const app = express();
const port = 5174; // Use a different port than Vite

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());

// Debug middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Wrap Vercel handler for Express
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
app.use('/api/ai/chat', vercelToExpress(chatHandler));

// Start server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 