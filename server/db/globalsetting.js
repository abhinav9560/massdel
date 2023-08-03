var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var GlobalSetting = mongoose.Schema({
  commision: {
    type: Number,
    default: 0
  },
  paymentMode: {},
  cancellationTime: {
    type: Number,
    default: 0      // till how much time after booking customer can cancel a booking after this time customer can not cancel booking
  },
  defaultRadius: {
    type: Number,
    default: 0      // distance from which customer will found provider
  },
  type: {
    type: String,
    default: 'Global'
  },
  referralAmountBy: {
    type: Number,
    default: 0
  },
  referralAmountTo: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 1
  },
  is_delete: {
    type: Number,
    default: 0
  },

}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('GlobalSetting', GlobalSetting);
