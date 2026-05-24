import mongoose from 'mongoose';
import { nanoid } from 'nanoid'
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Create a schema
const developerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add a username"],
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [20, "Username must be at most 20 characters"],
        index:true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Please add an email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false, // Never returned in queries by default
    },
    apiKey: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
},
    { timestamps: true });



// Hash password before saving
developerSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    // If this.password is somehow a number (e.g., 123456), bcrypt will crash!
    this.password = await bcrypt.hash(String(this.password), 12);
});

// Instance method: compare passwords
developerSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, String(this.password));
};


// Create a model
const Developer = mongoose.model('Developer', developerSchema);

export default Developer;