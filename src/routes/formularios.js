import express from 'express';
import { getCamposFormulario, getCamposM1SiNo, getCamposPorTipo, getCamposM1Diagnostico } from '../controllers/formularios.js';

const router = express.Router();

// Ruta GET para obtener los campos de un formulario específico.
// Ejemplo de uso desde el frontend: GET /api/formularios/1
// El '1' corresponde al id_formulario que quieres consultar.
router.get('/:formularioId', getCamposFormulario);
router.get('/por-tipo/2', getCamposPorTipo);
router.get('/por-tipo/M1', getCamposM1SiNo);
router.get('/por-tipo/M1-Diagnostico', getCamposM1Diagnostico)

export default router;