var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;
var sub_categories = mongoose.Schema({
    category_id: {
        type: ObjectId,
        ref: 'categories'
    },
    name_english: {
        type: String,
        default: '',
    },
    name_aramaic: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    minRate: {                      // Minimum(initial) service price(rate) per minute
        type: Number,
        default: 0,
    },
    minDuration: {                      // Minimum service duration in minutes
        type: Number,
        default: 0,
    },
    softLimit: {                      // Set service Soft limit wallet amount
        type: Number,
        default: 0,
    },
    hardLimit: {                      // Set service Hard Limit wallet amount
        type: Number,
        default: 0,
    },
    status: {
        type: Number,
        default: 1,
    },
    is_show: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});


var sub_categories = mongoose.model('sub_categories', sub_categories);
module.exports = sub_categories;