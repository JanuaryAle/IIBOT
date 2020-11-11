const mongoose = require('mongoose')

const Schema = mongoose.Schema
const victorySchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        article:{
            type: String,
            required: true,
        },
        poll: {
            type: {
                type: String
            },
            question: {
                type: String,
            },
            options: [{
                text: {
                    type: String
                }
            }],
            allows_multiple_answers: {
                type: Boolean,
                default: false
            },
            is_anonymous: {
                type: Boolean,
                default: false
            },
            correct_option_id: {
                type: Number
            }
        },
        imageSrc: {
            type: String,
            default: ""
        }
    }
)
module.exports = mongoose.model('victory', victorySchema)