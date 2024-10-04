import express from 'express'
import userService from '../service/user.service.js'
import verify from '../middleware/verify.js';

const routes = express.Router()

routes.post('/create_user', userService.createUser );
routes.get('/get_userByEmail',verify, userService.getUserByEmail);
routes.post('/user_login',  userService.userLogin);


export default routes