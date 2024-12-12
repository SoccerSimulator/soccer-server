import express, { Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Utility function to create JWT
const createToken = (user: any) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
    );
};

// Utility function to set JWT as an HttpOnly cookie
const setTokenCookie = (res: Response, token: string) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
};

// Manual Login Route
router.post(
    '/login',
    asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = createToken(user);

        // Set the JWT as an HttpOnly cookie
        setTokenCookie(res, token);

        // Respond with user details
        res.status(200).json({ user: { _id: user._id, email: user.email, username: user.username } });
    })
);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req: Request, res: Response) => {
        if (req.user) {
            const user = req.user as any; // Assuming req.user is of type IUser or IPartialUser
            const token = createToken(user);

            // Set the JWT as an HttpOnly cookie
            setTokenCookie(res, token);

            // Respond with user details
            res.status(200).json({ user: { _id: user._id, email: user.email, username: user.username } });
        } else {
            res.status(400).json({ error: 'Authentication failed' });
        }
    }
);

// Facebook Auth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req: Request, res: Response) => {
        if (req.user) {
            const user = req.user as any;
            const token = createToken(user);

            // Set the JWT as an HttpOnly cookie
            setTokenCookie(res, token);

            // Respond with user details
            res.status(200).json({ user: { _id: user._id, email: user.email, username: user.username } });
        } else {
            res.status(400).json({ error: 'Authentication failed' });
        }
    }
);

export default router;