var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Notification = mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    userId: {
        type: ObjectId,
        ref: 'Users'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
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

module.exports = mongoose.model('Notification', Notification);
