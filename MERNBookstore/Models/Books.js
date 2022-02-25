const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.ObjectId,
            ref: "Author"
        },
        title: string
    })

const BookModel = mongoose.model('Book', BookSchema);
module.exports = BookModel;