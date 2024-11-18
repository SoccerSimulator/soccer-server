import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';

import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';
import './config/passportConfig';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret-key',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('MongoDB URI not found in environment variables.');
    process.exit(1);
}

mongoose
    .connect(mongoUri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // Auth routes for Google and Facebook login

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});