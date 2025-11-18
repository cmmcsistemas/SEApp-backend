import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js'; 
//const db = require('../database/database');

exports.getAllParticipantes = function(callback) {
    db.query('SELECT * FROM participantes', callback);
};

exports.getTodoById = function(id, callback) {
    db.query('SELECT * FROM participantes WHERE id = ?', [id], callback);
};

exports.createTodo = function(newTodo, callback) {
    db.query('INSERT INTO participantes SET ?', newTodo, callback);
};

exports.updateTodo = function(id, updatedTodo, callback) {
    db.query('UPDATE participantes SET ? WHERE id = ?', [updatedTodo, id], callback);
};

exports.deleteTodo = function(id, callback) {
    db.query('DELETE FROM participantes WHERE id = ?', [id], callback);
};