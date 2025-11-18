// models/municipio.js
import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Departamento = sequelize.define('Departamento', {
  id_departamento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_pais: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre_departamento: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'departamentos', // Asegúrate de que este es el nombre de tu tabla en la base de datos
  timestamps: false, // Deshabilita la gestión automática de `createdAt` y `updatedAt`
});

export default Departamento;