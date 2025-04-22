import mongoose, { Document, Schema } from 'mongoose';
import argon2 from 'argon2';

// Define the User interface
export interface IUser extends Document {
    name?: string; // Optional field
    email: string;
    password: string; // Hashed password
    date: Date;
    
    checkPassword(typedPassword: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: false // Optional field
    },
    email: {
        type: String,
        required: true,
        unique: true, // Unique constraint for email
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: (props) => `${props.value} is not a valid email`,
          },
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Schema methods
UserSchema.methods.checkPassword = async function (typedPassword: string): Promise<boolean> {
    try {
        const match = await argon2.verify(this.password, typedPassword);
        return match;
    } catch (err) {
        console.error(err);
        return false; // or handle the error as needed
    }
};

UserSchema.methods.hashPassword = async function (password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64 MB
            timeCost: 3,       // Number of iterations
            parallelism: 1,    // Number of threads
        });
        return hash;
    } catch (err) {
        console.error(err);
        throw err; // Propagate error if hashing fails
    }
};

// Hook for hashing passwords
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // Skip hashing if password has not been modified
    }

    try {
        this.password = await this.hashPassword(this.password);
        next(); // Proceed with the save operation
    } catch (err : any) {
        console.error(err);
        return next(err); // Pass the error to the next middleware
    }
});

// Define the User model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;