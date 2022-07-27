import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

const app = express();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));

// GET /
// health check, monitored by container hosting service such as AWS ECS
app.get('/', (_req, res) => {
    res.status(200).json({ message: 'server is up 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
