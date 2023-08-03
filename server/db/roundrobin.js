var mongoose = require("mongoose");
var ObjectId = require("mongoose").ObjectId;

var RoundRobin = mongoose.Schema(
  {
    userId: {
      // can be customer or provider
      type: ObjectId,
      ref: "Users",
    },
    bookingId: {
      type: ObjectId,
      ref: "Booking",
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 1,
    },
    is_show: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("RoundRobin", RoundRobin);
