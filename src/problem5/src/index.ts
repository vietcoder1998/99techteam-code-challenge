import express from 'express';
import http from 'http';
import scoreRoutes from './routes/score.routes';
import { setupWebSocket } from './ws/scoreboard.ws';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use('/api/score', scoreRoutes);

// Serve the client dashboard
app.use(express.static(path.join(__dirname, '../public')));

setupWebSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
