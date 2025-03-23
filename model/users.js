let mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let Schema = mongoose.Schema;

let UserSchema = Schema({
    username:  String, 
    email: String,
    password:  String, 
    createdAt:Date,
});

// Activer la pagination pour ce schéma
UserSchema.plugin(aggregatePaginate);

// Exporter le modèle User pour le CRUD 
module.exports = mongoose.model('User', UserSchema);