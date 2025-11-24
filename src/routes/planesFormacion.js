import { Router } from "express";
import {getProgramaParticipante, vistaProgramaParticipante} from "../controllers/planesFormacion.js";
import { ensureAuth } from "../middleware/auth.js";


const router = Router();

//Definir rutas de user
//router.get('/test-planes',  testPlans);
//router.get('/test-programas',  testProgramas);
//router.get('/test-programas-detalles',  testProgramasDetalles);
//router.get('/test-lineas',  testLineas);
//router.get('/test-nivel-programas',  testNivelProgramas);
//router.get('/test-titulo-programas',  testTituloProgramas);
router.get('/programas-participante',  getProgramaParticipante);
router.get('/vista-programas-participante',  vistaProgramaParticipante);
//router.post('/register', register);
//router.post('/login', login);
//router.get('/profile/:id', ensureAuth, profile);
//router.get('/list/:page?', ensureAuth, listUsers);
//router.put('/update', ensureAuth, updateUser);
//router.get('/counters/:id?', ensureAuth, counters);


export default router;