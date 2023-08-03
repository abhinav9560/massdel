// Firebase App for customer
var User = require('../../db/userSchema');
const adminCustomer = require('firebase-admin')

var serviceAccount = require("../../../massdel-customer-firebase-adminsdk-ljgzh-ae8789a2a1.json");

adminCustomer.initializeApp({
    credential: adminCustomer.credential.cert(serviceAccount)
});
// Firebase App for customer

module.exports = {
    async sendPushNotificationCustomer(userId,data,type, temp) {
        let user = await User.findById(userId);
        let message = {
            notification: {
                title: 'MassDel Home Service',
                body: data,
                // imageUrl: 'https://www.bawraybanjaray.com/wp-content/uploads/2020/04/Gaanja-1024x576.jpg'
            },
            token: user.notificationToken,
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
            adminCustomer.messaging().send(message)
                .then((resp) => {
                    console.log('Message sent successfully:', resp);
                }).catch((err) => {
                    console.log('Failed to send the message:', err);
                });
        } else {
            console.log('token is not present')
        }

    },
}
