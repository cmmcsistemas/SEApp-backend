import express from 'express';
import { getCamposFormulario, getCamposM1SiNo, getCamposPorTipo, getCamposM1Diagnostico } from '../controllers/formularios.js';
import { getEnketoPreview, getFormKobo, recibirDatosKobo,recibirDatosKoboAmpliada, recibirDatosParticipantesKobo } from '../controllers/kobo.js';
import { ensureAuth } from "../middleware/auth.js";

const router = express.Router();

// Ruta GET para obtener los campos de un formulario específico.
// Ejemplo de uso desde el frontend: GET /api/formularios/1
// El '1' corresponde al id_formulario que quieres consultar.
//router.get('/:formularioId', getCamposFormulario);
router.get('/por-tipo/:id_tipo', getCamposPorTipo);
router.get('/por-tipo/M1', getCamposM1SiNo);
router.get('/por-tipo/M1-Diagnostico', getCamposM1Diagnostico);
router.get('/kobo-preview/:asset_uid', getEnketoPreview);
router.get('/kobo', ensureAuth, getFormKobo);
router.post('/register-from-kobo/', recibirDatosKobo);
router.post('/register-from-kobo-amplida/', recibirDatosKoboAmpliada);
router.get('/obtener-participantes', recibirDatosParticipantesKobo);

export default router;