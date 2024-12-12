// src/controllers/userController.ts

import { Request, Response } from 'express';

// Example of a protected route: Fetch user profile
export const getUserProfile = (req: Request, res: Response) => {
    const user = req.user;
    res.status(200).json({ message: 'User profile data', user });
};