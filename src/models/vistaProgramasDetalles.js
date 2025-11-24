import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const VistaProgramaDetalle = sequelize.define('VistaProgramaDetalle', {
  id_detalle: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  nombre_programa: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
    nombre_linea: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombre_nivel: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombre_titulo_programa: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'vista_programas_detalles', // Nombre de la tabla en la base de datos
});

export default VistaProgramaDetalle;