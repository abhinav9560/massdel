const cron = require("node-cron");

const RoundRobin = require("../../db/roundrobin");
const User = require("../../db/userSchema");
const Booking = require("../../db/bookingSchema");

const pushNotificationProvider = require("../helpers/pushNotificationProvider");

cron.schedule("*/30 * * * * *", async () => {
  console.log(
    `Time is:- ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
  );

  let booking = await RoundRobin.find({
    status: 1,
    is_show: 1,
  }).distinct("bookingId");

  //   console.log(booking);

  if (booking && booking.length) {
    for await (let item of booking) {
      let firstProvider = await RoundRobin.findOne({
        isSent: false,
        status: 1,
        is_show: 1,
        bookingId: item,
        isRejected: false,
      });
      //   console.log(firstProvider);
      if (firstProvider) {
        await pushNotificationProvider.sendPushNotificationProvider(
          firstProvider.userId,
          `You Have A New Booking`,
          "booking",
          firstProvider.bookingId
        );
        let updated = await RoundRobin.findByIdAndUpdate(firstProvider._id, {
          isSent: true,
        });
        setTimeout(async () => {
          let booking = await Booking.findById(firstProvider.bookingId);
          if (booking.status === 0) {
            let updated = await RoundRobin.findByIdAndUpdate(
              firstProvider._id,
              {
                isRejected: true,
              }
            );
          }
        }, 3000);
        // console.log(updated);
      }
    }
  }
});
