import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const SubProyecto = sequelize.define('SubProyecto', {
  id_subproyecto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre_subproyecto: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // Según el comentario en la imagen, el nombre es único.
  },
  fase_subproyecto: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  id_proyecto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true, // Según la imagen, puede ser nulo, aunque por defecto se genera.
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'sub_proyectos', // Asegúrate de que este es el nombre de tu tabla
  timestamps: false, // Deshabilita la gestión automática de `createdAt` y `updatedAt` por Sequelize.
});

export default SubProyecto;