var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Promocode = mongoose.Schema({
    createdBy: {
        type: ObjectId,
        ref: 'Users'
    },
    type: {
        type: String,
        default: '',
        enum: ['Flat', 'Percentage']
    },
    name: {
        type: String,
        default: ''
    },
    couponCode: {
        type: String,
        default: ''
    },
    discount: {
        type: Number,
        default: 0
    },
    limitPerUser: {
        type: Number,
        default: ''
    },
    startDate: {
        type: Date,
        default: null,
    },
    endDate: {
        type: Date,
        default: null,
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

module.exports = mongoose.model('Promocode', Promocode);
