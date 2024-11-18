import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google Auth Routes
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get(
    '/google/callback',
    passport.authenticate('google', {session: false}),
    (req, res) => {
        // If authentication is successful, the user will be available on req.user
        if (req.user) {
            res.status(200).json(req.user); // Directly return the user or partial user details
        } else {
            res.status(400).json({error: 'Authentication failed'});
        }
    }
);

// Facebook Auth Routes
router.get('/facebook', passport.authenticate('facebook', {scope: ['public_profile,email']}));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', {session: false}),
    (req, res) => {
        // If authentication is successful, the user will be available on req.user
        if (req.user) {
            res.status(200).json(req.user); // Directly return the user or partial user details
        } else {
            res.status(400).json({error: 'Authentication failed'});
        }
    }
);

// Failure route to handle failed authentication
router.get('/failure', (req, res) => {
    res.send('Failed to authenticate');
});

export default router;