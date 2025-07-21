import express from 'express';
import resourceRoutes from './routes/resource.routes';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/resources', resourceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
