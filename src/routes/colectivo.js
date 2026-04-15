import express from 'express';
import { ensureAuth } from "../middleware/auth.js";
import { searchColectivo } from '../controllers/colectivo.js';


const router = express.Router();
// Ruta para crear un nuevo subproyecto
router.post('/searchColectivo', searchColectivo);


export default router;