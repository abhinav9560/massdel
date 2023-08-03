var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;
var guide = mongoose.Schema({
    title_english: {
        type: String,
        default: ''
    },
    title_aramaic: {
        type: String,
        default: ''
    },
    description_english: {
        type: String,
        default: ''
    },
    description_aramaic: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    },
    is_show: {
        type: Number,
        default: 1
    },

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

var guide = mongoose.model('guide', guide);
module.exports = guide;
