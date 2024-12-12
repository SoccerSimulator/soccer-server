import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';

import User from '../models/user';
import PartialUser from '../models/partialUser';

// Check if environment variables exist for Google and Facebook
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth credentials are not provided.');
    process.exit(1);
}

if (!process.env.FACEBOOK_CLIENT_ID || !process.env.FACEBOOK_CLIENT_SECRET) {
    console.error('Facebook OAuth credentials are not provided.');
    process.exit(1);
}

// Helper function to find or create a partial user or full user
const findOrCreateUserByEmail = async (profile: GoogleProfile | FacebookProfile, provider: string) => {
    const email = profile.emails?.[0]?.value;

    if (!email) {
        throw new Error('Email not provided by OAuth provider');
    }

    // Try to find a complete user by email
    let user = await User.findOne({ email });
    if (user) {
        return {
            user,
            isPartialUser: false,
        };
    }

    // If no complete user is found, try to find a partial user by email
    let partialUser = await PartialUser.findOne({ email });
    if (!partialUser) {
        // Create a new PartialUser since it does not exist
        partialUser = new PartialUser({
            email,
            username: profile.displayName,
            [`${provider}Id`]: profile.id,
            isPartialUser: true, // Indicate the user is still in the registration process
            partialCreatedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }),
        });
        await partialUser.save();
    }

    return {
        user: partialUser,
        isPartialUser: true,
    };
};

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.NGROK_URL}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile: GoogleProfile, done) => {
            try {
                const { user, isPartialUser } = await findOrCreateUserByEmail(profile, 'google');
                console.log(`User authenticated with Google:`, profile);

                // Attach the additional information to the user object
                user.isPartialUser = isPartialUser;

                done(null, user);
            } catch (error) {
                console.error('Error during Google authentication:', error);
                done(error);
            }
        }
    )
);

// Facebook OAuth Strategy (Updated similarly)
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            callbackURL: process.env.NODE_ENV === 'production'
                ? 'https://yourdomain.com/api/auth/facebook/callback'
                : `${process.env.NGROK_URL}/api/auth/facebook/callback`,
            profileFields: ['id', 'displayName', 'emails'],
        },
        async (accessToken, refreshToken, profile: FacebookProfile, done) => {
            try {
                const { user, isPartialUser } = await findOrCreateUserByEmail(profile, 'facebook');
                console.log(`User authenticated with Facebook:`, profile);

                // Attach the additional information to the user object
                user.isPartialUser = isPartialUser;

                done(null, user);
            } catch (error) {
                console.error('Error during Facebook authentication:', error);
                done(error);
            }
        }
    )
);

// Serialize user
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        let user = await User.findById(id);
        if (!user) {
            user = await PartialUser.findById(id);
        }
        done(null, user);
    } catch (error) {
        console.error('Error during deserialization:', error);
        done(error);
    }
});

export default passport;