import mongoose from "mongoose";

let connectionPromise = null;

const dbConfig = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        await connectionPromise;
        return mongoose.connection;
    }

    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
        throw new Error("DB_URL is not configured");
    }

    try {
        connectionPromise = mongoose.connect(dbUrl, {
            dbName: "iti_Nodejs",
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });

        const conn = await connectionPromise;
        console.log(`Database connected on ${conn.connection.host} | DB: ${conn.connection.name}`);
        return conn.connection;
    } catch (err) {
        connectionPromise = null;
        console.log(`Error: ${err.message}`);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw err;
    }
};

export default dbConfig;
