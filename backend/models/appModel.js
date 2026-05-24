import mongoose from 'mongoose';


const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a application name"],
        trim: true,
        unique: true,
        match: [/^\S+$/, "Application name must not contain whitespaces"],
        minlength: [3, "Name must be at least 3 characters"],
        maxlength: [100, "Name must be at most 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        minlength: [10, "Description must be at least 10 characters"],
        maxlength: [200, "Description must be at most 200 characters"],
    },
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Developer",
        required: true,
    },
},
    { timestamps: true });


// Cascade-delete all logs when an application is removed
applicationSchema.pre(
    "findOneAndDelete",
    async function () {
        const doc = await this.model.findOne(this.getFilter());
        if (doc) {
            await mongoose.model("Log").deleteMany({ application: doc._id });
        }
    }
);


const Application = mongoose.model("Application", applicationSchema);
export default Application;