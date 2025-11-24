import VistaProgramaDetalle from '../models/vistaProgramasDetalles.js';
import ProgramaDetalle from '../models/programasDetalles.js';
import { Op } from 'sequelize';


export const getProgramaParticipante = async (req, res) => {
  try {
    // Extrae el ID del formulario de los parámetros de la URL
    const { detalleID } = req.params;

    const campos = await ProgramaDetalle.findAll({
      where: {
        id_detalle: detalleID
      },
      order: [
        ['id_detalle', 'ASC'] 
      ]
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