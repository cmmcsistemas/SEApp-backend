import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js'; // Asegúrate de que esta ruta sea correcta

const CampoFormulario = sequelize.define('CampoFormulario', {
  id_campo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_campo es autoincremental
    allowNull: false
  },
  id_formulario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Formulario' (si lo tienes)
    // references: {
    //   model: 'Formulario', // Nombre del modelo al que hace referencia
    //   key: 'id_formulario' // Columna de la clave primaria en el modelo 'Formulario'
    // }
  },
  id_tipo: {
    type: DataTypes.INTEGER,
    allowNull: true, // Asumiendo que id_tipo podría ser opcional o manejado de otra forma
    // Si 'id_tipo' se refiere a una tabla de tipos de campo predefinidos,
    // podrías añadir una referencia aquí:
    // references: {
    //   model: 'TipoCampo', // Por ejemplo, si tienes un modelo para Tipos de Campo
    //   key: 'id_tipo'
    // }
  },
  nombre_campo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_campo: {
    type: DataTypes.STRING, // Usamos TEXT para la descripción del tipo (ej. 'texto', 'email')
    allowNull: false,
    // Puedes añadir una validación para asegurar que el valor sea uno de los esperados
    // validate: {
    //   isIn: [['texto', 'email', 'numero', 'fecha', 'checkbox', 'radio', 'select']]
    // }
  },
  opciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('opciones');
      // Intenta analizar el valor como JSON; si falla, devuelve el valor original.
      try {
        return rawValue ? JSON.parse(rawValue) : null;
      } catch (e) {
        // Si el valor no es un JSON válido, devuélvelo tal como está.
        // Opcional: podrías devolver un array vacío [] si prefieres un formato consistente.
        return rawValue;
      }
    },
    set(value) {
      this.setDataValue('opciones', JSON.stringify(value));
    }
  },
  requerido: {
    type: DataTypes.BOOLEAN, // Usamos BOOLEAN para true/false
    allowNull: false,
    defaultValue: false // Por defecto, un campo no es requerido a menos que se especifique
  }
}, {
  tableName: 'campos_formulario', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default CampoFormulario;