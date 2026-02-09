import { Router } from "express";
import { register, getFormularioCompleto,saveAdditionalData, profile, listParticipant, searchParticipant, updateUser, counters } from "../controllers/participantes.js";
import { ensureAuth } from "../middleware/auth.js";


const router = Router();

//Definir rutas de user
//router.get('/test-participant',  testParticipante);
router.post('/register', register);
router.post('/add-data', saveAdditionalData);
router.get('/list', listParticipant);
router.get('/list/:page', listParticipant);
router.get('/search', searchParticipant);
// routes/participantes.js
router.get('/formulario-completo/', ensureAuth, getFormularioCompleto);
//router.post('/login', login);
//router.get('/profile/:id', ensureAuth, profile);

//router.put('/update', ensureAuth, updateUser);
//router.get('/counters/:id?', ensureAuth, counters);


export default router;