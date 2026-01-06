import { Router } from "express";
import { register, testParticipante, profile, listParticipant, searchParticipant, updateUser, counters } from "../controllers/participantes.js";
import { ensureAuth } from "../middleware/auth.js";


const router = Router();

//Definir rutas de user
//router.get('/test-participant',  testParticipante);
router.post('/register', register);
router.get('/list', listParticipant);
router.get('/list/:page', listParticipant);
router.get('/search', searchParticipant);
//router.post('/login', login);
//router.get('/profile/:id', ensureAuth, profile);

//router.put('/update', ensureAuth, updateUser);
//router.get('/counters/:id?', ensureAuth, counters);


export default router;