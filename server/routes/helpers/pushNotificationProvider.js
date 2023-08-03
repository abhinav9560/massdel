// Firebase App for Provider
var User = require("../../db/userSchema");
const adminProvider = require("firebase-admin");

var serviceAccount1 = require("../../../massdel-309511-firebase-adminsdk-fnsm0-1933e35bbc.json");

adminProvider.initializeApp(
  {
    credential: adminProvider.credential.cert(serviceAccount1),
  },
  "Provider"
);

// Firebase App for customer

module.exports = {
  async sendPushNotificationProvider(userId, data, type, temp) {
    let user = await User.findById(userId);
    console.log("in function", user.name);
    let message = {
      notification: {
        title: "MassDel Home Service",
        body: data,
        // imageUrl: 'https://www.bawraybanjaray.com/wp-content/uploads/2020/04/Gaanja-1024x576.jpg'
      },
      token: user.notificationToken,
      // token: `fqXw98p9TDiQilgankDc0L:APA91bEn-M3BRYcxBdWuLuNjKMrzrUsRiWIcXtt6kPSHiXfxaQLdMYBm3TWQfBFkNNTqQ1inAgjcw5Q1yS5GRKnN57pDZ7dOQaKaROjFiqo7TuYEUPb1Tn3irAhf4K6y9NT73FHMFtmq`,
      data: { type: type, message: temp.toString() },
      // android: {
      //     notification: {
      //         body: data,
      //         sound: 'default',
      //         click_action: 'FLUTTER_NOTIFICATION_CLICK',
      //         color: '#ff0000',
      //         notificationCount: 69,
      //         priority: 'max',
      //         sticky:true,
      //         ticker:'ticker ticker ticker',
      //         tag:'1'
      //     },
      // },
    };

    if (user.notificationToken) {
      adminProvider
        .app("Provider")
        .messaging()
        .send(message)
        .then((resp) => {
          console.log("Message sent successfully:", resp);
        })
        .catch((err) => {
          console.log("Failed to send the message:", err);
        });
    } else {
      console.log("token is not present");
    }
  },
};
