import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import bcrypt from 'bcrypt';

export interface IPartialUser extends Document {
    _id: string;
    email: string;
    password?: string; // Holds the password or OAuth token from Google/Facebook/manual
    partialCreatedAt: Date;
    isPartialUser: boolean;
    googleId?: string;
    facebookId?: string;
}

export const PartialUserSchema: Schema = new Schema({
    _id: { type: String, default: uuidv4 },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional, depending on auth method
    partialCreatedAt: {
        type: Date,
        default: () => moment().tz('Asia/Jerusalem').toDate(),
    },
    isPartialUser: { type: Boolean, required: true, default: true },
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
});

// Pre-save middleware to hash password
PartialUserSchema.pre<IPartialUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as CallbackError); // Cast `error` to `CallbackError` type
    }
});

const PartialUser = mongoose.model<IPartialUser>('PartialUser', PartialUserSchema, 'PartialUsers');
export default PartialUser;