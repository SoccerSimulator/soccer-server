import mongoose, {Schema} from 'mongoose';
import moment from 'moment-timezone';

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
        default: () => moment().tz('Asia/Jerusalem').toDate() // Set createdAt to Israel timezone
    }
});

// Explicitly specify the collection name as 'Users'
const User = mongoose.model<IUser>('User', UserSchema, 'Users');
export default User;