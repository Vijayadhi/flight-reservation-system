import mongoose from "mongoose";
import config from "../utils/config.js";

main().catch((error)=>console.log("Mongodb Connection Failed", error))

async function main() {
    await  mongoose.connect(`${config.DB_URL}/${config.DB_NAME}`)
    console.log("MongoDB Connected");
    
}

export default mongoose