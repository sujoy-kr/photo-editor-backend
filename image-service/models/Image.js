const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
        userId: {
            type: Number,
            required: true,
            default: 0,
        },
        metadata: {
            type: JSON,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

imageSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret.userId, delete ret._id
    },
})

const Image = mongoose.model('Image', imageSchema)

module.exports = Image
