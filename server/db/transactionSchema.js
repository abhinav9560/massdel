var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

let autoIncrement = require('mongoose-auto-increment');

let connection = mongoose.createConnection("mongodb://localhost:27017/massdel", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
// mongoose.set('useCreateIndex', true);
autoIncrement.initialize(connection);

var Transaction = mongoose.Schema({
    date: {
        type: Date,
        default: new Date()
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,                  // 0 pending  1 approved 2 rejected
        default: 0
    },
    paymentGatwayData: {
        type: {},
        default: {}
    },
    type: {
        type: Number,                 // 0 for Credit, 1 for Debit
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    showId: {                         // user id for display purpose
        type: ObjectId,
        ref: 'Users'
    },
    senderId: {                         // user which send amount
        type: ObjectId,
        ref: 'Users'
    },
    recieverId: {                        // user which recieve amount
        type: ObjectId,
        ref: 'Users'
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

Transaction.plugin(autoIncrement.plugin, {
    model: 'Transaction',
    field: 'transactionId',
    startAt: 1000,
    incrementBy: 1
});

module.exports = mongoose.model('Transaction', Transaction);;
