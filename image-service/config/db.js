const mongoose = require("mongoose")

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.DATABASE_URL)
        console.log("Connected to MongoDB")

    } catch (err) {
        console.log("MongoDB error: ", err)
        process.exit()
    }
}

module.exports = connectDB