import express from "express"
import userRoutes from  "./user.routes.js"


const routes = express.Router();

routes.use('/user', userRoutes);

export default routes;