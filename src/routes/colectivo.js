import express from 'express';
import { ensureAuth } from "../middleware/auth.js";
import { basicRegisterColectivo, getColectivosXML, searchColectivo, getKoboDataByColectivo, extendRegisterColectivo } from '../controllers/colectivo.js';


const router = express.Router();
// Ruta para crear un nuevo subproyecto
router.get('/searchColectivo', searchColectivo);
router.post('/addColectivo', basicRegisterColectivo);
router.get('/application/xml', getColectivosXML);
router.get('/kobo-data/:id_colectivo', getKoboDataByColectivo);
router.get('/addExtendColectivo', extendRegisterColectivo);



export default router;