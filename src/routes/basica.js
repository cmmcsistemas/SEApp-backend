
import express from 'express';
import { ensureAuth } from "../middleware/auth.js";
import {findAllSubProyectos, findGroupMunicipio, findAllDepartamentos, findAllDiscapacidades, findAllGrupoVulnerable, findAllEtnias, findAllPaises, findAllGeneros, findAllMunicipios, findOneSubProyecto, createSubProyecto, updateSubProyecto, deleteSubProyecto} from "../controllers/basica.js";

const router = express.Router();
// Ruta para crear un nuevo subproyecto
router.post('/subproyectos', createSubProyecto);
// Rutas para consultas
router.get('/subproyectos', findAllSubProyectos);
router.get('/municipios', findAllMunicipios);
router.get('/departamentos', findAllDepartamentos);
router.get('/paises', findAllPaises);
router.get('/generos', findAllGeneros);
router.get('/etnias', findAllEtnias);
router.get('/discapacidades', findAllDiscapacidades);
router.get('/vulnerable', findAllGrupoVulnerable);

// Rutas que tienen llaves foraneas
router.get('/municipios/:id', findGroupMunicipio);

// Ruta para obtener un solo subproyecto por su ID
router.get('/subproyectos/:id', findOneSubProyecto);
// Ruta para actualizar un subproyecto por su ID
router.put('/subproyectos/:id', updateSubProyecto);
// Ruta para eliminar un subproyecto por su ID
router.delete('/subproyectos/:id', deleteSubProyecto);

export default router;