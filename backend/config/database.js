import mongoose from "mongoose";

let isConnecting = false;

const dbConfig = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    if (isConnecting) return mongoose.connection;

    try {
        isConnecting = true;
        const conn = await mongoose.connect(process.env.DB_URL, {
            dbName: "iti_Nodejs",
        });
        console.log(`Database connected on ${conn.connection.host} | DB: ${conn.connection.name}`);
        return conn.connection;
    } catch (err) {
        console.log(`Error: ${err.message}`);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw err;
    } finally {
        isConnecting = false;
    }
};

export default dbConfig;
