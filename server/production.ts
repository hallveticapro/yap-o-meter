import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const app = express();
  const PORT = parseInt(process.env.PORT || '5000', 10);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register API routes
  await registerRoutes(app);

  // Serve static files from the built frontend
  app.use(express.static(path.join(__dirname, 'public')));

  // Catch-all handler: send back React's index.html file for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
