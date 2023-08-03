var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var ServiceInformation = mongoose.Schema({
    providerId: {
        type: ObjectId,
        ref: 'Users'
    },
    city: {
        type: String,
        default: ''
    },
    timings: [{
        day: {
            type: String,
            default: ''
        },
        start_time: {
            type: Date,
        },
        end_time: {
            type: Date,
        },
    }],
    coverageArea: {
        type: [],
        default: []
    },
    status: {
        type: Number,
        default: 1
    },
    is_delete: {
        type: Number,
        default: 0
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('ServiceInformation', ServiceInformation); 
