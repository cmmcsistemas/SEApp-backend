import CampoFormulario from '../models/camposFormulario.js';
import { Op } from 'sequelize';

// Controlador para obtener campos de formulario
export const getCamposFormulario = async (req, res) => {
  try {
    // Extrae el ID del formulario de los parámetros de la URL
    const { formularioId } = req.params;

      // Busca todos los campos de formulario que coincidan con el id_formulario proporcionado
    const campos = await CampoFormulario.findAll({
      where: {
        id_campo: formularioId
      },
      order: [
        ['id_campo', 'ASC'] // Opcional: ordena los campos por su ID
      ]
    });

    if (campos.length > 0) {
      // Si se encuentran campos, responde con ellos
      res.status(200).json(campos);
    } else {
      // Si no se encuentran campos para ese formulario, responde con un 404
      res.status(404).json({ message: 'No se encontraron campos para el formulario solicitado.' });
    }
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener campos del formulario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Nuevo método para obtener campos por tipo
export const getCamposPorTipo = async (req, res) => {
    try {
      // Busca todos los campos que tengan id_tipo = 2
      const campos = await CampoFormulario.findAll({
        where: {
          id_tipo: 2
        },
        attributes: ['id_campo', 'nombre_campo', 'opciones'] // Selecciona solo las columnas que necesitas
      });
  
      if (campos.length > 0) {
        // Mapea los resultados para procesar las opciones
        const camposProcesados = campos.map(campo => {
          // Asume que el getter en el modelo maneja el JSON
          const opciones = Array.isArray(campo.opciones) ? campo.opciones : (campo.opciones ? campo.opciones.split(',') : []);
          return {
            id_campo: campo.id_campo,
            nombre_campo: campo.nombre_campo,
            opciones: opciones.map(opcion => opcion.trim()) // Elimina espacios en blanco
          };
        });
        res.status(200).json(camposProcesados);
      } else {
        res.status(404).json({ message: 'No se encontraron campos con id_tipo = 2.' });
      }
    } catch (error) {
      console.error('Error al obtener campos por tipo:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  };

  // Nuevo metodo para obtener campos de tipo 6 => M1 preguntas si o no

  export const getCamposM1SiNo = async (req, res) => {
    try {
      // Busca todos los campos que tengan id_tipo = 6
      const campos = await CampoFormulario.findAll({
        where: {
          id_tipo: 6,
          id_campo: {
            [Op.between]: [109, 121]  }
        },
        attributes: ['id_campo', 'nombre_campo', 'opciones'] // Selecciona solo las columnas que necesitas
      });
  
      if (campos.length > 0) {
        // Mapea los resultados para procesar las opciones
        const camposProcesados = campos.map(campo => {
          // Asume que el getter en el modelo maneja el JSON
          const opciones = Array.isArray(campo.opciones) ? campo.opciones : (campo.opciones ? campo.opciones.split(',') : []);
          return {
            id_campo: campo.id_campo,
            nombre_campo: campo.nombre_campo,
            opciones: opciones.map(opcion => opcion.trim()) // Elimina espacios en blanco
          };
        });
        res.status(200).json(camposProcesados);
      } else {
        res.status(404).json({ message: 'No se encontraron campos con id_tipo = 6.' });
      }
    } catch (error) {
      console.error('Error al obtener campos por tipo:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  };

  export const getCamposM1Diagnostico = async (req, res) => {
    try {
      // Busca todos los campos que tengan id_tipo = 6
      const campos = await CampoFormulario.findAll({
        where: {
          id_tipo: 6,
          id_campo: {
            [Op.between]: [1140, 1184]  }
        },
        attributes: ['id_campo', 'nombre_campo', 'opciones'] // Selecciona solo las columnas que necesitas
      });
  
      if (campos.length > 0) {
        // Mapea los resultados para procesar las opciones
        const camposProcesados = campos.map(campo => {
          // Asume que el getter en el modelo maneja el JSON
          const opciones = Array.isArray(campo.opciones) ? campo.opciones : (campo.opciones ? campo.opciones.split(',') : []);
          return {
            id_campo: campo.id_campo,
            nombre_campo: campo.nombre_campo,
            opciones: opciones.map(opcion => opcion.trim()) // Elimina espacios en blanco
          };
        });
        res.status(200).json(camposProcesados);
      } else {
        res.status(404).json({ message: 'No se encontraron campos con id_tipo = 6.' });
      }
    } catch (error) {
      console.error('Error al obtener campos por tipo:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  };

// Puedes añadir más métodos aquí, como para crear, actualizar o eliminar campos.
// Por ejemplo, para crear un nuevo campo:
// export const createCampoFormulario = async (req, res) => {
//   try {
//     const { id_formulario, nombre_campo, tipo_campo, opciones, requerido } = req.body;
//     const newCampo = await CampoFormulario.create({ id_formulario, nombre_campo, tipo_campo, opciones, requerido });
//     res.status(201).json(newCampo);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
