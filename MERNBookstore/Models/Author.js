const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema(
{   
    firstname: string,
    lastname: string
})

const AuthorModel = mongoose.model('Author', AuthorSchema);

module.exports = AuthorModel;