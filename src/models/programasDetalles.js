import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const ProgramaDetalle = sequelize.define('ProgramaDetalle', {
  id_detalle: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_detalle es autoincremental
    allowNull: false
  },
  id_programa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Programa' si ya lo tienes
    // references: {
    //   model: 'Programa', // Nombre del modelo al que hace referencia
    //   key: 'id_programa' // Columna de la clave primaria en el modelo 'Programa'
    // }
  },
  id_linea: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Linea'
    // references: {
    //   model: 'Linea',
    //   key: 'id_linea'
    // }
  },
  id_nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Nivel'
    // references: {
    //   model: 'Nivel',
    //   key: 'id_nivel'
    // }
  },
  id_titulo_programa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'TituloPrograma'
    // references: {
    //   model: 'TituloPrograma',
    //   key: 'id_titulo_programa'
    // }
  }
}, {
  tableName: 'programas_detalles', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default ProgramaDetalle;