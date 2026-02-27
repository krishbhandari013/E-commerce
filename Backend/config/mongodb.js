import mongoose from "mongoose"

const connectDB = async () => {

    mongoose.connection.on("connected",()=>{
        console.log("database connected")
    })

    await mongoose.connect(`${process.env.MONGoDB_URL}/E-comm`) //url or our database
}
export default connectDB;