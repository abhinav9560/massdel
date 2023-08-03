var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

let autoIncrement = require('mongoose-auto-increment');

let connection = mongoose.createConnection("mongodb://localhost:27017/massdel", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
// mongoose.set('useCreateIndex', true);
autoIncrement.initialize(connection);

var Booking = mongoose.Schema({
    rejectedBy: {
        type: [{ type: ObjectId, ref: 'Users' }],
        default: []
    },
    bookingId: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: ''
    },
    startByProvider: {
        type: Boolean,
        default: false
    },
    start: {
        type: Date,
        default: ''
    },
    endByProvider: {
        type: Boolean,
        default: false
    },
    isPaymentReceived: {
        type: String,
        default: ''
    },
    isRated: {
        type: Boolean,
        default: false
    },
    end: {
        type: Date,
        default: ''
    },
    seconds: {
        type: Number,
        default: 0
    },
    address: {
        type: String,
        default: ''
    },
    additionalNotes: {
        type: String,
        default: ''
    },
    image: {
        type: [],
        default: []
    },
    type: {
        type: String,
        default: ''
    },
    scheduleDate: {
        type: Date,           // Schedule Date
        default: ''
    },
    customerId: {
        type: ObjectId,
        ref: 'Users'
    },
    providerId: {
        type: ObjectId,
        ref: 'Users'
    },
    subCategory: {
        type: ObjectId,
        ref: 'sub_categories'
    },
    category: {
        type: ObjectId,
        ref: 'categories'
    },
    promoCode: {
        type: ObjectId,
        ref: 'Promocode'
    },
    price: {
        type: Number,
        default: 0
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    payablePrice: {
        type: Number,
        default: 0
    },
    paymentMode: {
        type: String,
        default: ''
    },
    paymentGatwayData: {
        type: {},
        default: {}
    },
    status: {
        type: Number,
        default: 0        // 0 Pending, 1 Accpeted, 2 Rejected, 3 Cancelled, 4 Services initiated , 5 Service Start, 6 Service Finished, 7 Completed (Payment done)
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    is_show: {
        type: Number,
        default: 1
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    lat: {
        type: Number,
        default: ""
    },
    lng: {
        type: Number,
        default: ""
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

Booking.index({ location: "2dsphere" });

Booking.plugin(autoIncrement.plugin, {
    model: 'Booking',
    field: 'bookingId',
    startAt: 1,
    incrementBy: 1
});

module.exports = mongoose.model('Booking', Booking);;
