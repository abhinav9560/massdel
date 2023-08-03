var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Message = mongoose.Schema({
    message: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {                  //   0 = Message, 1 = Document
        type: Number,
        default: ''
    },
    senderId: {
        type: ObjectId,
        ref: 'Users'
    },
    recieverId: {
        type: ObjectId,
        ref: 'Users'
    },
    conversationId: {
        type: ObjectId,
        ref: 'Conversation'
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Message', Message);;
