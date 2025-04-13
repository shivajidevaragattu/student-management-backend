import express from 'express';
import 'dotenv/config';
import cors from 'cors';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
