// models/municipio.js
import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const GrupoVulnerable = sequelize.define('GrupoVulnerable', {
  id_grupo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  tipo_grupo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'grupo_vulnerable', // Asegúrate de que este es el nombre de tu tabla en la base de datos
  timestamps: false, // Deshabilita la gestión automática de `createdAt` y `updatedAt`
});

export default GrupoVulnerable;