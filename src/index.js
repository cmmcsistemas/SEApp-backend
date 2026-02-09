import dotenv from "dotenv";
import express from "express";
import sequelize from "./database/database.js";
import cors from "cors";
import bodyParser from "body-parser";
import ParticipanteRoutes from "./routes/participantes.js";
import UsuarioRoutes from "./routes/usuarios.js";
import formulariosRoutes from "./routes/formularios.js";
import basicaRoutes from "./routes/basica.js";
import planesFormacion from "./routes/planesFormacion.js";
import RespuestasFormulario from "./models/respuestasFormulario.js";
import DatoRespuesta from "./models/datosRespuesta.js";
import FollowRoutes from "./routes/login.js";

dotenv.config();
console.log("API node en ejecucion");

// Un formulario tiene muchos datos de respuesta
RespuestasFormulario.hasMany(DatosRespuesta, { foreignKey: 'id_respuesta', as: 'detalles' });
// Cada dato de respuesta pertenece a una cabecera
DatoRespuesta.belongsTo(RespuestasFormulario, { foreignKey: 'id_respuesta' });
//sequelize();


const app = express();
const puerto = process.env.PORT || 3900;

app.use(cors({
    origin: '*',
    methods: 'GET,PUT,HEAD,PATCH,POST,DELETE',
    preflightContinue: false,
    optionSuccessSatus: 204
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/user', UsuarioRoutes);
app.use('/api/participantes', ParticipanteRoutes);
app.use('/api/formularios', formulariosRoutes);
app.use('/api/basica', basicaRoutes);
app.use('/api/planes-de-formacion', planesFormacion);
//app.use('/api/follow', FollowRoutes);

app.listen(puerto, () => {
    console.log("Servidor de node ejecutandose en el puerto", puerto);
});


export default app;