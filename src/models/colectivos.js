import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta a tu archivo de conexión
import paginate from 'sequelize-paginate';


const Colectivo = sequelize.define('Colectivo', {
  id_colectivo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_participante es autoincremental
    allowNull: false
  },
  colectivo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true 
  },
  nit: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true // Validación para asegurar que sea un formato de correo electrónico válido
    }
  },
  telefono: {
    type: DataTypes.INTEGER, // O DataTypes.STRING si los números pueden tener formatos variados (ej. "+57 3xx xxxxxxx")
    allowNull: true // Puede ser nulo o false según tus requisitos
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW // Establece el valor por defecto a la fecha y hora actual al crear el registro
  }
}, {
  tableName: 'colectivos', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize (createdAt y updatedAt), ya que tienes created_at manual
});

paginate.paginate(Colectivo);

export default Colectivo;