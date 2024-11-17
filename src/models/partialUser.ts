import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';

export interface IPartialUser extends Document {
    _id: string;
    email: string;
    password?: string; // Holds the password or OAuth token from Google/Facebook/manual
    partialCreatedAt: Date;
    registrationStep: number; // Indicates the current registration step
}

export const PartialUserSchema: Schema = new Schema({
    _id: { type: String, default: uuidv4 },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional, depending on auth method
    partialCreatedAt: {
        type: Date,
        default: () => moment().tz('Asia/Jerusalem').toDate()
    },
    registrationStep: { type: Number, required: true, default: 1 }
});

const PartialUser = mongoose.model<IPartialUser>('PartialUser', PartialUserSchema, 'PartialUsers');
export default PartialUser;