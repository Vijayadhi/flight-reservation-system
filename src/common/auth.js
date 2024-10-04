import bcrypt from 'bcryptjs'
import  jwt from 'jsonwebtoken'
import config from '../utils/config.js'


const hashPassword = async(password) =>{
    try{
        let salt = await bcrypt.genSalt(Number(config.SALT))
        let hashedPassword = await bcrypt.hash(password, salt)
        return  hashedPassword
    }
    catch (error){
        throw error
    }
}

const hashCompare = async(password, hashedPassword)=>{
    try{
        return await bcrypt.compare(password, hashedPassword)
    }
    catch (error){
        throw error
    }
}


const createToken = async(payLoad)=>{
    try{
        return await jwt.sign(
            payLoad,
            config.JWT_SECRECT,
            {expiresIn:config.JWT_TIMEOUT}

        )
    }
    catch  (error){
        throw error
    }

}

const decodeToken = async (token)=>{
    try{
        return await jwt.decode(token)
    }
    catch (error){
        throw error
    }
}


export default {
    hashPassword,
    hashCompare,
    createToken,
    decodeToken
}