
import ProgramaDetalle from '../models/programasDetalles.js';
import VistaProgramas from '../models/vistaProgramasDetalles.js';
import { Op } from 'sequelize';


export const getProgramaParticipante = async (req, res) => {
  try {
    // Extrae el ID del formulario de los parámetros de la URL
    const { detalleID } = req.params;

    const campos = await ProgramaDetalle.findAll({
      attributes: ['id_detalle', 'id_programa', 'id_linea', 'id_nivel', 'id_titulo_programa'],
    });
    if (campos.length > 0) {
      // Si se encuentran campos, responde con ellos
      res.status(200).json(campos);
    } else {
      // Si no se encuentran campos para ese formulario, responde con un 404
      res.status(404).json({ message: 'No se encontraron campos para los programas solicitados.' });
    }
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener campos del programas:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const vistaProgramaParticipante = async (req, res) => {
    try {
        const { detalleID } = req.params;

        const programas = await VistaProgramas.findAll({
            attributes: ['id_detalle', 'nombre_programa', 'nombre_linea', 'nombre_nivel', 'nombre_titulo_programa']
        });
        res.status(200).json(programas);
    } catch (error) {
            // Manejo de errores
    console.error('Error al obtener campos del programas:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
    }
    
}