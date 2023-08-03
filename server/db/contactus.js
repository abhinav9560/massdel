var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var contactus = mongoose.Schema({
    customerId: {
        type: ObjectId,
        ref: 'Users'
    },
    subject: {
        type: String,
        default: '',
    },
    message: {
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

module.exports = mongoose.model('contactus', contactus);
