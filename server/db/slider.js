var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Slider = mongoose.Schema({
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


module.exports = mongoose.model('Slider', Slider);
