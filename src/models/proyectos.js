import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Proyecto = sequelize.define('Proyecto', {
  id_proyecto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_proyecto es autoincremental
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT, // Usamos TEXT para descripciones más largas
    allowNull: true // Asumiendo que la descripción puede ser opcional
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY, // Solo la fecha, sin la hora
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY, // Solo la fecha, sin la hora
    allowNull: true // Asumiendo que la fecha de fin puede ser opcional al inicio del proyecto
  }
}, {
  tableName: 'proyectos', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default Proyecto;