import express from 'express';
import { ensureAuth } from "../middleware/auth.js";
import { basicRegisterColectivo, searchColectivo } from '../controllers/colectivo.js';


const router = express.Router();
// Ruta para crear un nuevo subproyecto
router.get('/searchColectivo', searchColectivo);
router.post('/addColectivo', basicRegisterColectivo);



export default router;