import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta a tu archivo de conexión
import paginate from 'sequelize-paginate';


const Participante = sequelize.define('Participante', {
  id_participante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_participante es autoincremental
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // Asumiendo que el documento debe ser único
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Asumiendo que el email debe ser único
    validate: {
      isEmail: true // Validación para asegurar que sea un formato de correo electrónico válido
    }
  },
  telefono: {
    type: DataTypes.INTEGER, // O DataTypes.STRING si los números pueden tener formatos variados (ej. "+57 3xx xxxxxxx")
    allowNull: true // Puede ser nulo o false según tus requisitos
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY, // Usamos DATEONLY para solo almacenar la fecha sin la hora
    allowNull: true // Puede ser nulo o false según tus requisitos
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: true // Puede ser nulo o false según tus requisitos
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW // Establece el valor por defecto a la fecha y hora actual al crear el registro
  }
}, {
  tableName: 'participantes', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize (createdAt y updatedAt), ya que tienes created_at manual
});

paginate.paginate(Participante);

export default Participante;