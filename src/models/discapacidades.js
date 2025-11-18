// models/municipio.js
import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Discapacidades = sequelize.define('Discapacidades', {
  id_discapacidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  tipo_discapacidad: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'discapacidad', // Asegúrate de que este es el nombre de tu tabla en la base de datos
  timestamps: false, // Deshabilita la gestión automática de `createdAt` y `updatedAt`
});

export default Discapacidades;