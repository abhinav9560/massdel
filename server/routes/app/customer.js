const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const moment = require("moment");
const fetch = require("node-fetch");
var ypco = require("yenepaysdk");
const roleId = 4; // for customer

const commonHelper = require("../helpers/functions");
const pushNotificationProvider = require("../helpers/pushNotificationProvider");

const Users = require("../../db/userSchema");
const Provider = require("../../db/userSchema");
const Category = require("../../db/categorySchema.js");
const subCategory = require("../../db/subcategorySchema.js");
const Booking = require("../../db/bookingSchema");
var Wallet = require("../../db/wallet");
var Notification = require("../../db/notification");
var Address = require("../../db/address");
var Rating = require("../../db/rating");
var Message = require("../../db/message");
var Conversation = require("../../db/conversation");
var Global = require("../../db/globalsetting");
var Guide = require("../../db/guideSchema");
var CMS = require("../../db/tandcSchema");
var FAQ = require("../../db/faqSchema");
var Contactus = require("../../db/contactus");
var Global = require("../../db/globalsetting");
var Slider = require("../../db/slider");
var City = require("../../db/city");
var Transaction = require("../../db/transactionSchema");
var Promocode = require("../../db/promocode");

const { body, validationResult } = require("express-validator");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/images/booking_images");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/getGuide", async (req, res) => {
  Guide.find(
    { status: 1, is_show: 1 },
    "title_english title_aramaic description_english description_aramaic image",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var imageUrl = process.env.url + "/public/uploads/images/guide_images/";
        var response = {
          status: 1,
          message_english: "Guide list",
          data: doc,
          imageUrl: imageUrl,
        };
        res.send(response);
      }
    }
  );
});

router.get("/getCms", async (req, res) => {
  CMS.findOne(
    { status: 1, is_show: 1, slug: req.query.slug },
    "title slug description_english description_aramaic",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var response = { status: 1, message_english: "CMS list", data: doc };
        res.send(response);
      } else {
        var response = {
          status: 0,
          message_english: "No page found",
          data: {},
        };
        res.send(response);
      }
    }
  );
});

router.get("/getCity", async (req, res) => {
  City.find(
    { status: 1, is_show: 1 },
    "name_english name_aramaic",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var response = { status: 1, message_english: "City list", data: doc };
        res.send(response);
      }
    }
  );
});

router.get("/faq", async (req, res) => {
  FAQ.find({ status: 1, is_show: 1 }, (err, doc) => {
    if (err) console.log(err);
    if (doc) {
      var response = { status: 1, message_english: "FAQ list", data: doc };
      res.send(response);
    }
  });
});

router.post(
  "/signup",
  [
    body("mobile")
      .isNumeric()
      .withMessage({
        message_english: "Must contain a numeric value",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ min: 9 })
      .withMessage({
        message_english: "Must be minimum 9 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ max: 19 })
      .withMessage({
        message_english: "Must be maximum 19 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("countryCode")
      .exists()
      .withMessage({
        message_english: "Please send countryCode",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("onlyMobile")
      .exists()
      .withMessage({
        message_english: "Please send onlyMobile",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    try {
      Users.findOne(
        {
          mobile: req.body.mobile,
          isSignup: 1,
          verified: 1,
          status: 1,
          is_show: 1,
        },
        function (err, result) {
          if (err) throw err;
          if (!result) {
            Users.findOne(
              { mobile: req.body.mobile, isSignup: 0 },
              (err, doc) => {
                if (err) throw err;
                // var GeneratedOTP = commonHelper.generateOTP();
                var GeneratedOTP = 1234;
                Users.findOneAndUpdate(
                  { mobile: req.body.mobile, isSignup: 0 },
                  {
                    otp: GeneratedOTP,
                    otp_status: 1,
                    verified: 0,
                    role_id: roleId,
                    status: 1,
                    is_show: 1,
                    countryCode: req.body.countryCode,
                    onlyMobile: req.body.onlyMobile,
                  },
                  { upsert: true, new: true },
                  async (err, user) => {
                    if (err) {
                      console.log(err);
                      var jsonData = {
                        status: 0,
                        message_english: "Network Error",
                        message_aramaic: "ሞባይል አልተመዘገበም",
                        data: { err },
                      };
                      res.send(jsonData);
                    }
                    // let mailContent = {}
                    // mailContent.email = user.email;
                    // mailContent.user = user.name;
                    // mailContent.otp = GeneratedOTP;
                    // mailContent.slug = "sign-up";
                    // await commonHelper.EasyMail(mailContent);
                    console.log(user, "user");
                    var response = {
                      status: 1,
                      message_english: "OTP sent successfully",
                      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
                      data: {
                        userId: user._id,
                        otp: GeneratedOTP,
                        mobile: req.body.mobile,
                        countryCode: req.body.countryCode,
                        onlyMobile: req.body.onlyMobile,
                      },
                    };
                    res.send(response);
                  }
                );
              }
            );
          } else {
            var jsonData = {
              status: 0,
              message_english: "Mobile No already registered",
              message_aramaic: "ሞባይል አልተመዘገበም",
              data: {},
            };
            res.send(jsonData);
          }
        }
      );
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.post(
  "/verifyOtp",
  [
    body("userId")
      .exists()
      .withMessage({
        message_english: "Please send user id",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("otp")
      .isNumeric()
      .withMessage({
        message_english: "Please send a valid otp",
        message_aramaic: "እባክዎን የሚሰራ ኦፒ ይላኩ",
      })
      .isLength({ min: 4 })
      .withMessage({
        message_english: "Otp must be min 4 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ max: 4 })
      .withMessage({
        message_english: "Otp must be max 4 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }
    try {
      Users.findOne(
        { _id: mongoose.Types.ObjectId(req.body.userId) },
        function (err, result) {
          if (err) {
            throw err;
          }
          if (result) {
            if (result.otp == req.body.otp) {
              Users.findOneAndUpdate(
                { _id: result._id },
                { otp: "", otp_status: 0, verified: 1 },
                function (err, user) {
                  if (err) throw err;
                  var response = {
                    status: 1,
                    message_english: "OTP verified successfully",
                    message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተረጋግጧል",
                    data: result,
                  };
                  res.send(response);
                }
              );
            } else {
              var response = {
                status: 0,
                message_english: "Invalid OTP",
                message_aramaic: "ልክ ያልሆነ OTP",
                data: {},
              };
              res.send(response);
            }
          } else {
            var response = {
              status: 0,
              message_english: "User not found",
              message_aramaic: "ተጠቃሚ አልተገኘም",
            };
            res.send(response);
          }
        }
      );
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.post(
  "/resendOtp",
  [
    body("userId")
      .exists()
      .withMessage({
        message_english: "Please send user Id",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    try {
      Users.findOne(
        { _id: mongoose.Types.ObjectId(req.body.userId) },
        function (err, result) {
          if (err) throw err;
          if (result) {
            // var GeneratedOTP = commonHelper.generateOTP();
            var GeneratedOTP = 1234;
            Users.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body.userId) },
              { otp: GeneratedOTP, otp_status: 1, verified: 0 },
              function (err, user) {
                if (err) throw err;
                // let mailContent = {}
                // mailContent.email = user.email;
                // mailContent.otp = GeneratedOTP;
                // mailContent.user = user.name;
                // mailContent.slug = "otp-request";
                // commonHelper.EasyMail(mailContent);
                var response = {
                  status: 1,
                  message_english: "OTP resent successfully",
                  message_aramaic: "የ OTP ቅሬታ በተሳካ ሁኔታ",
                  data: { userId: user._id, otp: GeneratedOTP },
                };
                res.send(response);
              }
            );
          } else {
            var response = {
              status: 0,
              message_english: "User not found",
              message_aramaic: "ተጠቃሚ አልተገኘም",
            };
            res.send(response);
          }
        }
      );
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.post(
  "/signupAfter",
  [
    body("userId")
      .exists()
      .withMessage({
        message_english: "Please send user Id",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("mobile")
      .exists()
      .withMessage({
        message_english: "Please send mobile",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isNumeric()
      .withMessage({
        message_english: "Please send numeric value",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ min: 9 })
      .withMessage({
        message_english: "Must be minimum 9 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ max: 19 })
      .withMessage({
        message_english: "Must be maximum 19 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("password")
      .exists()
      .withMessage({
        message_english: "Please send password",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("confirm_password")
      .exists()
      .withMessage({
        message_english: "Please send confirm_password",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("name")
      .exists()
      .withMessage({
        message_english: "Please send name",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("city")
      .exists()
      .withMessage({
        message_english: "Please send city",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }
    if (req.body.password != req.body.confirm_password) {
      var response = {
        status: 0,
        message_english: "Password and confirm password do not match",
        message_aramaic: "የይለፍ ቃል እና ያረጋግጡ የይለፍ ቃል አይዛመዱም",
        data: {},
      };
      return res.send(response);
    }
    try {
      Users.findOne(
        {
          _id: mongoose.Types.ObjectId(req.body.userId),
          mobile: req.body.mobile,
          isSignup: 1,
          status: 1,
          is_show: 1,
        },
        async (err, doc) => {
          if (err) console.log(err);
          if (doc) {
            var jsonData = {
              status: 0,
              message_english: "Already signup! Please login",
              message_aramaic: "ሞባይል አልተመዘገበም",
              data: {},
            };
            res.send(jsonData);
          } else {
            let data = {};
            if (req.body.refercode && req.body.refercode.length) {
              data = await commonHelper.checkRefercode(req.body.refercode);
            }
            var admin = await Users.findOne({ role_id: 1 });
            let global = await Global.findOne({ type: "Global" });
            Users.findOneAndUpdate(
              {
                _id: mongoose.Types.ObjectId(req.body.userId),
                mobile: req.body.mobile,
              },
              {
                name: req.body.name,
                city: req.body.city,
                isSignup: 1,
                wallet: data.status ? global.referralAmountTo : 0,
                referralUsed: req.body.refercode ? req.body.refercode : "",
                password: bcrypt.hashSync(req.body.password, salt),
                referralSelf: commonHelper.generateReferral(),
              },
              function (err, user) {
                if (err) throw err;
                var response = {
                  status: 1,
                  message_english: "Sign Up successfully! Please Login",
                  message_aramaic: "በተሳካ ሁኔታ ይመዝገቡ! እባክዎ ይግቡ",
                  data: {},
                };
                res.send(response);
                if (data && data.userId) {
                  Users.findOneAndUpdate(
                    { _id: data.userId },
                    { $push: { refercodeUsedBy: user._id } },
                    { new: true },
                    (err, doc) => {
                      if (err) console.log(err);
                      if (doc) {
                      }
                    }
                  );
                  const transaction = new Transaction({
                    date: new Date(),
                    amount: global.referralAmountTo,
                    type: 0,
                    balance: 0,
                    showId: user._id,
                    recieverId: user._id,
                    senderId: admin._id,
                  });
                  transaction.save((err, trans) => {
                    if (err) throw err;
                    if (trans) {
                      console.log(trans);
                      //  console.log(user)
                    }
                  });
                }
              }
            );
          }
        }
      );
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.post(
  "/forgotPassword",
  [
    body("mobile")
      .isNumeric()
      .withMessage({
        message_english: "Must contain a numeric value",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ min: 9 })
      .withMessage({
        message_english: "Must be minimum 9 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ max: 19 })
      .withMessage({
        message_english: "Must be maximum 19 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    try {
      Users.findOne(
        {
          $or: [{ mobile: req.body.mobile }],
          isSignup: 1,
          role_id: roleId,
          status: 1,
          is_show: 1,
        },
        async (err, doc) => {
          if (err) throw err;
          if (doc) {
            // var GeneratedOTP = commonHelper.generateOTP();
            var GeneratedOTP = 1234;
            Users.findOneAndUpdate(
              { _id: doc._id },
              { otp: GeneratedOTP, otp_status: 1 },
              async function (err, user) {
                if (err) throw err;
                // let mailContent = {}
                // mailContent.email = req.body.email;
                // mailContent.user = user.name;
                // mailContent.otp = GeneratedOTP;
                // mailContent.slug = "forgot-password";
                // await commonHelper.EasyMail(mailContent);
                var response = {
                  status: 1,
                  message_english: "OTP sent successfully",
                  message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
                  data: { userId: user._id, otp: GeneratedOTP },
                };
                res.send(response);
              }
            );
          } else {
            var response = {
              status: 0,
              message_english: "User not found",
              message_aramaic: "ተጠቃሚ አልተገኘም",
              data: {},
            };
            res.send(response);
          }
        }
      );
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.post(
  "/resetPassword",
  [
    body("password")
      .exists()
      .withMessage({
        message_english: "Please send password",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("confirm_password")
      .exists()
      .withMessage({
        message_english: "Please send confirm_password",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("userId")
      .exists()
      .withMessage({
        message_english: "Please send userId",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }
    try {
      if (req.body.password == req.body.confirm_password) {
        Users.findOneAndUpdate(
          { _id: req.body.userId },
          { password: bcrypt.hashSync(req.body.password, salt) },
          async function (err, user) {
            if (err) throw err;
            var response = {
              status: 1,
              message_english: "Password updated successfully",
              message_aramaic: "የይለፍ ቃል በተሳካ ሁኔታ ዘምኗል",
              data: { userId: user._id },
            };
            res.send(response);
          }
        );
      } else {
        var response = {
          status: 0,
          message_english: "Password and confirm password do not match",
          message_aramaic: "የይለፍ ቃል እና ያረጋግጡ የይለፍ ቃል አይዛመዱም",
          data: {},
        };
        res.send(response);
      }
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

// router.post("/checkFacebook", function (req, res) {
//     var form = new formidable.IncomingForm();
//     form.parse(req, async function (err, fields, files) {

//         if (fields.facebook_id) {

//             UsersTbl.findOne({ facebook_id: fields.facebook_id, is_show: 1, status: 1 }, async function (err, checkuser) {

//                 if (checkuser) {

//                     if (checkuser.verified) {
//                         checkuser = checkuser.toObject();
//                         checkuser.img_url = globals.serverUrl + "public/uploads/images/user_images/";

//                         UsersTbl.findOneAndUpdate({ _id: checkuser._id }, { notification_token: fields.notification_token }, async function (updateError, updateSuccess) {
//                             if (updateError) { throw updateError; };
//                             var jsonData = { status: 1, verified: 1, message: "Login successfully", data: checkuser }
//                             res.send(jsonData);
//                         });

//                     } else {

//                         var GeneratedOTP = commonHelper.generateOTP();
//                         mailContent.email = checkuser.email;
//                         mailContent.otp = GeneratedOTP;
//                         mailContent.slug = "verify-account";
//                         await commonHelper.EasyMail(mailContent);

//                         UsersTbl.findOneAndUpdate({ _id: checkuser._id }, { otp: GeneratedOTP, otp_status: 1, notification_token: fields.notification_token }, async function (updateError, updateSuccess) {
//                             if (updateError) { throw updateError; };

//                             var jsonData = { status: 0, verified: 0, message: "Your email is not verified Please verifiy your email", data: { _id: checkuser._id } }
//                             res.send(jsonData);
//                         });

//                     }

//                 } else {
//                     var jsonData = { status: 0, verified: 1, message: "Facebook account not found" }
//                     res.send(jsonData);
//                 }
//             });
//         } else {
//             var jsonData = { status: 0, verified: 1, message: "Please provide facebook id" }
//             res.send(jsonData);
//         }
//     });
// });

// router.post("/facebookSignup", async function (req, res) {
//     var form = new formidable.IncomingForm();
//     form.parse(req, async function (err, fields, files) {

//         if (fields.facebook_id) {
//             if (fields.email) {
//                 if (fields.mobile) {

//                     var condition = {
//                         $or:
//                             [
//                                 { email: fields.email, is_show: 1 },
//                                 { mobile: fields.mobile, is_show: 1 },
//                                 { facebook_id: fields.facebook_id, is_show: 1 },
//                             ]
//                     };

//                     UsersTbl.findOne(condition, async function (checkError, checkSuccess) {
//                         if (checkError) { throw checkError; };

//                         if (!checkSuccess) {

//                             var GeneratedOTP = await commonHelper.generateOTP();

//                             var newUser = UsersTbl({
//                                 email: fields.email,
//                                 mobile: fields.mobile,
//                                 facebook_id: fields.facebook_id,
//                                 username: fields.username,
//                                 device_id: fields.device_id,
//                                 device_type: fields.device_type,
//                                 otp: GeneratedOTP,
//                                 otp_status: 1,
//                                 verified: 0,
//                                 role_id: 4,
//                             });

//                             newUser.save(async function (saveError, saveSuccess) {
//                                 if (saveError) { throw saveError; }

//                                 mailContent.email = fields.email;
//                                 mailContent.user = fields.username;
//                                 mailContent.otp = GeneratedOTP;
//                                 mailContent.slug = "sign-up";
//                                 commonHelper.EasyMail(mailContent);

//                                 if (saveSuccess) {
//                                     var jsonData = { status: 1, dataflow: 1, message: "Your profile updated successfully please verify your email.", data: { _id: saveSuccess._id } }
//                                     res.send(jsonData);
//                                 } else {
//                                     var jsonData = { status: 0, dataflow: 0, message: "Oops something happening wrong please try after some time." }
//                                     res.send(jsonData);
//                                 }

//                             });

//                         } else {

//                             if (checkSuccess.email == fields.email) {
//                                 var jsonData = { status: 0, dataflow: 0, message: "Email already exists." }
//                                 res.send(jsonData);
//                             } else if (checkSuccess.mobile == fields.mobile) {
//                                 var jsonData = { status: 0, dataflow: 0, message: "Phone number already exists." }
//                                 res.send(jsonData);
//                             } else {
//                                 var jsonData = { status: 0, dataflow: 0, message: "Facebook id already exists." }
//                                 res.send(jsonData);
//                             }
//                         }

//                     });

//                 } else {
//                     var jsonData = { status: 0, dataflow: 0, message: "Please provide Phone number." }
//                     res.send(jsonData);
//                 }
//             } else {
//                 var jsonData = { status: 0, dataflow: 0, message: "Please provide email id." }
//                 res.send(jsonData);
//             }
//         } else {
//             var jsonData = { status: 0, dataflow: 0, message: "Facebook id not found" }
//             res.send(jsonData);
//         }
//     });
// });

// router.post("/facebookLogin", function (req, res) {
//     var form = new formidable.IncomingForm();
//     form.parse(req, async function (err, fields, files) {

//         if (fields.facebook_id) {
//             Users.find({ facebook_id: fields.facebook_id }, function (err, checkuser) {

//                 if (checkuser.length) {

//                     if (checkuser[0].email) {  //check if email exists or not
//                         if (checkuser[0].verified) { // check if email is verified or not

//                             var user_data = checkuser[0].toObject();
//                             user_data.base_image_url = globals.serverUrl + "public/uploads/images/user_images/";
//                             var responseData = { user_data: user_data }

//                             var jsonData = { status: 1, message: "Login Successfully", dataflow: 1, verified: 1, email: 1, data: responseData }
//                             res.send(jsonData);

//                         } else {
//                             var jsonData = { status: 1, message: "Please verify email account", dataflow: 0, verified: 0, email: 0, data: { id: checkuser[0]._id } }
//                             res.send(jsonData);
//                         }

//                     } else {
//                         var jsonData = { status: 1, message: "Please provide email account", dataflow: 0, verified: 0, email: 0, data: { id: checkuser[0]._id } }
//                         res.send(jsonData);
//                     }

//                 } else {

//                     var user = new Users({
//                         first_name: fields.first_name,
//                         last_name: fields.last_name,
//                         device_id: fields.device_id,
//                         device_type: fields.device_type,
//                         mobile: fields.mobile,
//                         email: (fields.email) ? fields.email.toLowerCase() : '',
//                         verified: (fields.email) ? 1 : 0,
//                         facebook_id: fields.facebook_id,
//                         verified: 1,
//                         role_id: 4,
//                         account_created_by: 2,
//                     });
//                     user.save(function (err, saveUsingFacebook) {
//                         if (err) throw err;

//                         if (saveUsingFacebook.email) {

//                             var user_data = saveUsingFacebook.toObject();
//                             // user_data.base_image_url = globals.serverUrl + "public/uploads/images/user_images/";
//                             // var responseData = { user_data:user_data }

//                             var jsonData = { status: 1, message: "Registerd successfully", dataflow: 1, verified: 1, email: 1, data: user_data }
//                             res.send(jsonData);
//                         } else {

//                             var jsonData = { status: 1, message: "Please provide email account", verified: 0, email: 0, data: { id: saveUsingFacebook._id } }
//                             res.send(jsonData);
//                         }
//                     });
//                 }
//             });
//         } else {
//             var jsonData = { status: 0, message: "Please provide facebook id" }
//             res.send(jsonData);
//         }
//     });
// });

router.post("/checkSociallogin", async (req, res) => {
  try {
    if (req.query.id) {
      let user = await Users.findOne({
        $or: [{ facebookId: req.query.id }, { googleId: req.query.id }],
      });
      if (user) {
        console.log(user);
        //yha kam krna hai

        Users.findByIdAndUpdate(
          user._id,
          {
            notificationToken: req.body.notificationToken,
            deviceType: req.body.deviceType,
          },
          (err, doc) => {
            if (err) console.log(err);
            if (doc) console.log("Notification updated");
          }
        );

        jwt.sign(
          { _id: user._id },
          process.env.privateKey,
          { expiresIn: "30 days" },
          function (err, token) {
            if (err) console.log(err);
            var imageUrl =
              process.env.url + "/public/uploads/images/provider_images/";
            var userData = {
              userId: user._id,
              name: user.name,
              username: user.username,
              email: user.email,
              socialLoginType: user.socialLoginType,
              socialId: user.googleId || user.facebookId,
              profilePicture: user.profilePicture,
              mobile: user.mobile,
              role_id: user.role_id,
              imageUrl: imageUrl,
              pushNotiAccess: user.pushNotiAccess,
              smsAccess: user.smsAccess,
              referralSelf: user.referralSelf,
            };
            var data = { userData: userData };
            // console.log(data,'data')
            var response = {
              status: 1,
              message_english: "Login Successfully",
              message_aramaic: "በተሳካ ሁኔታ ይግቡ",
              data: data,
              token: token,
              isRegistered: true,
            };
            res.send(response);
          }
        );
      } else {
        var jsonData = {
          status: 1,
          message_english: "Please signup",
          message_aramaic: "ሞባይል አልተመዘገበም",
          data: {},
          isRegistered: false,
        };
        res.send(jsonData);
      }
    } else {
      var jsonData = {
        status: 0,
        message_english: "Please send social id",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: {},
      };
      res.send(jsonData);
    }
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.post(
  "/socialSignup",
  [
    body("userId")
      .exists()
      .withMessage({
        message_english: "Please send user Id",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("socialLoginType")
      .exists()
      .withMessage({
        message_english: "Please send socialLoginType",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("socialId")
      .exists()
      .withMessage({
        message_english: "Please send socialId",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("mobile")
      .exists()
      .withMessage({
        message_english: "Please send mobile",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isNumeric()
      .withMessage({
        message_english: "Please send numeric value",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ min: 9 })
      .withMessage({
        message_english: "Must be minimum 9 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ max: 19 })
      .withMessage({
        message_english: "Must be maximum 19 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("name")
      .exists()
      .withMessage({
        message_english: "Please send name",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("city")
      .exists()
      .withMessage({
        message_english: "Please send city",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }
    try {
      Users.findOne(
        {
          _id: mongoose.Types.ObjectId(req.body.userId),
          mobile: req.body.mobile,
          isSignup: 1,
          status: 1,
          is_show: 1,
        },
        async (err, doc) => {
          if (err) console.log(err);
          if (doc) {
            var jsonData = {
              status: 0,
              message_english: "Already signup! Please login",
              message_aramaic: "ሞባይል አልተመዘገበም",
              data: {},
            };
            res.send(jsonData);
          } else {
            console.log("here");
            let data = {};
            if (req.body.refercode && req.body.refercode.length) {
              data = await commonHelper.checkRefercode(req.body.refercode);
            }
            var admin = await Users.findOne({ role_id: 1 });
            let global = await Global.findOne({ type: "Global" });
            Users.findOneAndUpdate(
              {
                _id: mongoose.Types.ObjectId(req.body.userId),
                mobile: req.body.mobile,
              },
              {
                name: req.body.name,
                city: req.body.city,
                socialLoginType: req.body.socialLoginType,
                facebookId:
                  req.body.socialLoginType == "Facebook"
                    ? req.body.socialId
                    : "",
                googleId:
                  req.body.socialLoginType == "Google" ? req.body.socialId : "",
                isSignup: 1,
                wallet: data.status ? global.referralAmountTo : 0,
                referralUsed: req.body.refercode ? req.body.refercode : "",
                referralSelf: commonHelper.generateReferral(),
              },
              function (err, user) {
                if (err) throw err;
                jwt.sign(
                  { _id: user._id },
                  process.env.privateKey,
                  { expiresIn: "30 days" },
                  function (err, token) {
                    if (err) console.log(err);
                    var imageUrl =
                      process.env.url +
                      "/public/uploads/images/provider_images/";
                    var userData = {
                      userId: user._id,
                      name: req.body.name,
                      username: user.username,
                      email: user.email,
                      socialLoginType: user.socialLoginType,
                      socialId: user.googleId || user.facebookId,
                      profilePicture: user.profilePicture,
                      mobile: user.mobile,
                      role_id: user.role_id,
                      imageUrl: imageUrl,
                      pushNotiAccess: user.pushNotiAccess,
                      smsAccess: user.smsAccess,
                      referralSelf: user.referralSelf,
                    };
                    var data = { userData: userData };
                    var response = {
                      status: 1,
                      message_english: "Login Successfully",
                      message_aramaic: "በተሳካ ሁኔታ ይግቡ",
                      data: data,
                      token: token,
                    };
                    res.send(response);

                    // Update notification token on login
                    Users.findByIdAndUpdate(
                      user._id,
                      {
                        notificationToken: req.body.notificationToken,
                        deviceType: req.body.deviceType,
                      },
                      (err, doc) => {
                        if (err) console.log(err);
                        if (doc) console.log("Notification updated");
                      }
                    );
                  }
                );

                // var response = { status: 1, message_english: "Sign Up successfully !", message_aramaic: 'በተሳካ ሁኔታ ይመዝገቡ! እባክዎ ይግቡ', data: {} }
                // res.send(response);
                if (data && data.userId) {
                  Users.findOneAndUpdate(
                    { _id: data.userId },
                    { $push: { refercodeUsedBy: user._id } },
                    { new: true },
                    (err, doc) => {
                      if (err) console.log(err);
                      if (doc) {
                      }
                    }
                  );
                  const transaction = new Transaction({
                    date: new Date(),
                    amount: global.referralAmountTo,
                    type: 0,
                    balance: 0,
                    showId: user._id,
                    recieverId: user._id,
                    senderId: admin._id,
                  });
                  transaction.save((err, trans) => {
                    if (err) throw err;
                    if (trans) {
                      console.log(trans);
                      //  console.log(user)
                    }
                  });
                }
              }
            );
          }
        }
      );
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.post(
  "/login",
  [
    body("mobile")
      .isNumeric()
      .withMessage({
        message_english: "Must contain a numeric value",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ min: 9 })
      .withMessage({
        message_english: "Must be minimum 9 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      })
      .isLength({ max: 19 })
      .withMessage({
        message_english: "Must be maximum 19 character",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("password")
      .exists()
      .withMessage({
        message_english: "Please send password",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    if (req.body.password.trim().length < 2) {
      return res.status(200).json({
        status: 0,
        message_english: "Please send password",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
        data: {},
      });
    }
    var condition = {
      $or: [{ mobile: req.body.mobile, role_id: roleId }],
      is_show: 1,
      is_show: 1,
    };

    try {
      Users.findOne(condition, async function (err, result) {
        if (err) throw err;
        if (!result) {
          var response = {
            status: 0,
            message_english: "Mobile not registered",
            message_aramaic: "ሞባይል አልተመዘገበም",
            data: {},
          };
          res.send(response);
        } else {
          if (result.isSignup == 0) {
            var response = {
              status: 0,
              message_english: "You have not signup",
              message_aramaic: "የእርስዎ መለያ በአስተዳዳሪው ቦዝኗል",
              data: {
                userId: result._id,
                mobile: result.mobile,
              },
            };
            res.send(response);
            return;
          }

          if (!result.password && result.socialLoginType) {
            var response = {
              status: 0,
              message_english: `This number is registered using ${result.socialLoginType}.`,
              message_aramaic: "የእርስዎ መለያ በአስተዳዳሪው ቦዝኗል",
              data: {
                userId: result._id,
                mobile: result.mobile,
              },
            };
            res.send(response);
            return;
          }

          if (!result.name && !result.city && result.isSignup == 0) {
            var response = {
              status: 0,
              message_english: "You have not signup",
              message_aramaic: "የእርስዎ መለያ በአስተዳዳሪው ቦዝኗል",
              data: {
                userId: result._id,
                mobile: result.mobile,
              },
            };
            res.send(response);
            return;
          }

          if (result.status == 1) {
            if (bcrypt.compareSync(req.body.password, result.password)) {
              var imageUrl =
                process.env.url + "/public/uploads/images/customer_images/";

              var userData = {
                userId: result._id,
                name: result.name,
                username: result.username,
                email: result.email,
                image: result.image,
                mobile: result.mobile,
                role_id: result.role_id,
                profilePicture: result.profilePicture,
                imageUrl: imageUrl,
                pushNotiAccess: result.pushNotiAccess,
                smsAccess: result.smsAccess,
                referralSelf: result.referralSelf,
              };

              jwt.sign(
                { _id: result._id },
                process.env.privateKey,
                { expiresIn: "30 days" },
                function (err, token) {
                  if (err) console.log(err);
                  var data = { userData: userData };
                  var response = {
                    status: 1,
                    message_english: "Login Successfully",
                    message_aramaic: "በተሳካ ሁኔታ ይግቡ",
                    data: data,
                    token: token,
                  };
                  res.send(response);

                  // Update notification token on login
                  Users.findByIdAndUpdate(
                    result._id,
                    {
                      notificationToken: req.body.notificationToken,
                      deviceType: req.body.deviceType,
                    },
                    (err, doc) => {
                      if (err) console.log(err);
                      if (doc) console.log("Notification updated");
                    }
                  );
                }
              );
            } else {
              var response = {
                status: 0,
                message_english: "Password is incorrect",
                message_aramaic: "የይለፍ ቃል የተሳሳተ ነው",
                data: {},
              };
              res.send(response);
            }
          } else {
            var response = {
              status: 0,
              message_english: "Your account is deactivated by the admin",
              message_aramaic: "የእርስዎ መለያ በአስተዳዳሪው ቦዝኗል",
              data: {},
            };
            res.send(response);
          }
        }
      });
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

// Auth middleware
async function auth(req, res, next) {
  if (req.headers["authentication"]) {
    let token = req.headers["authentication"];
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.privateKey, function (err, decoded) {
      if (err) {
        res.status(401).json({
          status: 0,
          message_english: "Unauthorized",
          message_aramaic: "ያልተፈቀደ",
          data: {},
        });
      }
      if (decoded) {
        req.doc = decoded._id;
        jwt.sign(
          { _id: decoded._id },
          process.env.privateKey,
          { expiresIn: "30 days" },
          function (err, token) {
            if (err) console.log(err);
            res.setHeader("token", token);
            next();
          }
        );
      }
    });
  } else {
    res.status(401).json({
      status: 0,
      message_english: "Unauthorized",
      message_aramaic: "ያልተፈቀደ",
      data: {},
    });
  }
}
// Auth middleware
router.use(auth);

// Authenticated Routes

router.get("/slider", async (req, res) => {
  let slider = await Slider.find({ is_show: 1, status: 1 });
  if (slider) {
    var imageUrl = process.env.url + "/public/uploads/images/guide_images/";
    var response = {
      status: 1,
      message_english: "Slider found successfully",
      data: slider,
      imageUrl: imageUrl,
    };
    res.send(response);
  } else {
    var response = {
      status: 0,
      message_english: "Slider found successfully",
      data: slider,
      imageUrl: imageUrl,
    };
    res.send(response);
  }
});

router.get("/category", async (req, res) => {
  let skip = 0;
  let perPage = null;
  if (req.query.page) {
    let page = parseInt(req.query.page) || 1;
    perPage = parseInt(req.query.perPage) || 10;
    skip = perPage * (page - 1);
  }
  let con = { is_show: 1, status: 1 };
  if (req.query.search) {
    con.$or = [
      {
        name_english: {
          $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
        },
      },
      {
        name_aramaic: {
          $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
        },
      },
    ];
  }

  let count = await Category.countDocuments(con);
  Category.find(
    con,
    "name_english name_aramaic image",
    { skip: skip, limit: perPage },
    function (err, doc) {
      if (err) throw err;
      var imageUrl =
        process.env.url + "/public/uploads/images/categories_images/";
      var response = {
        status: 1,
        message_english: "Category found successfully",
        data: doc,
        imageUrl: imageUrl,
        count,
        page: req.query.page,
      };
      res.send(response);
    }
  );
});

router.get("/subCategory", async (req, res) => {
  let skip = 0;
  let perPage = null;
  if (req.query.page) {
    let page = parseInt(req.query.page) || 1;
    perPage = parseInt(req.query.perPage) || 10;
    skip = perPage * (page - 1);
  }
  let con = { is_show: 1, status: 1, category_id: req.query.categoryId };
  if (req.query.search) {
    con.$or = [
      {
        name_english: {
          $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
        },
      },
      {
        name_aramaic: {
          $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
        },
      },
    ];
  }
  let count = await subCategory.countDocuments(con);
  subCategory.find(
    con,
    "name_english name_aramaic image minDuration category_id",
    { skip: skip, limit: perPage },
    function (err, doc) {
      if (err) throw err;
      var imageUrl =
        process.env.url + "/public/uploads/images/categories_images/";
      var response = {
        status: 1,
        message_english: "Sub category found successfully",
        data: doc,
        imageUrl: imageUrl,
        count,
        page: req.query.page,
      };
      res.send(response);
    }
  );
});

router.get("/getProviderList", async (req, res) => {
  let global = await Global.findOne({ type: "Global" });
  let customer = await Users.findOne({ _id: req.query.userId });
  console.log(req.query);
  let skip = 0;
  let perPage = null;
  if (req.query.page) {
    let page = parseInt(req.query.page) || 1;
    perPage = parseInt(req.query.perPage) || 10;
    skip = perPage * (page - 1);
  }
  var con = {
    role_id: 3,
    status: 1,
    is_show: 1,
    canTakeBooking: true,
    isWorking: false,
    category: { $in: [req.query.category] },
    subCategory: { $in: [req.query.subCategory] },
  };
  if (req.query.search) {
    con.$or = [
      {
        name: {
          $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
        },
      },
      {
        onlyMobile: {
          $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
        },
      },
    ];
  }
  if (req.query.latlng) {
    console.log(req.query.latlng, "req.query.latlng req.query.latlng");
    req.query.latlng = JSON.parse(req.query.latlng);
    var { latitude, longitude } = req.query.latlng;
    console.log(latitude);
    console.log(longitude);
  }

  con.location = {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      $maxDistance: global.defaultRadius * 1000,
      $minDistance: 0,
    },
  };
  console.log(con);
  let count = await Provider.count(con);

  Provider.find(
    con,
    {},
    { skip: skip, limit: perPage }
    // {
    //     $geoNear: {
    //         near: { type: "Point", coordinates: [parseFloat(customer.lng), parseFloat(customer.lat)] },
    //         distanceField: "dis",
    //         maxDistance: global.defaultRadius,
    //         spherical: true,
    //         query: con
    //     },
    // },
  )
    .populate("category")
    .populate("subCategory")
    .lean()
    .exec(async (err, doc) => {
      if (err) {
        let response = { status: 0, message_english: err, data: {} };
        res.send(response);
      }
      if (doc) {
        var imageUrl =
          process.env.url + "/public/uploads/images/provider_images/";
        var categoryUrl =
          process.env.url + "/public/uploads/images/categories_images/";

        if (req.query.latlng) {
          // req.query.latlng = JSON.parse(req.query.latlng)
          // let { latitude, longitude } = req.query.latlng

          let key = process.env.googleApiKey;
          // Getting distnace from google map api
          for await (let item of doc) {
            item.lat = parseFloat(item.lat);
            item.lng = parseFloat(item.lng);
            if (latitude && longitude && item.lat && item.lng) {
              await fetch(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${Number(
                  latitude
                )},${Number(longitude)}&destinations=${Number(
                  item.lat
                )},${Number(item.lng)}&key=${key}`
              )
                .then((res) => res.json())
                .then((json) => {
                  if (
                    json.rows &&
                    json.rows[0] &&
                    json.rows[0].elements[0].status == "OK"
                  ) {
                    item.distance = json.rows[0].elements[0].distance.text;
                    item.duration = json.rows[0].elements[0].duration.text;
                  } else {
                    item.distance = null;
                    item.duration = null;
                  }
                });
            } else {
              item.distance = null;
              item.duration = null;
            }
          }
        }
        console.log("doc", doc.length);
        let response = {
          status: 1,
          message_english: "Here is provider list",
          message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
          data: doc,
          imageUrl,
          categoryUrl,
          count,
          page: req.query.page,
        };
        await res.send(response);
      }
    });
});

router.post(
  "/booking",
  upload.array("image"),
  [
    body("address")
      .exists()
      .withMessage({
        message_english: "Please send address",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("paymentMode")
      .exists()
      .withMessage({
        message_english: "Please send paymentMode",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("subCategory")
      .exists()
      .withMessage({
        message_english: "Please send subCategory",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("type")
      .exists()
      .withMessage({
        message_english: "Please send type",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async function (req, res) {
    let global = await Global.findOne({ type: "Global" });
    // console.log('req.files',req.files)
    // console.log('*******')
    // console.log('req.body',req.body)

    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    if (req.query.latlng) {
      req.query.latlng = JSON.parse(req.query.latlng);
      var { latitude, longitude } = req.query.latlng;
    }

    try {
      const booking = new Booking({
        date: new Date(),
        address: req.body.address,
        additionalNotes: req.body.additionalNotes,
        providerId: req.body.providerId ? req.body.providerId : null,
        image: req.body.image,
        customerId: req.doc,
        image:
          req.files && req.files.length
            ? req.files.map((element) => element.filename)
            : [],
        paymentMode: req.body.paymentMode,
        subCategory: req.body.subCategory,
        category: req.body.category,
        type: req.body.type,
        scheduleDate:
          req.body.type == "scheduled" ? Date(req.body.scheduleDate) : null,
        status: 0,
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng),
        location: {
          type: "Point",
          coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        },
      });
      booking.save(async (err, doc) => {
        if (err) throw err;
        if (doc) {
          var response = {
            status: 1,
            message_english: "Booking added successfully",
            message_aramaic: "ቦታ ማስያዝ በተሳካ ሁኔታ ታክሏል",
            data: doc,
          };
          res.send(response);

          let title = new Notification();
          title.title = `Your booking of id ${doc.bookingId} has placed successfully`;
          title.userId = req.doc;
          title.type = "booking";
          title.save((err, notification) => {
            if (err) {
              console.log(err);
            }
            if (notification) {
              console.log(notification);
            }
          });

          console.log("here");
          let con = {
            role_id: 3,
            status: 1,
            is_show: 1,
            canTakeBooking: true,
            isWorking: false,
            category: { $in: [req.body.category] },
            subCategory: { $in: [req.body.subCategory] },
            $or: [
              { notificationToken: { $ne: null } },
              { notificationToken: { $ne: "" } },
            ],
          };
          con.location = {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [
                  parseFloat(req.body.lng),
                  parseFloat(req.body.lat),
                ],
              },
              $maxDistance: global.defaultRadius * 1000,
              $minDistance: 0,
            },
          };

          let user = await Provider.find(con);
          console.log("***************");

          if (req.body.providerId) {
            await pushNotificationProvider.sendPushNotificationProvider(
              req.body.providerId,
              `You have a new booking`,
              "booking",
              doc._id
            );
          } else {
            for await (let item of user) {
              await commonHelper.assignProviderRoundRobin(item._id, doc._id);
            }
          }

          console.log("***************");
        }
      });
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.get("/booking", async function (req, res) {
  try {
    let skip = 0;
    let perPage = null;
    if (req.query.page) {
      let page = parseInt(req.query.page) || 1;
      perPage = parseInt(req.query.perPage) || 10;
      skip = perPage * (page - 1);
    }
    let con = { customerId: req.doc, is_show: 1 };
    if (req.query.search) {
      con.$or = [
        {
          name_english: {
            $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
          },
        },
        {
          name_aramaic: {
            $regex: new RegExp(".*" + req.query.search.trim() + ".*", "i"),
          },
        },
      ];
    }
    if (req.query.filter) {
      req.query.filter = JSON.parse(req.query.filter);
      // console.log(req.query.filter)
      let temp = 0;
      for (const property in req.query.filter) {
        if (req.query.filter[property]) {
          temp++;
        }
      }
      if (temp) {
        con.$or = [];
        for (const property in req.query.filter) {
          if (req.query.filter[property]) {
            con.$or.push({ status: Number(property) });
          }
        }
      }
    }
    console.log(con);
    let count = await Booking.countDocuments(con);
    Booking.find(
      con,
      null,
      { skip: skip, limit: perPage, sort: { createdAt: -1 } },
      (err, doc) => {
        if (err) console.log(err);
        if (doc) {
          var providerUrl =
            process.env.url + "/public/uploads/images/provider_images/";
          var categoryUrl =
            process.env.url + "/public/uploads/images/categories_images/";
          var bookingUrl =
            process.env.url + "/public/uploads/images/booking_images/";
          var response = {
            status: 1,
            message_english: "Getting booking list",
            message_aramaic: "ቦታ ማስያዝ በተሳካ ሁኔታ ታክሏል",
            data: doc,
            categoryUrl,
            providerUrl,
            bookingUrl,
            count,
            page: req.query.page,
          };
          res.send(response);
        } else {
          var jsonData = {
            status: 1,
            message_english: "No booking found",
            message_aramaic: "ሞባይል አልተመዘገበም",
            data: [],
          };
          res.send(jsonData);
        }
      }
    )
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "providerId",
        model: "Users",
        populate: {
          path: "category",
          model: "categories",
        },
      });
  } catch (e) {
    console.log(e);
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.get("/getSingleBooking", async function (req, res) {
  try {
    Booking.findOne(
      { customerId: req.doc, _id: req.query.bookingId },
      (err, doc) => {
        if (err) console.log(err);
        if (doc) {
          var providerUrl =
            process.env.url + "/public/uploads/images/provider_images/";
          var categoryUrl =
            process.env.url + "/public/uploads/images/categories_images/";
          var bookingUrl =
            process.env.url + "/public/uploads/images/booking_images/";
          var response = {
            status: 1,
            message_english: "Getting single booking",
            message_aramaic: "ቦታ ማስያዝ በተሳካ ሁኔታ ታክሏል",
            data: doc,
            categoryUrl,
            providerUrl,
            bookingUrl,
          };
          res.send(response);
        } else {
          var jsonData = {
            status: 0,
            message_english: "No booking found",
            message_aramaic: "ሞባይል አልተመዘገበም",
            data: {},
          };
          res.send(jsonData);
        }
      }
    )
      .populate({
        path: "providerId",
        model: "Users",
        populate: {
          path: "category",
          model: "categories",
        },
      })
      .populate("category")
      .populate("subCategory");
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.put("/cancelBooking", async function (req, res) {
  try {
    Booking.findOne(
      { customerId: req.doc, _id: req.query.bookingId },
      async (err, doc) => {
        if (err) console.log(err);
        if (doc) {
          let global = await Global.findOne({ type: "Global" });
          var duration = moment.duration(moment().diff(doc.date));
          var min = duration.asMinutes();
          console.log(min);
          if (global.cancellationTime >= min) {
            Booking.findOneAndUpdate(
              { customerId: req.doc, _id: req.query.bookingId },
              { status: 3, cancellationReason: req.body.cancellationReason },
              async (err, doc) => {
                if (err) console.log(err);
                if (doc) {
                  var jsonData = {
                    status: 1,
                    message_english: `Booking canceled successfully`,
                    message_aramaic: "ሞባይል አልተመዘገበም",
                    data: doc,
                  };
                  res.send(jsonData);

                  if (socketList[doc.providerId]) {
                    io.to(socketList[doc.providerId].id).emit(
                      "bookingChange",
                      {}
                    );
                  }

                  if (doc.providerId) {
                    await pushNotificationProvider.sendPushNotificationProvider(
                      doc.providerId,
                      `Your booking of id ${doc.bookingId} has been cancelled`,
                      "booking",
                      doc._id
                    );
                  }

                  let title = new Notification();
                  title.title = `Your booking of id ${doc.bookingId} has been cancelled`;
                  title.userId = req.doc;
                  title.type = "booking";
                  title.save((err, notification) => {
                    if (err) {
                      console.log(err);
                    }
                    if (notification) {
                      console.log(notification);
                    }
                  });
                }
              }
            );
          } else {
            var jsonData = {
              status: 0,
              message_english: `Cancel limit of ${min} is ended`,
              message_aramaic: "ሞባይል አልተመዘገበም",
              data: {},
            };
            res.send(jsonData);
          }
        } else {
          var jsonData = {
            status: 0,
            message_english: "No booking found",
            message_aramaic: "ሞባይል አልተመዘገበም",
            data: {},
          };
          res.send(jsonData);
        }
      }
    );
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.post("/walletTopUp", async function (req, res) {
  let formData = await commonHelper.getFormRecords(req);
  if (formData.fields.amount) {
    if (formData.files.image) {
      var ImageType = formData.files.image.type;
      if (
        ImageType == "image/jpeg" ||
        ImageType == "image/jpg" ||
        ImageType == "image/png"
      ) {
        var uploadedImage = await commonHelper.uploadImages(
          formData.files,
          "wallet_images"
        );
        if (uploadedImage.status == 1) {
          formData.fields.imageis = uploadedImage.imageAr[0];
        }

        var wallet = new Wallet({
          amount: formData.fields.amount,
          userId: req.doc,
          image: formData.fields.imageis ? formData.fields.imageis : "",
        });

        wallet.save(async function (error, success) {
          if (error) {
            var response = {
              status: 0,
              message_english: "Something went wrong",
              message_aramaic: "የኪስ ቦርሳ ጥያቄ በተሳካ ሁኔታ ተፈጥሯል",
            };
            res.send(response);
          }
          var response = {
            status: 1,
            message_english: "Wallet request created successfully",
            message_aramaic: "የኪስ ቦርሳ ጥያቄ በተሳካ ሁኔታ ተፈጥሯል",
            data: success,
          };
          res.send(response);

          let title = new Notification();
          title.title = `Your wallet request of amount ${formData.fields.amount} has been placed`;
          title.userId = req.doc;
          title.type = "wallet";
          title.save((err, notification) => {
            if (err) {
              console.log(err);
            }
            if (notification) {
              console.log(notification);
            }
          });
        });
      }
    } else {
      var response = {
        status: 0,
        message_english: "Please send user id",
        data: {},
      };
      res.send(response);
    }
  } else {
    var response = {
      status: 0,
      message_english: "Please send amount",
      data: {},
    };
    res.send(response);
  }
});

router.put("/start", async (req, res) => {
  if (req.query.bookingId) {
    Booking.findOne({ _id: req.query.bookingId }, (err, booking) => {
      if (err) {
        let response = { status: 0, message_english: err, data: {} };
        res.send(response);
      }
      if (booking) {
        if (booking.startByProvider) {
          Booking.findOneAndUpdate(
            { _id: req.query.bookingId },
            { start: moment(), status: 5 },
            { new: true },
            async (err, doc) => {
              if (err) {
                let response = { status: 0, message_english: err, data: {} };
                res.send(response);
              }
              if (doc) {
                let response = {
                  status: 1,
                  message_english: "Service Started successfully",
                  message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
                  data: doc,
                };
                res.send(response);

                if (socketList[doc.providerId]) {
                  io.to(socketList[doc.providerId].id).emit(
                    "bookingChange",
                    {}
                  );
                }

                await pushNotificationProvider.sendPushNotificationProvider(
                  doc.providerId,
                  `Your booking id ${doc.bookingId} has been acknowledged by customer`,
                  "booking",
                  doc._id
                );

                let title = new Notification();
                title.title = `Your booking id ${doc.bookingId} has been acknowledged by customer`;
                title.userId = doc.providerId;
                title.type = "booking";
                title.save((err, notification) => {
                  if (err) {
                    console.log(err);
                  }
                  if (notification) {
                    console.log(notification);
                  }
                });
              }
            }
          );
        } else {
          let response = {
            status: 0,
            message_english: "The provider has to start service",
            message_aramaic: "አቅራቢው አገልግሎት መጀመር አለበት",
            data: {},
          };
          res.send(response);
        }
      } else {
        let response = {
          status: 0,
          message_english: "cant find booking",
          message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
          data: {},
        };
        res.send(response);
      }
    });
  } else {
    let response = {
      status: 0,
      message_english: "Please send booking id",
      message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
      data: {},
    };
    res.send(response);
  }
});

router.put("/end", async (req, res) => {
  if (req.query.bookingId) {
    Booking.findOne({ _id: req.query.bookingId }, (err, booking) => {
      if (err) {
        let response = { status: 0, message_english: err, data: {} };
        res.send(response);
      }
      if (booking) {
        if (!booking.startByProvider) {
          let response = {
            status: 0,
            message_english: "Service start is not acknowledge by customer",
            message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
            data: {},
          };
          res.send(response);
          return;
        }

        if (booking.endByProvider && booking.seconds) {
          // NOTE: here we will calculate price and and booking ends
          // Diff between start and end in min and calculate using formula and time in category price
          // Paramenters service start time, service end time , min rate of that sub category, min duration of that subcategory
          let price = commonHelper.calculatePrice(
            booking.seconds,
            booking.subCategory.minRate,
            booking.subCategory.minDuration
          );
          Booking.findOneAndUpdate(
            { _id: req.query.bookingId },
            { end: moment(), status: 6, price: price },
            { new: true },
            async (err, doc) => {
              if (err) {
                let response = { status: 0, message: err, data: {} };
                res.send(response);
              }
              if (doc) {
                let response = {
                  status: 0,
                  message_english:
                    "Service Ended successfully and the price is calculated",
                  message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጠናቅቋል እናም ዋጋው ተሰላ",
                  data: doc,
                };
                res.send(response);

                if (socketList[doc.providerId]) {
                  io.to(socketList[doc.providerId].id).emit(
                    "bookingChange",
                    {}
                  );
                }

                await pushNotificationProvider.sendPushNotificationProvider(
                  doc.providerId,
                  `Your booking id ${doc.bookingId} has been acknowledged by customer`,
                  "booking",
                  doc._id
                );

                let title = new Notification();
                title.title = `Your booking id ${doc.bookingId} has been acknowledged by customer`;
                title.userId = doc.providerId;
                title.type = "booking";
                title.save((err, notification) => {
                  if (err) {
                    console.log(err);
                  }
                  if (notification) {
                    console.log(notification);
                  }
                });

                let admin = await Provider.findOneAndUpdate(
                  { _id: doc.providerId },
                  { isWorking: false }
                );
              }
            }
          );
        } else {
          let response = {
            status: 0,
            message_english: "The provider has to end service",
            message_aramaic: "አቅራቢው አገልግሎቱን ማብቃት አለበት",
            data: {},
          };
          res.send(response);
        }
      } else {
        let response = {
          status: 0,
          message_english: "Cant find booking",
          message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
          data: {},
        };
        res.send(response);
      }
    }).populate("subCategory");
  } else {
    let response = {
      status: 0,
      message_english: "Please send booking id",
      message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
      data: {},
    };
    res.send(response);
  }
});

// Payment
router.post("/pay", async (req, res) => {
  if (req.body.bookingId) {
    Booking.findOne({ _id: req.body.bookingId }, async (err, booking) => {
      if (err) {
        let response = { status: 0, message_english: err, data: {} };
        res.send(response);
      }
      if (booking) {
        let price = booking.price;
        let discountPrice = 0;
        if (req.body.promoCode) {
          let today = new Date();
          let couponData = await Promocode.findOne({
            _id: req.body.promoCode,
            status: 1,
            is_show: 1,
            startDate: { $lte: today },
            endDate: { $gt: today },
          });
          if (!couponData) {
            var jsonData = {
              status: 0,
              message_english: "Coupon Code Invalid",
              message_aramaic: "የአውታረ መረብ ስህተት",
              data: {},
            };
            return res.send(jsonData);
          }

          if (couponData.type == "Percentage") {
            discountPrice =
              (Number(booking.price) * Number(couponData.discount)) / 100;
          } else {
            discountPrice = Number(booking.price) - Number(couponData.discount);
          }

          price = price - discountPrice;
        }

        console.log(price, "price");

        // COD
        if (req.body.paymentMode == "cod") {
          let data = await commonHelper.splitCommission(
            "cod",
            price,
            booking.providerId,
            booking.customerId
          );
          if (data.status == 1) {
            let temp = await Booking.findOneAndUpdate(
              { _id: booking._id },
              {
                paymentMode: req.body.paymentMode,
                isPaymentReceived: "customerDone",
                discountPrice: discountPrice,
                payablePrice: price,
                promoCode: req.body.promoCode,
              },
              { new: true }
            );
            res.json({
              status: 1,
              message_english: "Payment is processed, Provider will confirm it",
              message_aramaic: "ክፍያ ተከናውኗል",
              data: temp,
            });

            if (socketList[booking.providerId]) {
              io.to(socketList[booking.providerId].id).emit(
                "bookingChange",
                {}
              );
            }

            await pushNotificationProvider.sendPushNotificationProvider(
              booking.providerId,
              `Your booking id ${booking.bookingId} payment is done by cod please confirm it`,
              "booking",
              doc._id
            );

            let title = new Notification();
            title.title = `Your booking id ${booking.bookingId} payment is done by cod please confirm it`;
            title.userId = booking.providerId;
            title.type = "booking";
            title.save((err, notification) => {
              if (err) {
                console.log(err);
              }
              if (notification) {
                console.log(notification);
              }
            });

            let user = await Users.findOneAndUpdate(
              { _id: req.doc },
              { $push: { promocodeUsed: req.body.promoCode } }
            );
          } else {
            res.json({
              status: 0,
              message_english: "Somethinsg went wrong",
              message_aramaic: "ክፍያ ተከናውኗል",
              data: {},
            });
          }
        }
        // Online paymnet
        if (req.body.paymentMode == "online") {
          // TODO: Online Payment Code here
          // Will be done later
          //  console.log('CheckoutExpress')

          var sellerCode = "SB1380";
          var useSandbox = true; //set this false on your production environment

          var successUrlReturn = "https://massdl.devtechnosys.tech/payment";
          var ipnUrlReturn = "PAYMENT_COMPLETION_NOTIFICATION_URL";
          var cancelUrlReturn = "https://massdl.devtechnosys.tech/payment";
          var failureUrl = "https://massdl.devtechnosys.tech/payment";
          var expiresAfter = 100;
          // var orderId = req.body.bookingId;
          var orderId = req.body.bookingId;

          var checkoutOptions = ypco.checkoutOptions(
            sellerCode,
            orderId,
            ypco.checkoutType.Express,
            useSandbox,
            expiresAfter,
            successUrlReturn,
            cancelUrlReturn,
            ipnUrlReturn,
            failureUrl
          );

          var checkoutItem = {
            ItemName: req.body.bookingId,
            UnitPrice: price,
            DeliveryFee: "0",
            Discount: "0",
            Tax1: "0",
            Tax2: "0",
            HandlingFee: "0",
            Quantity: "1",
          };
          var url = ypco.checkout.GetCheckoutUrlForExpress(
            checkoutOptions,
            checkoutItem
          );

          // console.log(url,'url')

          res.json({
            status: 1,
            message_english: "Opening in url",
            message_aramaic: "ክፍያ ተከናውኗል",
            url,
          });
        }
        // In app wallet
        if (req.body.paymentMode == "wallet") {
          let data = await commonHelper.splitCommission(
            "wallet",
            price,
            booking.providerId,
            booking.customerId
          );
          if (data.status == 1) {
            let temp = await Booking.findOneAndUpdate(
              { _id: booking._id },
              {
                paymentMode: req.body.paymentMode,
                status: 7,
                discountPrice: discountPrice,
                payablePrice: price,
                promoCode: req.body.promoCode,
              },
              { new: true }
            );
            res.json({
              status: 1,
              message_english: "Payment Done",
              message_aramaic: "ክፍያ ተከናውኗል",
              data: temp,
            });

            if (socketList[booking.providerId]) {
              io.to(socketList[booking.providerId].id).emit(
                "bookingChange",
                {}
              );
            }

            await pushNotificationProvider.sendPushNotificationProvider(
              booking.providerId,
              `Your booking id ${booking.bookingId} payment is done by wallet`,
              "booking",
              doc._id
            );

            let title = new Notification();
            title.title = `Your booking id ${booking.bookingId} payment is done by wallet`;
            title.userId = booking.providerId;
            title.type = "booking";
            title.save((err, notification) => {
              if (err) {
                console.log(err);
              }
              if (notification) {
                console.log(notification);
              }
            });

            let user = await Users.findOneAndUpdate(
              { _id: req.doc },
              { $push: { promocodeUsed: req.body.promoCode } }
            );
          }
        }
      } else {
        let response = {
          status: 0,
          message_english: "cant find booking",
          message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
          data: {},
        };
        res.send(response);
      }
    });
  } else {
    let response = {
      status: 0,
      message_english: "Please send booking id",
      message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
      data: {},
    };
    res.send(response);
  }
});

router.post("/paymentGatway", async (req, res) => {
  console.log(req.query);
  console.log(req.body);

  paymentGatwayData = {
    BuyerId: req.query.BuyerId,
    TransactionCode: req.query.TransactionCode,
    TransactionId: req.query.TransactionId,
    Status: req.query.Status,
  };
  if (req.query.Status == "Paid") {
    Booking.findOne({ _id: req.body.bookingId }, async (err, booking) => {
      if (err) {
        let response = { status: 0, message_english: err, data: {} };
        res.send(response);
      }
      if (booking) {
        let data = await commonHelper.splitCommission(
          "wallet",
          booking.price,
          booking.providerId,
          booking.customerId
        );
        if (data.status == 1) {
          let temp = await Booking.findOneAndUpdate(
            { _id: booking._id },
            {
              paymentMode: req.body.paymentMode,
              status: 7,
              paymentGatwayData: paymentGatwayData,
              discountPrice: booking.discountPrice,
              payablePrice: booking.price,
              promoCode: req.body.promoCode,
            },
            { new: true }
          );
          res.json({
            status: 1,
            message_english: "Payment Done",
            message_aramaic: "ክፍያ ተከናውኗል",
            data: temp,
          });

          if (socketList[booking.providerId]) {
            io.to(socketList[booking.providerId].id).emit("bookingChange", {});
          }

          await pushNotificationProvider.sendPushNotificationProvider(
            booking.providerId,
            `Your booking id ${booking.bookingId} payment is done by Online payment`,
            "booking",
            doc._id
          );

          let title = new Notification();
          title.title = `Your booking id ${booking.bookingId} payment is done by Online payment`;
          title.userId = doc.providerId;
          title.type = "booking";
          title.save((err, notification) => {
            if (err) {
              console.log(err);
            }
            if (notification) {
              console.log(notification);
            }
          });

          let user = await Users.findOneAndUpdate(
            { _id: req.doc },
            { $push: { promocodeUsed: req.body.promoCode } }
          );
        }
      }
    });
  } else if (req.query.Status == "Canceled") {
    res.json({
      status: 0,
      message_english: "Payment is cancelled by user",
      message_aramaic: "ክፍያ ተከናውኗል",
      data: {},
    });
  } else {
    console.log("in else");
  }
});

router.post("/statusChange", async (req, res) => {
  if (req.body.bookingId) {
    Booking.findOneAndUpdate(
      { _id: req.body.bookingId },
      { status: req.body.status },
      { new: true },
      (err, doc) => {
        if (err) {
          let response = { status: 0, message: err, data: {} };
          res.send(response);
        }
        if (doc) {
          let response = {
            status: 0,
            message_english: "Status updated successfully",
            message_aramaic: "ሁኔታ በተሳካ ሁኔታ ዘምኗል",
            data: doc,
          };
          res.send(response);
          if (doc.status == 3) {
            let title = new Notification();
            title.title = `${doc.bookingId} is Confirmed for Customer= ${doc.customerId.name} and Provider= ${doc.providerId.name}`;
            title.isRead = false;
            title.save((err, notification) => {
              if (err) {
                console.log(err);
              }
              if (notification) {
                console.log(notification);
              }
            });
          }
        }
      }
    )
      .populate("customerId", "name")
      .populate("providerId", "name");
  } else {
    let response = {
      status: 0,
      message_english: "Please send booking id",
      message_aramaic: "አገልግሎት በተሳካ ሁኔታ ተጀምሯል",
      data: {},
    };
    res.send(response);
  }
});

// router.post('/getBooking', async (req, res) => {
//     let pageNo = parseInt(req.body.pageNo);
//     let size = parseInt(req.body.size);
//     let query = {}
//     if (pageNo < 0 || pageNo === 0) {
//         pageNo = 1;
//     }
//     query.skip = size * (pageNo - 1)
//     query.limit = size
//     let customerId = mongoose.Types.ObjectId(req.body.customerId)
//     let searchQuery = {
//         customerId: customerId || req.doc
//     }
//     // console.log(searchQuery)
//     // searchQuery.is_show = 1;
//     Booking.countDocuments(searchQuery, function (err, totalCount) {
//         if (err) {
//             response = { "status": 0, "message": "Error fetching data" }
//         }
//         Booking.aggregate([
//             {
//                 $match: searchQuery
//             },
//             {
//                 $skip: query.skip
//             },
//             {
//                 $limit: query.limit
//             },
//             {
//                 $sort: { 'createdAt': -1 }
//             }
//         ]).exec(async function (err, data) {
//             if (err) {
//                 response = { "status": 0, "message_english": "Error fetching data" };
//             } else {
//                 response = { "status": 1, "data": data, "totalCount": totalCount, 'pageNo': pageNo, 'size': size };
//             }
//             res.json(response);
//         });
//     });
// })

router.get("/address", async (req, res) => {
  try {
    let address = await Address.find({
      customerId: req.doc,
      is_show: 1,
      status: 1,
    }).populate("city");
    if (address) {
      var response = {
        status: 1,
        message_english: "Address list",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ታክሏል",
        data: address,
      };
      res.send(response);
    } else {
      var response = {
        status: 0,
        message_english: "No address found",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ታክሏል",
        data: [],
      };
      res.send(response);
    }
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.get("/getDefaultAddress", async (req, res) => {
  try {
    let address = await Address.findOne({
      customerId: req.doc,
      is_show: 1,
      status: 1,
      isDefault: true,
    }).populate("city");
    if (address) {
      var response = {
        status: 1,
        message_english: "Address list",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ታክሏል",
        data: address,
      };
      res.send(response);
    } else {
      var response = {
        status: 0,
        message_english: "No address found",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ታክሏል",
        data: [],
      };
      res.send(response);
    }
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.post(
  "/addAddress",
  [
    body("type")
      .exists()
      .withMessage({
        message_english: "Please send type",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    // body('customerId').exists().withMessage({ message_english: 'Please send customerId', message_aramaic: 'ኦቲፒ በተሳካ ሁኔታ ተልኳል', }),
    body("address")
      .exists()
      .withMessage({
        message_english: "Please send address",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("city")
      .exists()
      .withMessage({
        message_english: "Please send city",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    // body('streetNo').exists().withMessage({ message_english: 'Please send streetNo', message_aramaic: 'ኦቲፒ በተሳካ ሁኔታ ተልኳል', }),
    // body('Hno').exists().withMessage({ message_english: 'Please send Hno', message_aramaic: 'ኦቲፒ በተሳካ ሁኔታ ተልኳል', }),
    body("zipCode")
      .exists()
      .withMessage({
        message_english: "Please send zipCode",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("lat")
      .exists()
      .withMessage({
        message_english: "Please send lat",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("lng")
      .exists()
      .withMessage({
        message_english: "Please send lng",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async (req, res) => {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    try {
      let isAddress = await Address.countDocuments({ customerId: req.doc });

      const address = new Address({
        type: req.body.type,
        customerId: req.doc,
        // state: req.body.state,
        city: req.body.city,
        // streetNo: req.body.streetNo,
        // Hno: req.body.Hno,
        zipCode: req.body.zipCode,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        isDefault: isAddress ? false : true,
        location: {
          type: "Point",
          coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        },
      });
      address.save((err, doc) => {
        if (err) throw err;
        if (doc) {
          var response = {
            status: 1,
            message_english: "Address added successfully",
            message_aramaic: "አድራሻ በተሳካ ሁኔታ ታክሏል",
            data: doc,
          };
          res.send(response);
        }
      });
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.put(
  "/editAddress",
  [
    body("addressId")
      .exists()
      .withMessage({
        message_english: "Please send addressId",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("type")
      .exists()
      .withMessage({
        message_english: "Please send type",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("city")
      .exists()
      .withMessage({
        message_english: "Please send city",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("address")
      .exists()
      .withMessage({
        message_english: "Please send address",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("zipCode")
      .exists()
      .withMessage({
        message_english: "Please send zipCode",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("lat")
      .exists()
      .withMessage({
        message_english: "Please send lat",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("lng")
      .exists()
      .withMessage({
        message_english: "Please send lng",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async (req, res) => {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    try {
      console.log(req.body);
      Address.findOne({ _id: req.body.addressId }, (err, doc) => {
        if (err) throw err;
        if (!doc) {
          var jsonData = { status: 0, message: "Address Not Found", data: {} };
          res.send(jsonData);
        } else {
          Address.findByIdAndUpdate(
            req.body.addressId,
            {
              type: req.body.type,
              // customerId: req.body.customerId,
              city: req.body.city,
              address: req.body.address,
              zipCode: req.body.zipCode,
              location: {
                type: "Point",
                coordinates: [
                  parseFloat(req.body.lng),
                  parseFloat(req.body.lat),
                ],
              },
              lat: req.body.lat,
              lng: req.body.lng,
            },
            async (err, doc) => {
              if (err) throw err;
              if (doc) {
                var response = {
                  status: 1,
                  message_english: "Address updated successfully",
                  message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
                  data: doc,
                };
                res.send(response);
              } else {
                var response = {
                  status: 0,
                  message_english: "Something went wrong",
                  message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
                  data: doc,
                };
                res.send(response);
              }
            }
          );
        }
      });
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.put("/deleteAddress", async function (req, res) {
  let addressId = mongoose.Types.ObjectId(req.body.addressId);
  if (!addressId) {
    var response = { status: 0, message: "Please send address id", data: {} };
    res.send(response);
  }
  try {
    let isExist = await Address.countDocuments({
      _id: addressId,
      isDefault: true,
    });
    if (isExist) {
      var jsonData = {
        status: 0,
        message_english: "Default address can not be deleted",
        message_aramaic: "ሞባይል አልተመዘገበም",
        data: {},
      };
      res.send(jsonData);
      return;
    }
    Address.findOneAndUpdate({ _id: addressId }, { is_show: 0 }, (err, doc) => {
      if (err) throw err;
      if (doc) {
        var response = {
          status: 1,
          message_english: "Address deleted successfully",
          message_aramaic: "አድራሻው በተሳካ ሁኔታ ተሰር deletedል",
          data: doc,
        };
        res.send(response);
      } else {
        var jsonData = {
          status: 0,
          message_english: "Something went wrong",
          message_aramaic: "ሞባይል አልተመዘገበም",
          data: {},
        };
        res.send(jsonData);
      }
    });
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.put("/makeDefault", async function (req, res) {
  let addressId = mongoose.Types.ObjectId(req.body.addressId);
  if (!addressId) {
    var response = { status: 0, message: "Please send address id", data: {} };
    res.send(response);
  }
  try {
    Address.findOneAndUpdate(
      { _id: addressId },
      { isDefault: true },
      { new: true },
      (err, doc) => {
        if (err) throw err;
        var response = {
          status: 1,
          message_english: "Address updated successfully",
          message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
          data: doc,
        };
        res.send(response);
        Address.updateMany(
          { isDefault: true, _id: { $ne: addressId }, customerId: req.doc },
          { isDefault: false }
        ).exec((err, data) => {
          if (err) console.log(err);
          if (data) console.log(data);
        });
      }
    );
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ሞባይል አልተመዘገበም",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.post("/addRating", async function (req, res) {
  let rating = new Rating({
    customerId: req.doc,
    providerId: req.body.providerId,
    rating: req.body.rating,
    status: 1,
  });
  rating.save((err, doc) => {
    if (err) throw err;
    if (doc) {
      var response = {
        status: 1,
        message_english: "Rating added successfully",
        message_aramaic: "ደረጃ አሰጣጥ በተሳካ ሁኔታ ታክሏል",
        data: doc,
      };
      res.send(response);
      Rating.aggregate(
        [
          {
            $match: {
              providerId: mongoose.Types.ObjectId(req.body.providerId),
            },
          },
          {
            $group: {
              _id: "$providerId",
              rating: { $avg: "$rating" },
              noOfRating: { $sum: 1 },
            },
          },
        ],
        (err, data) => {
          if (err) {
            console.log(err);
          }
          if (data) {
            Provider.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body.providerId) },
              {
                rating: (Math.round(data[0].rating * 2) / 2).toFixed(1),
                noOfRating: data[0].noOfRating,
              },
              (err, doc) => {
                if (err) {
                  console.log(err);
                }
                if (doc) {
                  console.log(doc);
                }
              }
            );
          }
        }
      );

      Booking.findOneAndUpdate(
        { _id: req.body.bookingId },
        { isRated: true },
        { new: true },
        (err, doc) => {
          if (err) {
          }
          if (doc) {
          }
        }
      );
    }
  });
});

router.get("/profile", async (req, res) => {
  Users.findOne({ _id: req.doc }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    if (!doc) {
      var response = {
        status: 0,
        message_english: "User not found",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
        data: {},
      };
      res.send(response);
    } else {
      var imageUrl =
        process.env.url + "/public/uploads/images/customer_images/";
      var response = {
        status: 1,
        message_english: "Here is profile",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
        data: doc,
        imageUrl,
      };
      res.send(response);
    }
  }).populate("refercodeUsedBy", "name mobile");
});

router.put("/profile", async (req, res) => {
  Users.findOneAndUpdate(
    { _id: req.doc },
    {
      name: req.body.name,
      sex: req.body.sex,
      dob: req.body.dob,
      city: req.body.city,
    },
    { new: true },
    (err, doc) => {
      if (err) {
        console.log(err);
      }
      if (doc) {
        var imageUrl =
          process.env.url + "/public/uploads/images/customer_images/";
        var response = {
          status: 1,
          message_english: "Profile updated succesfully",
          message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
          data: doc,
          imageUrl,
        };
        res.send(response);
      } else {
        var response = {
          status: 0,
          message_english: "User not found",
          message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
          data: doc,
        };
        res.send(response);
      }
    }
  );
});

var profileUpdateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/images/customer_images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const profileUpdate = multer({ storage: profileUpdateStorage });

router.put(
  "/profileUpdate",
  profileUpdate.single("image"),
  async (req, res) => {
    if (req.file) {
      Users.findOneAndUpdate(
        { _id: req.doc },
        {
          profilePicture: req.file.filename,
        },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log(err);
          }
          if (doc) {
            var imageUrl =
              process.env.url + "/public/uploads/images/customer_images/";
            var response = {
              status: 1,
              message_english: "Profile updated succesfully",
              message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
              data: doc,
              imageUrl,
            };
            res.send(response);
          } else {
            var response = {
              status: 0,
              message_english: "User not found",
              message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
              data: doc,
            };
            res.send(response);
          }
        }
      );
    } else {
      var response = {
        status: 1,
        message_english: "Something went wrong",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
        data: {},
      };
      res.send(response);
    }
  }
);

// router.post('/sendMessage', async (req, res) => {
//     let formData = await commonHelper.getFormRecords(req)
//     let admin = await Users.findOne({ role_id: 1 })
//     const mesage = new Message({
//         message: req.body.message,
//         type: req.body.type,
//         senderId: req.body.senderId,
//         recieverId: admin._id,
//     })
//     mesage.save((err, doc) => {
//         if (err) throw err
//         if (doc) {
//             var response = { status: 1, message: 'mesage added succesfully', data: doc }
//             res.send(response);
//         }
//     })
// })

var chatStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/images/chat_image");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const chatUpload = multer({ storage: chatStorage });

router.post("/sendMessage", chatUpload.single("message"), async (req, res) => {
  // console.log(req.body)
  // console.log(req.query)
  let admin = await Users.findOne({ role_id: 1 });
  // console.log(req.query.recieverId!=='null'?req.query.recieverId:admin._id,'@@@@')
  Conversation.findOne(
    {
      "user.userId": {
        $all: [
          req.doc,
          req.query.recieverId !== "null" ? req.query.recieverId : admin._id,
        ],
      },
    },
    (err, group) => {
      if (err) {
        console.log(err);
      }
      if (group) {
        let message = new Message();
        message.message =
          req.body.type == "1" ? req.file.filename : req.body.message;
        message.type = req.body.type;
        message.senderId = req.doc;
        message.recieverId =
          req.query.recieverId !== "null" ? req.query.recieverId : admin._id;
        message.conversationId = group._id;
        message.save(async (err, msg) => {
          if (err) {
            console.error(err);
          }
          if (msg) {
            res.json({
              success: 1,
              message: "message Inserted",
              data: msg,
            });
            console.log(req.query.recieverId);

            if (
              socketList[
                req.query.recieverId !== "null"
                  ? req.query.recieverId
                  : admin._id
              ]
            ) {
              io.to(
                socketList[
                  req.query.recieverId !== "null"
                    ? req.query.recieverId
                    : admin._id
                ].id
              ).emit("chatReload", {});
            }

            await pushNotificationProvider.sendPushNotificationProvider(
              req.query.recieverId !== "null"
                ? req.query.recieverId
                : admin._id,
              `You have a new message`,
              "chat",
              req.doc
            );
          }
        });
      } else {
        let newGroup = new Conversation();
        let array = [
          { userId: req.doc },
          {
            userId:
              req.query.recieverId !== "null"
                ? req.query.recieverId
                : admin._id,
          },
        ];
        newGroup.user = array;
        newGroup.save((err, doc) => {
          if (err) {
            console.error(err);
          }
          if (doc) {
            const message = new Message();
            message.message = req.body.message;
            message.type = req.body.type;
            message.senderId = req.doc;
            message.recieverId =
              req.query.recieverId !== "null"
                ? req.query.recieverId
                : admin._id;
            message.conversationId = doc._id;
            message.save(async (err, msg) => {
              if (err) {
                console.error(err);
              }
              if (msg) {
                res.json({
                  success: 1,
                  message: "message Inserted",
                  data: msg,
                });

                if (
                  socketList[
                    req.query.recieverId !== "null"
                      ? req.query.recieverId
                      : admin._id
                  ]
                ) {
                  io.to(
                    socketList[
                      req.query.recieverId !== "null"
                        ? req.query.recieverId
                        : admin._id
                    ].id
                  ).emit("chatReload", {});
                }

                await pushNotificationProvider.sendPushNotificationProvider(
                  req.query.recieverId !== "null"
                    ? req.query.recieverId
                    : admin._id,
                  `You have a new message`,
                  "chat",
                  req.doc
                );
              }
            });
          }
        });
      }
    }
  );
});

router.get("/getMessage", async (req, res) => {
  let admin = await Users.findOne({ role_id: 1 });

  Conversation.findOne(
    {
      "user.userId": {
        $all: [
          req.query.recieverId !== "null" ? req.query.recieverId : admin._id,
          req.doc,
        ],
      },
    },
    async (err, group) => {
      if (err) {
        console.log(err);
      }
      if (group) {
        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 20;
        let skip = perPage * (page - 1);
        let count = await Message.countDocuments({ conversationId: group._id });
        Message.find(
          { conversationId: group._id },
          {},
          { skip: skip, limit: perPage, sort: { createdAt: -1 } }
        ).exec((err, doc) => {
          if (err) console.log(err);
          if (doc) {
            let chatUrl =
              process.env.url + "/public/uploads/images/chat_image/";
            var response = {
              status: 1,
              message_english: "Message list",
              message_aramaic: "የግብይት ዝርዝርን ማግኘት",
              data: doc,
              chatUrl,
              count,
              page: req.query.page,
              senderId: req.doc,
              adminId: admin._id,
            };
            res.send(response);
          } else {
            var response = {
              status: 1,
              message_english: "No messages found",
              message_aramaic: "የግብይት ዝርዝርን ማግኘት",
              data: [],
            };
            res.send(response);
          }
        });
      } else {
        var response = {
          status: 0,
          message_english: "Something went wrong",
          message_aramaic: "የግብይት ዝርዝርን ማግኘት",
          data: [],
        };
        res.send(response);
      }
    }
  );
});

router.get("/getTransaction", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let perPage = parseInt(req.query.perPage) || 10;
  let skip = perPage * (page - 1);
  try {
    let count = await Transaction.countDocuments({ showId: req.doc });
    let customer = await Users.findOne({ _id: req.doc });
    let transaction = await Transaction.find(
      { showId: req.doc },
      {},
      { skip: skip, limit: perPage, sort: { createdAt: -1 } }
    );
    if (transaction) {
      var response = {
        status: 1,
        message_english: "Getting transaction list",
        message_aramaic: "የግብይት ዝርዝርን ማግኘት",
        data: transaction,
        count,
        customer,
        page: req.query.page,
      };
      res.send(response);
    }
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "የአውታረ መረብ ስህተት",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.get("/getFailedTransaction", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let perPage = parseInt(req.query.perPage) || 10;
  let skip = perPage * (page - 1);
  try {
    let count = await Wallet.countDocuments({
      userId: req.doc,
      $or: [{ status: 0 }, { status: 2 }],
    });
    let customer = await Users.findOne({ _id: req.doc });
    let wallet = await Wallet.find(
      { userId: req.doc, $or: [{ status: 0 }, { status: 2 }] },
      {},
      { skip: skip, limit: perPage, sort: { createdAt: -1 } }
    );
    // let transaction = await Transaction.find({ showId: req.doc }, {}, { skip: skip, limit: perPage, sort: { createdAt: -1 } })
    if (wallet) {
      var response = {
        status: 1,
        message_english: "Getting failed transaction list",
        message_aramaic: "የግብይት ዝርዝርን ማግኘት",
        data: wallet,
        count,
        customer,
        page: req.query.page,
      };
      res.send(response);
    }
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "የአውታረ መረብ ስህተት",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.post(
  "/estimateCalculator",
  [
    [
      body("category")
        .exists()
        .withMessage({
          message_english: "Please send addressId",
          message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
        }),
      body("subCategory")
        .exists()
        .withMessage({
          message_english: "Please send addressId",
          message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
        }),
    ],
  ],
  async (req, res) => {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ errors: errors.array() });
    }

    try {
      subCategory
        .findOne({ _id: req.body.subCategory }, (err, doc) => {
          if (err) {
            console.log(err);
          }
          if (doc) {
            var response = {
              status: 1,
              message_english: "Estimate of your service",
              message_aramaic: "የግብይት ዝርዝርን ማግኘት",
              data: doc,
            };
            res.send(response);
          } else {
            var response = {
              status: 0,
              message_english: "No subcategory found",
              message_aramaic: "የግብይት ዝርዝርን ማግኘት",
              data: doc,
            };
            res.send(response);
          }
        })
        .populate("category_id", "name_english name_aramaic");
    } catch (e) {
      var response = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "የግብይት ዝርዝርን ማግኘት",
        data: doc,
      };
      res.send(response);
    }
  }
);

router.put("/notificationUpdate", async (req, res) => {
  Users.findOneAndUpdate(
    { _id: req.doc },
    {
      pushNotiAccess: req.body.pushNotiAccess,
      smsAccess: req.body.smsAccess,
    },
    { new: true },
    (err, doc) => {
      if (err) {
        console.log(err);
      }
      if (doc) {
        var response = {
          status: 1,
          message_english: "Notification setting updated succesfully",
          message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
          data: doc,
        };
        res.send(response);
      } else {
        var response = {
          status: 0,
          message_english: "User not found",
          message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
          data: {},
        };
        res.send(response);
      }
    }
  );
});

router.put(
  "/changePassword",
  [
    body("newPassword")
      .exists()
      .withMessage({
        message_english: "Please send newPassword",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("confirmPassword")
      .exists()
      .withMessage({
        message_english: "Please send confirmPassword",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("oldPassword")
      .exists()
      .withMessage({
        message_english: "Please send oldPassword",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async (req, res) => {
    if (req.body.confirmPassword == req.body.newPassword) {
      Users.findOne({ _id: req.doc }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
          if (bcrypt.compareSync(req.body.oldPassword, doc.password)) {
            doc.password = bcrypt.hashSync(req.body.newPassword, salt);
            doc.save((err, user) => {
              if (err) throw err;
              if (user) {
                var response = {
                  status: 1,
                  message_english: "Password changed successfully",
                  message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
                  response: doc,
                };
                res.send(response);
              }
            });
          } else {
            var response = {
              status: 0,
              message_english: "Old password incorrect",
              message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
              response: {},
            };
            res.send(response);
          }
        }
      });
    } else {
      var response = {
        status: 0,
        message_english: "New password and confirm password do not match",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
        response: {},
      };
      res.send(response);
    }
  }
);

router.post(
  "/contactus",
  [
    body("subject")
      .exists()
      .withMessage({
        message_english: "Please send subject",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("message")
      .exists()
      .withMessage({
        message_english: "Please send message",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async (req, res) => {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    Contactus.updateOne(
      { customerId: req.doc },
      { subject: req.body.subject, message: req.body.message },
      { upsert: true },
      async (err, doc) => {
        if (err) {
          console.log(err);
        }
        if (doc) {
          var response = {
            status: 1,
            message_english: "Your request has been submitted",
            message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተረጋግጧል",
            data: doc,
          };
          res.send(response);

          await commonHelper.contactUs(req.body.subject, req.body.message);
        }
      }
    );
  }
);

router.get("/globalsetting", async function (req, res) {
  Global.findOne({ type: "Global" }, (err, doc) => {
    if (err) {
      throw err;
    }
    if (doc) {
      var response = {
        status: 1,
        message_english: "Global setting",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተረጋግጧል",
        data: doc,
      };
      res.send(response);
    }
  });
});

router.post("/getWalletUrl", async function (req, res) {
  var sellerCode = process.env.yenepayKey;
  var useSandbox = true; //set this false on your production environment
  var successUrlReturn = "https://massdl.devtechnosys.tech/payment";
  var ipnUrlReturn = "PAYMENT_COMPLETION_NOTIFICATION_URL";
  var cancelUrlReturn = "https://massdl.devtechnosys.tech/payment";
  var failureUrl = "https://massdl.devtechnosys.tech/payment";
  var expiresAfter = 100;
  var orderId = req.doc + Date().toISOString;

  var checkoutOptions = ypco.checkoutOptions(
    sellerCode,
    orderId,
    ypco.checkoutType.Express,
    useSandbox,
    expiresAfter,
    successUrlReturn,
    cancelUrlReturn,
    ipnUrlReturn,
    failureUrl
  );

  var checkoutItem = {
    ItemName: "Insert in wallet",
    UnitPrice: req.body.amount,
    DeliveryFee: "0",
    Discount: "0",
    Tax1: "0",
    Tax2: "0",
    HandlingFee: "0",
    Quantity: "1",
  };
  var url = ypco.checkout.GetCheckoutUrlForExpress(
    checkoutOptions,
    checkoutItem
  );

  res.json({
    status: 1,
    message_english: "Opening in url",
    message_aramaic: "ክፍያ ተከናውኗል",
    url,
  });
});

router.post("/paymentGatwayWallet", async (req, res) => {
  // console.log(req.query)
  // console.log(req.body)

  paymentGatwayData = {
    BuyerId: req.query.BuyerId,
    TransactionCode: req.query.TransactionCode,
    TransactionId: req.query.TransactionId,
    Status: req.query.Status,
  };
  if (req.query.Status == "Paid") {
    // Add Money to user wallet (Paid)
    Users.findOneAndUpdate(
      { _id: req.doc },
      { $inc: { wallet: req.body.amount } },
      { new: true }
    ).exec(async (err, doc) => {
      if (err) throw err;
      if (doc) {
        let Admin = await Users.findOne({ role_id: 1 });
        const transaction = new Transaction({
          date: new Date(),
          amount: req.body.amount,
          type: 0,
          balance: doc.wallet,
          showId: req.doc,
          recieverId: req.doc,
          senderId: Admin._id,
          paymentGatwayData: paymentGatwayData,
        });
        transaction.save((err, trans) => {
          if (err) throw err;
          if (trans) {
            //  console.log(trans)
          }
        });
        var response = {
          status: 1,
          message_english: "Wallet updated successfully",
          message_aramaic: "ክፍያ ተከናውኗል",
          data: {},
        };
        res.send(response);

        let title = new Notification();
        title.title = `Your wallet has been credited of amount ${req.body.amount} by online`;
        title.userId = req.doc;
        title.type = "wallet";
        title.save((err, notification) => {
          if (err) {
            console.log(err);
          }
          if (notification) {
            console.log(notification);
          }
        });
      }
    });
  } else if (req.query.Status == "Canceled") {
    res.json({
      status: 0,
      message_english: "Payment is cancelled by user",
      message_aramaic: "ክፍያ ተከናውኗል",
      data: {},
    });
  } else {
    console.log("in else");
  }
});

router.get("/walletCheck", async function (req, res) {
  try {
    Users.findById(req.doc, "wallet", (err, doc) => {
      if (err) {
        throw err;
      }
      if (doc) {
        var response = {
          status: 1,
          message_english: "Current wallet balance",
          message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተረጋግጧል",
          data: doc,
        };
        res.send(response);
      } else {
        var response = {
          status: 0,
          message_english: "No user found",
          message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
          response: {},
        };
        res.send(response);
      }
    });
  } catch (e) {
    var response = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      response: { e },
    };
    res.send(response);
  }
});

router.get("/shareApp", async function (req, res) {
  try {
    Users.findById(
      req.doc,
      "wallet refercodeUsedBy referralSelf referralUsed",
      (err, doc) => {
        if (err) {
          throw err;
        }
        if (doc) {
          var response = {
            status: 1,
            message_english: "Current wallet balance",
            message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተረጋግጧል",
            data: doc,
          };
          res.send(response);
        } else {
          var response = {
            status: 0,
            message_english: "No user found",
            message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
            response: {},
          };
          res.send(response);
        }
      }
    )
      .populate("refercodeUsedBy", "name mobile")
      .lean();
  } catch (e) {
    var response = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      response: { e },
    };
    res.send(response);
  }
});

router.get("/notification", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let perPage = parseInt(req.query.perPage) || 15;
  let skip = perPage * (page - 1);
  try {
    let count = await Notification.countDocuments({ userId: req.doc });
    let notification = await Notification.find(
      { userId: req.doc },
      {},
      { skip: skip, limit: perPage, sort: { createdAt: -1 } }
    );
    if (notification) {
      var response = {
        status: 1,
        message_english: "Getting notification list",
        message_aramaic: "የግብይት ዝርዝርን ማግኘት",
        data: notification,
        count,
        page: req.query.page,
      };
      res.send(response);
    }
  } catch (e) {
    var jsonData = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "የአውታረ መረብ ስህተት",
      data: { e },
    };
    res.send(jsonData);
  }
});

router.post(
  "/promoCode",
  [
    body("promoCode")
      .exists()
      .withMessage({
        message_english: "Please send promoCode",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
    body("bookingId")
      .exists()
      .withMessage({
        message_english: "Please send bookingId",
        message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      }),
  ],
  async (req, res) => {
    // For Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        status: 0,
        message_english: errors.errors[0].msg.message_english,
        message_aramaic: errors.errors[0].msg.message_aramaic,
        data: {},
      });
    }

    let { promoCode, bookingId } = req.body;
    try {
      let today = new Date();
      let booking = await Booking.findById(bookingId);
      let user = await Users.findById(req.doc);
      let couponData = await Promocode.findOne({
        couponCode: promoCode,
        status: 1,
        is_show: 1,
        startDate: { $lte: today },
        endDate: { $gt: today },
      });
      if (!couponData) {
        var jsonData = {
          status: 0,
          message_english: "Coupon Code Invalid",
          message_aramaic: "የአውታረ መረብ ስህተት",
          data: {},
        };
        return res.send(jsonData);
      }

      if (booking && couponData) {
        if (user && user.promocodeUsed && user.promocodeUsed.length) {
          let used = 0;
          user.promocodeUsed.forEach((element) => {
            if (couponData._id.toString() == element.toString()) {
              used++;
            }
          });

          if (used >= couponData.limitPerUser) {
            var jsonData = {
              status: 0,
              message_english: "Coupon Code limit crossed",
              message_aramaic: "የአውታረ መረብ ስህተት",
              data: {},
            };
            return res.send(jsonData);
          }
        }

        let discountPrice = 0;
        if (couponData.type == "Percentage") {
          discountPrice =
            (Number(booking.price) * Number(couponData.discount)) / 100;
        } else {
          discountPrice = Number(booking.price) - Number(couponData.discount);
        }
        var jsonData = {
          status: 1,
          message_english: "Coupon applied successfully",
          message_aramaic: "የአውታረ መረብ ስህተት",
          discountPrice,
          price: booking.price,
          data: couponData,
        };
        return res.send(jsonData);
      } else {
        var jsonData = {
          status: 0,
          message_english: "Something went wrong",
          message_aramaic: "የአውታረ መረብ ስህተት",
          data: {},
        };
        return res.send(jsonData);
      }
    } catch (e) {
      var jsonData = {
        status: 0,
        message_english: "Network Error",
        message_aramaic: "የአውታረ መረብ ስህተት",
        data: { e },
      };
      res.send(jsonData);
    }
  }
);

router.get("/logout", async function (req, res) {
  try {
    Users.findByIdAndUpdate(
      req.doc,
      {
        notificationToken: "",
        deviceType: "",
      },
      (err, doc) => {
        if (err) {
          throw err;
        }
        if (doc) {
          var response = {
            status: 1,
            message_english: "Logout successfully",
            message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተረጋግጧል",
            data: {},
          };
          res.send(response);
        } else {
          var response = {
            status: 1,
            message_english: "Logout successfully",
            message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተረጋግጧል",
            data: {},
          };
          res.send(response);
        }
      }
    );
  } catch (e) {
    var response = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      response: { e },
    };
    res.send(response);
  }
});

module.exports = router;
