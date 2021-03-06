const mongoose = require('mongoose')

const Schema = mongoose.Schema
const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description:{
            type: String,
            required: true,
        },
        price: {
            type: String
        },
        contact: {
            type: String,
        },     
        imageSrc: {
            type: String,
            default: ""
        }
    }
)
module.exports = mongoose.model('products', productSchema)