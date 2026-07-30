import express from 'express';
import { ensureAuth } from "../middleware/auth.js";
import { basicRegisterColectivo,recibirDatosKoboVisitaTecnicaUno, exportarColectivosExcel, getColectivosXML, searchColectivo, getKoboDataByColectivo, extendRegisterColectivo, recibirDatosKoboDiagnosticoTecnico, recibirDatosKoboMonitoreoSeguimiento, listadoColectivos } from '../controllers/colectivo.js';


const router = express.Router();
// Ruta para crear un nuevo subproyecto
router.get('/searchColectivo', searchColectivo);
router.post('/addColectivo', basicRegisterColectivo);
router.get('/application/xml', getColectivosXML);
router.get('/kobo-data/:id_colectivo', getKoboDataByColectivo);
router.post('/addExtendColectivo', extendRegisterColectivo);
router.get('/informe-kobo-participantes/', exportarColectivosExcel);
router.post('/register-from-kobo-visita-tecnica', recibirDatosKoboVisitaTecnicaUno);
router.post('/register-from-kobo-monitoreo-seguimiento', recibirDatosKoboMonitoreoSeguimiento);
router.post('/register-from-kobo-diagnostico-tecnico', recibirDatosKoboDiagnosticoTecnico);
router.get('/reportes/colectivos', listadoColectivos);


export default router;