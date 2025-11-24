import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const VistaProgramaDetalle = sequelize.define('VistaProgramaDetalle', {
  id_detalle: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  id_programa: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_linea: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_nivel: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_titulo_programa: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'vista_programas_detalles', // Nombre de la tabla en la base de datos
});

export default VistaProgramaDetalle;