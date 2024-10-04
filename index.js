import express from "express";
import "dotenv/config"
import config from "./src/utils/config.js";
import Routes from './src/routes/index.js'
import cors from  'cors'


const app = express();
const PORT = config.PORT


app.get('/', (req, res)=>{
    res.send('Hello World!')
})
app.use(express.json())

app.use(cors())


app.use(Routes)

app.listen(PORT, ()=>console.log(`App Listening on Port ${PORT}`))