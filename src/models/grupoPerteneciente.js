import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const GrupoPerteneciente = sequelize.define('GrupoPerteneciente', {
  id_grupo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  nombre_grupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
    created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'grupo_perteneciente', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default GrupoPerteneciente;