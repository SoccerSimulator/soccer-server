import mongoose, {CallbackError, Schema} from 'mongoose';
import moment from 'moment-timezone';
import bcrypt from 'bcrypt';

import {PartialUserSchema, IPartialUser} from './partialUser';

export interface IUser extends IPartialUser {
    username: string;
    nationality: string;
    teamName: string;
    referral?: string; // Referral code or information, optional
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    ...PartialUserSchema.obj, // Reuse PartialUserSchema fields
    username: {type: String, required: true, unique: true},
    nationality: {type: String, required: true},
    teamName: {type: String, required: true, unique: true},
    referral: {type: String},
    createdAt: {
        type: Date,
        default: () => moment().tz('Asia/Jerusalem').toDate(), // Set createdAt to Israel timezone
    },
});

// Pre-save middleware to hash password
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as CallbackError);
    }
});

// Explicitly specify the collection name as 'Users'
const User = mongoose.model<IUser>('User', UserSchema, 'Users');
export default User;