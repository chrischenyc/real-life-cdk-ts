import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { users } from './routes/users';

const app = express();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// GET /
// health check, monitored by container hosting service such as AWS ECS
app.get('/', (_req, res) => {
    res.json({ message: 'server is up 🚀' });
});

app.use(morgan('tiny'));

app.use('/users', users);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
