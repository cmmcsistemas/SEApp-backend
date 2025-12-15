// controllers/basica.js
import SubProyecto from '../models/subProyecto.js';
import Municipio from '../models/municipio.js';
import Pais from '../models/pais.js';
import Generos from '../models/generos.js';
import Etnias from '../models/etnias.js';
import Discapacidades from '../models/discapacidades.js';
import GrupoVulnerable from '../models/grupoVulnerable.js';
import Departamento from '../models/departamento.js';
import Localidad from '../models/localidades.js';
import Ciiu from '../models/ciiu.js';

// Crear y guardar un nuevo subproyecto
export const createSubProyecto = async (req, res) => {
  try {
    const { nombre_subproyecto, fase_subproyecto, id_proyecto } = req.body;

    if (!nombre_subproyecto || !fase_subproyecto || !id_proyecto) {
      return res.status(400).json({ message: 'El nombre, la fase y el ID del proyecto son obligatorios.' });
    }

    const nuevoSubProyecto = await SubProyecto.create({
      nombre_subproyecto,
      fase_subproyecto,
      id_proyecto,
    });

    res.status(201).json(nuevoSubProyecto);
  } catch (error) {
    console.error('Error al crear subproyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Obtener codigo CIIU

export const findCiiuCode = async (req, res) => {
  try {
    const ciiu = await Ciiu.findAll ({
      attributes: ['id','data'],
    });
    res.status(200).json(ciiu);
  } catch (error) {
    console.error('Error al obtener codigo ciiu:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

// Obtener todos los subproyectos con columnas específicas
export const findAllSubProyectos = async (req, res) => {
  try {
    const subproyectos = await SubProyecto.findAll({
      attributes: ['id_subproyecto', 'nombre_subproyecto'],
    });

    res.status(200).json(subproyectos);
  } catch (error) {
    console.error('Error al obtener subproyectos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


export const findAllLocalidades = async (req, res) => {
  try {
    const localidades = await Localidad.findAll({
      attributes: ['id_localidad', 'id_municipio', 'nombre_localidad'],

    });
    res.status(200).json(localidades);
  } catch (error) {
    console.error('Error al obtener localidades:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }


};

export const findAllMunicipios = async (req, res) => {
  try {
    const municipios = await Municipio.findAll({
      attributes: ['id_municipio', 'nombre_municipio'],
    });

    res.status(200).json(municipios);
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const findAllDepartamentos = async (req, res) => {
  try {
    const departamentos = await Departamento.findAll({
      attributes: ['id_departamento', 'nombre_departamento'],
    });

    res.status(200).json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const findAllPaises = async (req, res) => {
  try {
    const paises = await Pais.findAll({
      attributes: ['id_pais', 'nombre_pais'],
    });

    res.status(200).json(paises);
  } catch (error) {
    console.error('Error al obtener paises:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const findAllGeneros = async (req, res) => {
  try {
    const genero = await Generos.findAll({
      attributes: ['id_genero', 'tipo_genero'],
    });

    res.status(200).json(genero);
  } catch (error) {
    console.error('Error al obtener generos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const findAllEtnias = async (req, res) => {
  try {
    const etnia = await Etnias.findAll({
      attributes: ['id_etnia', 'tipo_etnia'],
    });

    res.status(200).json(etnia);
  } catch (error) {
    console.error('Error al obtener etnias:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const findAllDiscapacidades = async (req, res) => {
  try {
    const discapacidad = await Discapacidades.findAll({
      attributes: ['id_discapacidad', 'tipo_discapacidad'],
    });

    res.status(200).json(discapacidad);
  } catch (error) {
    console.error('Error al obtener discapacidades:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const findAllGrupoVulnerable = async (req, res) => {
  try {
    const grupoVulnerable = await GrupoVulnerable.findAll({
      attributes: ['id_grupo', 'tipo_grupo'],
    });

    res.status(200).json(grupoVulnerable);
  } catch (error) {
    console.error('Error al obtener grupos vulnerables:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Encontrar un solo subproyecto por su ID
export const findOneSubProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const subproyecto = await SubProyecto.findByPk(id);

    if (subproyecto) {
      res.status(200).json(subproyecto);
    } else {
      res.status(404).json({ message: `No se encontró un subproyecto con el id=${id}.` });
    }
  } catch (error) {
    console.error('Error al obtener subproyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

//Encontrar municipio por el id del departamento
export const findGroupMunicipio = async (req, res) => {
  try {
    const { id } = req.params;
    const municipios = await Municipio.findAll({
      where:{
        id_departamento: id
      },
      attributes: ['id_municipio', 'nombre_municipio']
    });

    if (municipios && municipios.length > 0) {
      res.status(200).json(municipios);
    } else {
      res.status(404).json({ message: `No se encontraron municipios con el id=${id}.` });
    }
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualizar un subproyecto por su ID
export const updateSubProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const [numFilasActualizadas] = await SubProyecto.update(req.body, {
      where: { id_subproyecto: id },
    });

    if (numFilasActualizadas === 1) {
      const subproyectoActualizado = await SubProyecto.findByPk(id);
      res.status(200).json({
        message: 'El subproyecto fue actualizado correctamente.',
        data: subproyectoActualizado,
      });
    } else {
      res.status(404).json({ message: `No se puede actualizar el subproyecto con id=${id}.` });
    }
  } catch (error) {
    console.error('Error al actualizar subproyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Eliminar un subproyecto por su ID
export const deleteSubProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const numFilasEliminadas = await SubProyecto.destroy({
      where: { id_subproyecto: id },
    });

    if (numFilasEliminadas === 1) {
      res.status(200).json({ message: 'El subproyecto fue eliminado correctamente.' });
    } else {
      res.status(404).json({ message: `No se puede eliminar el subproyecto con id=${id}.` });
    }
  } catch (error) {
    console.error('Error al eliminar subproyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};