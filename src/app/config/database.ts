import mongoose from "mongoose";

let connectionPromise: ReturnType<typeof mongoose.connect> | null = null;

const dbConnect = async () => {
    if (mongoose.connection.readyState === 1) return mongoose;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not configured");

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    return connectionPromise;
};

export default dbConnect;