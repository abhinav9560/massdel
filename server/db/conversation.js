var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Conversation = mongoose.Schema({
    name: String,
    user: [
        {
            userId: {
                type: ObjectId,
                ref: 'Users'
            },
        }
    ],
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Conversation', Conversation);;
