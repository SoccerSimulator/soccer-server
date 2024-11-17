import { Request, Response, NextFunction } from 'express';

import User from '../models/user';
import PartialUser from '../models/partialUser';

export const validateEmailAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).send({ error: 'User already exists with this email' });
            return;
        }

        const existingPartialUser = await PartialUser.findOne({ email });
        if (existingPartialUser) {
            res.status(400).send({ error: 'Partial user already exists with this email' });
            return;
        }

        next(); // Move to the next middleware/route handler
    } catch (error) {
        console.error('Error validating email availability:', error);
        next(error); // Pass the error to the error handling middleware
    }
};