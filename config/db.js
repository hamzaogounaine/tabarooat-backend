const  mongoose  = require("mongoose");

const connectDb = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

module.exports = connectDb