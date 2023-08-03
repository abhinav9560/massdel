var mongoose = require('mongoose');
var categories = mongoose.Schema({

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


var categories = mongoose.model('categories', categories);
module.exports = categories;