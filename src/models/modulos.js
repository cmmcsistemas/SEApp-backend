import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Modulo = sequelize.define('Modulo', {
  id_modulo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_modulo es autoincremental
    allowNull: false
  },
  id_proyecto: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser nulo si un módulo no está directamente ligado a un proyecto al inicio
    // Aquí puedes añadir la referencia a tu modelo 'Proyecto'
    // references: {
    //   model: 'Proyecto', // Nombre del modelo al que hace referencia
    //   key: 'id_proyecto' // Columna de la clave primaria en el modelo 'Proyecto'
    // }
  },
  nombre_modulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_formulario: {
    type: DataTypes.TEXT, // Usamos TEXT para la descripción del tipo de formulario
    allowNull: true, // Puede ser nulo si no todos los módulos tienen un tipo de formulario específico
    // Opcional: Si quieres restringir los valores, puedes usar una validación:
    // validate: {
    //   isIn: [['Caracterizacion', 'ampliada', 'monitoreo']]
    // }
  }
}, {
  tableName: 'modulos', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default Modulo;