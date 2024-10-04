import auth from "../common/auth.js";

const verify = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(" ")[2]
        
        if (token) {
            let payLoad = await auth.decodeToken(token)
            if (payLoad.exp > (Math.floor(Date.now() / 1000)))
                next()
            else {
                res.status(401).send({
                    message: "Token Expired"
                })
            }
        }
        else{
            res.status(401).send({
                message: "No Token Provided or Invalid Token"
            })
        }
    }
    catch (error) {
        res.status(500).send({
            message: error.message || "Internal Server Error"
        })
    }
}

export default verify