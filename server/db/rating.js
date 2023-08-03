var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var Rating = mongoose.Schema({
    customerId: {                        // customer id who write the review
        type: ObjectId,
        ref: 'Users'
    },
    providerId: {                        // provider id whose is for the review
        type: ObjectId,
        ref: 'Users'
    },
    rating: {
        type: Number
    },
    review: {
        type: String
    },
    status: {
        type: Number
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Rating', Rating);;
