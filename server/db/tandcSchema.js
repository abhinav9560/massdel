var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;
var tandc = mongoose.Schema({
    description_english: {
        type: String,
        default: ''
    },
    description_aramaic: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    slug: {
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

var tandc = mongoose.model('tandc', tandc);
module.exports = tandc;
