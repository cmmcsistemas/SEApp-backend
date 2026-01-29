import { Router } from "express";
import { register, testUser, login, profile, listUsers, updateUser, counters, logout } from "../controllers/usuarios.js";
import { ensureAuth } from "../middleware/auth.js";


const router = Router();

//Definir rutas de user
router.get('/test-user',  testUser);
router.post('/register', register);
router.post('/login', login);
router.post('/logout',ensureAuth, logout);
//router.get('/profile/:id', ensureAuth, profile);
//router.get('/list/:page?', ensureAuth, listUsers);
//router.put('/update', ensureAuth, updateUser);
//router.get('/counters/:id?', ensureAuth, counters);


export default router;