var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Bankaccount = mongoose.Schema({
    providerId: {
        type: ObjectId,
        ref: 'Users'
    },
    type: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    accountNo: {
        type: String,
        default: ''
    },
    bankName: {
        type: String,
        default: ''
    },
    ifscCode: {
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

module.exports = mongoose.model('Bankaccount', Bankaccount);
