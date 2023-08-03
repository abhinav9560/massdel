var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;


let autoIncrement = require('mongoose-auto-increment');

let connection = mongoose.createConnection("mongodb://localhost:27017/massdel", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
// mongoose.set('useCreateIndex', true);
autoIncrement.initialize(connection);

var Wallet = mongoose.Schema({
    amount: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: Number,                  // 0 pending  1 approved 2 rejected
        default: 0
    },
    userId: {                         // can be customer or provider
        type: ObjectId,
        ref: 'Users'
    },
    adminId: {                        // id of admin or subadmin who approved payment
        type: ObjectId,
        ref: 'Users'
    },
    is_show: {
        type: Number,
        default: 1
    },
}, {
    timestamps: { createdAt: 'createdAt', pdatedAt: 'updatedAt' }
});


Wallet.plugin(autoIncrement.plugin, {
    model: 'Wallet',
    field: 'walletId',
    startAt: 1000,
    incrementBy: 1
});

module.exports = mongoose.model('Wallet', Wallet);;
