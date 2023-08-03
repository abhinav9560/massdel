const formidable = require("formidable");
const path = require("path");
var fs = require("fs");

var EmailTempCollection = require("../../db/emailTemplateSchema");
var Global = require("../../db/globalsetting");
var Transaction = require("../../db/transactionSchema");
var RoundRobin = require("../../db/roundrobin");
var User = require("../../db/userSchema");
const mailSend = require("./mailer");

module.exports = {
  generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  },
  generateReferral() {
    var text = " ";
    var numChars = "0123456789";
    var upCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lowCaseChars = "abcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 2; i++) {
      text += numChars.charAt(Math.floor(Math.random() * numChars.length));
      text += upCaseChars.charAt(
        Math.floor(Math.random() * upCaseChars.length)
      );
      text += lowCaseChars.charAt(
        Math.floor(Math.random() * lowCaseChars.length)
      );
    }
    text = text.trim();
    return text;
  },
  async getFormRecords(request) {
    return new Promise((resolve) => {
      var form = new formidable.IncomingForm({
        multiples: true,
      });
      // form.multiples = true
      form.parse(request, async function (error, fields, files) {
        if (error) {
          throw error;
        }

        resolve({ status: 1, fields: fields, files: files });
      });
    });
  },

  async uploadImages(files, ImageFolder) {
    try {
      return new Promise((resolve, reject) => {
        var pathsave = "../../../public/uploads/images/" + ImageFolder + "/";
        var images = files.image;
        var nameImages = [];

        if (files.image && files.image.name) {
          var imgExt = path.extname(files.image.name);
          fileName =
            new Date().getTime() +
            new Date().getTime() +
            Math.random().toString(36).slice(2) +
            imgExt;
          var saveImage = ImageFolder + "/" + fileName;
          var newpath = path.join(__dirname, pathsave) + fileName;
          nameImages.push(fileName);
          fs.rename(files.image.path, newpath, async function (err) {
            if (err) throw err;
            resolve({ status: 1, imageAr: nameImages });
          });
        } else {
          if (images) {
            console.log("images", images);
            let temp = [];
            images.forEach(function (file, index) {
              if (file.name) {
                var imgExt = path.extname(file.name);
                fileName =
                  new Date().getTime() +
                  new Date().getMilliseconds() +
                  new Date().getTime() +
                  Math.random().toString(36).slice(2) +
                  imgExt;
                var saveImage = ImageFolder + "/" + fileName;
                var newpath = path.join(__dirname, pathsave) + fileName;
                nameImages.push(fileName);
                fs.rename(file.path, newpath, async function (err) {
                  if (err) throw err;
                });
              }
            });
            resolve({ status: 1, imageAr: nameImages });
          } else {
            resolve({ status: 0, imageAr: [] });
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  },

  /* send mail using email template */
  EasyMail(mailContent) {
    EmailTempCollection.findOne(
      { slug: mailContent.slug },
      function (err, doc) {
        if (err) throw err;
        doc.description = doc.description.replace("[otp]", mailContent.otp);
        doc.description = doc.description.replace("[user]", mailContent.user);
        doc.description = doc.description.replace("[link]", mailContent.link);
        doc.description = doc.description.replace("[code]", mailContent.code);
        mailData = {
          email: mailContent.email,
          subject: doc.subject,
          html: doc.description,
        };
        mailSend(mailData);
      }
    );
    return true;
  },
  async contactUs(subject, message) {
    let user = await User.findOne({ role_id: 1 });
    if (user && user.email) {
      let mailData = {
        email: user.email,
        subject: subject,
        html: `<p>${message}</p>`,
      };
      mailSend(mailData);
    }
    return true;
  },
  calculatePrice(seconds, minRate, minDuration) {
    let diffMins = Number(seconds) / 60;
    diffMins = diffMins.toFixed(1);
    // let diffMins = this.diffInMin(start, end)
    // let diffMins = this.diffInMin(start, end)
    var price = 0;
    console.log("*********************************");
    console.log("minRate", minRate);
    console.log("minDuration", minDuration);
    console.log("diffMins", diffMins);
    if (diffMins < minDuration) {
      price = minRate * minDuration;
    } else {
      console.log("Math.log10(diffMins * 0.1)", Math.log10(diffMins * 0.1));
      console.log(
        "(minRate * (diffMins - minDuration))",
        minRate * (diffMins - minDuration)
      );
      price =
        minRate * minDuration +
        (minRate * (diffMins - minDuration)) /
          Math.abs(Math.log10(diffMins * 0.1));
      price = Math.ceil(price);
    }
    console.log("price==>", price);
    console.log("*********************************");
    return price;
  },
  diffInMin(start, end) {
    // start = new Date(start);
    // end = new Date(end);
    let diffMs = end - start; // milliseconds between start & end
    console.log("diff in milicescond", diffMs);
    let diffMins = Math.round(diffMs / 60000); // minutes
    return diffMins;
  },
  async splitCommission(type, price, providerId, customerId) {
    try {
      return new Promise(async (resolve, reject) => {
        let global = await Global.find();
        let commission = global[0].commision;
        let adminCommision = price * (commission / 100);
        let providerCommision = price - adminCommision;

        if (type == "wallet") {
          let customer = await User.findOneAndUpdate(
            { _id: customerId },
            { $inc: { wallet: -price } },
            { new: true }
          );
          let transaction = new Transaction({
            date: new Date(),
            amount: price,
            type: 1,
            balance: customer.wallet,
            recieverId: providerId,
            showId: customer._id,
            senderId: customer._id,
          });
          await transaction.save((err, doc) => {
            if (err) throw err;
            if (doc) {
              //  console.log(doc)
            }
          });
        }
        // console.log(price)
        // console.log(commission)
        // console.log(adminCommision)
        // console.log(providerCommision)
        // Transaction
        let Admin;
        let Provider;
        if (type == "cod") {
          Admin = await User.findOneAndUpdate(
            { role_id: 1 },
            { $inc: { wallet: adminCommision } },
            { new: true }
          );
          Provider = await User.findByIdAndUpdate(
            providerId,
            { $inc: { wallet: -providerCommision } },
            { new: true }
          );
        } else {
          Admin = await User.findOneAndUpdate(
            { role_id: 1 },
            { $inc: { wallet: adminCommision } },
            { new: true }
          );
          Provider = await User.findByIdAndUpdate(
            providerId,
            { $inc: { wallet: providerCommision } },
            { new: true }
          );
        }

        resolve({ status: 1 });

        const transaction = new Transaction({
          date: new Date(),
          amount: adminCommision,
          type: 0,
          balance: Admin.wallet,
          recieverId: Admin._id,
          senderId: customerId,
          showId: Admin._id,
        });
        transaction.save((err, doc) => {
          if (err) throw err;
          if (doc) {
            //  console.log(doc)
          }
        });

        const transaction1 = new Transaction({
          date: new Date(),
          amount: providerCommision,
          type: 0,
          balance: Provider.wallet,
          recieverId: Provider._id,
          senderId: customerId,
          showId: Provider._id,
        });
        transaction1.save((err, doc) => {
          if (err) throw err;
          if (doc) {
            //  console.log(doc)
          }
        });
      });
    } catch {
      console.log(err);
    }
  },
  async getChartInfo(data) {
    // Check all the months are included
    Array.prototype.inArray = function (comparer) {
      for (var i = 0; i < this.length; i++) {
        if (comparer(this[i])) return true;
      }
      return false;
    };

    // Months they are not avaiale in data
    Array.prototype.pushIfNotExist = function (element, comparer) {
      if (!this.inArray(comparer)) {
        this.push(element);
      }
    };

    const monthNames = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Pushing months
    for (let index = 1; index <= 12; index++) {
      var element = { _id: index, users: 0 };
      data.pushIfNotExist(element, function (e) {
        return parseInt(e._id) == parseInt(element._id);
      });
    }

    for (let index = 0; index < data.length; index++) {}

    let temp = data.sort(function (a, b) {
      return a._id > b._id ? 1 : -1;
    });
    return temp;
  },

  async checkRefercode(refercode) {
    try {
      return new Promise(async (resolve, reject) => {
        if (refercode) {
          console.log(refercode, "refercode");
          let global = await Global.findOne({ type: "Global" });
          admin = await User.findOne({ role_id: 1 });
          User.findOneAndUpdate(
            { referralSelf: refercode },
            { $inc: { wallet: global.referralAmountBy } },
            { new: true },
            (err, doc) => {
              if (err) console.log(err);
              if (doc) {
                // console.log('status:1')
                resolve({ status: 1, userId: doc._id });
                if (doc && doc) {
                  const transaction = new Transaction({
                    date: new Date(),
                    amount: global.referralAmountBy,
                    type: 0,
                    balance: doc.wallet,
                    showId: doc._id,
                    recieverId: doc._id,
                    senderId: admin._id,
                  });
                  transaction.save((err, trans) => {
                    if (err) throw err;
                    if (trans) {
                      //  console.log(trans)
                      //  console.log(user)
                    }
                  });
                }
              } else {
                // console.log('status:0')
                resolve({ status: 0, userId: null });
              }
            }
          ).lean();
        }
      });
    } catch (e) {}
  },
  async assignProviderRoundRobin(providerId, bookingId) {
    let roundrobin = new RoundRobin({
      userId: providerId,
      bookingId: bookingId,
      isSent: false,
      isRejected: false,
    });
    roundrobin.save((err, doc) => {
      if (err) throw err;
      if (doc) {
        console.log("round robin is saved");
      }
    });
  },
};
