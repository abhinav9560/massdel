var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Address = mongoose.Schema({
    type: {
        type: String,                   //Address Type  Home Work etc
        default: ''
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    city: {
        type: ObjectId,
        ref: 'city'
    },
    address: {
        type: String,
        default: ""
    },
    zipCode: {
        type: String,
        default: ""
    },
    customerId: {
        type: ObjectId,
        ref: 'Users'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    lat: {
        type: String,
        default: ""
    },
    lng: {
        type: String,
        default: ""
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

Address.index({ location: "2dsphere" });
module.exports = mongoose.model('Address', Address);
