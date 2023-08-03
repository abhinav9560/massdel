var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var language = mongoose.Schema({
    name_english: {
        type: String,
        default: '',
    },
    name_aramaic: {
        type: String,
        default: '',
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

module.exports = mongoose.model('language', language);
