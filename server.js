
import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server LDWeb avviato su http://localhost:${PORT}`);
});
