// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT token from cookies
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.jwt; // Get the token from cookies

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded as any; // Attach the decoded token to the request object
        next(); // Pass control to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};