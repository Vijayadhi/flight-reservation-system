import mongoose from "./index.js";
import  {generateUUID}  from '../utils/helper.js'
import { validate } from "uuid";
import { validateEmail } from "../common/validation.js";


const userSchema = new mongoose.Schema({
    id:{
        type: String,
        default: function (){
            return generateUUID()
        }
    },
    name:{
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        validate:{
            validator: validateEmail,
            message: props=>`${props.value} is not a valid email`
        }
    },   
    status: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum:{
            values: ["Admin", "User"],
            message: `{VALUE} is not supported`
        },
        default: "User"
    },
    password: {
        type:String,
        required:[true,"Password is required"]
    },
    createdAt: {
        type: Date,
        date: Date.now()
    }
},{
    collection: 'users',
    versionKey: false
})

export default mongoose.model('users', userSchema)