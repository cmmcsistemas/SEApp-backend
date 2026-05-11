import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta a tu archivo de conexión
import paginate from 'sequelize-paginate';


const VistaDatosParticipantesCompleta = sequelize.define('VistaDatosParticipantesCompleta', {
  nombre_participante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido_participante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documento: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true // Validación para asegurar que sea un formato de correo electrónico válido
    }
  },
  id_respuesta: {
    type: DataTypes.INTEGER, // O DataTypes.STRING si los números pueden tener formatos variados (ej. "+57 3xx xxxxxxx")
    allowNull: false // Puede ser nulo o false según tus requisitos
  },
  nombre_campo: {
    type: DataTypes.DATEONLY, // Usamos DATEONLY para solo almacenar la fecha sin la hora
    allowNull: false // Puede ser nulo o false según tus requisitos
  },
  opciones: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  valor:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  nombre_modulo:{
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'vista_datos_participantes_completa', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize (createdAt y updatedAt), ya que tienes created_at manual
});



export default VistaDatosParticipantesCompleta;