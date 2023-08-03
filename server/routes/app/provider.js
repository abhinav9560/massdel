const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const roleId = 3; // for customer
const moment = require("moment");
const commonHelper = require("../helpers/functions");
const pushNotifcation = require("../helpers/pushNotifcation");
const ypco = require("yenepaysdk");
const fetch = require("node-fetch");

const Users = require("../../db/userSchema");
const Category = require("../../db/categorySchema.js");
const subCategory = require("../../db/subcategorySchema.js");
const Booking = require("../../db/bookingSchema");
const RoundRobin = require("../../db/roundrobin");
var Wallet = require("../../db/wallet");
var Notification = require("../../db/notification");
var Address = require("../../db/address");
var Rating = require("../../db/rating");
var Message = require("../../db/message");
var Conversation = require("../../db/conversation");
var Global = require("../../db/globalsetting");
var Guide = require("../../db/guideSchema");
var CMS = require("../../db/tandcSchema");
var Language = require("../../db/language");
var Qualification = require("../../db/qualification");
var Training = require("../../db/training");
var FAQ = require("../../db/faqSchema");
var City = require("../../db/city");
var Transaction = require("../../db/transactionSchema");
var Contactus = require("../../db/contactus");
var BankAccount = require("../../db/bankAccount");
var Notification = require("../../db/notification");

const { body, validationResult } = require("express-validator");

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
          message: "Guide list",
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
        var response = { status: 1, message: "CMS list", data: doc };
        res.send(response);
      } else {
        var response = { status: 0, message: "No page found", data: {} };
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
        var response = { status: 1, message: "City list", data: doc };
        res.send(response);
      }
    }
  );
});

router.get("/getLanguage", async (req, res) => {
  Language.find(
    { status: 1, is_show: 1 },
    "name_english name_aramaic",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var response = { status: 1, message: "Language list", data: doc };
        res.send(response);
      }
    }
  );
});

router.get("/getQualification", async (req, res) => {
  Qualification.find(
    { status: 1, is_show: 1 },
    "name_english name_aramaic",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var response = { status: 1, message: "Qualification list", data: doc };
        res.send(response);
      }
    }
  );
});

router.get("/getTraining", async (req, res) => {
  Training.find(
    { status: 1, is_show: 1 },
    "name_english name_aramaic",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var response = { status: 1, message: "Training list", data: doc };
        res.send(response);
      }
    }
  );
});

router.get("/getCategory", async (req, res) => {
  Category.find(
    { status: 1, is_show: 1 },
    "name_english name_aramaic",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var response = { status: 1, message: "Category list", data: doc };
        res.send(response);
      }
    }
  );
});

router.post("/getSubcategory", async (req, res) => {
  subCategory.find(
    { status: 1, is_show: 1, category_id: { $in: req.body.category } },
    "name_english name_aramaic category_id",
    (err, doc) => {
      if (err) console.log(err);
      if (doc) {
        var response = { status: 1, message: "Sub Category list", data: doc };
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
    body("countryCode").exists().withMessage({
      message_english: "Please send countryCode",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("onlyMobile").exists().withMessage({
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
    body("userId").exists().withMessage({
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
    body("userId").exists().withMessage({
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

router.post("/signupAfter", async function (req, res) {
  let formData = await commonHelper.getFormRecords(req);

  if (formData.fields.password != formData.fields.confirm_password) {
    var response = {
      status: 0,
      message_english: "Password and confirm password do not match",
      message_aramaic: "የይለፍ ቃል እና ያረጋግጡ የይለፍ ቃል አይዛመዱም",
      data: {},
    };
    return res.send(response);
  }
  // console.log(formData.fields,'fields')
  // console.log('images are here')
  // console.log(formData.files, 'files')
  // console.log('images are here')
  // console.log(formData.files.identification, 'formData.files.identification')

  let profilePicture = null;
  if (formData.files.profilePicture) {
    let temp = { image: formData.files.profilePicture };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      profilePicture = uploadedImage.imageAr[0];
    }
  }

  // Id of provider
  let identification = null;
  if (formData.files.identification) {
    let temp = { image: formData.files.identification };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      identification = uploadedImage.imageAr;
    }
  }
  // education documents of provider
  let educationImage = null;
  if (formData.files.educationImage) {
    let temp = { image: formData.files.educationImage };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      educationImage = uploadedImage.imageAr;
    }
  }
  // trade license of provider
  let tradeLicense = null;
  if (formData.files.tradeLicense) {
    let temp = { image: formData.files.tradeLicense };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      tradeLicense = uploadedImage.imageAr;
    }
  }
  // tin certificate of provider
  let tinCertificate = null;
  if (formData.files.tinCertificate) {
    let temp = { image: formData.files.tinCertificate };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      tinCertificate = uploadedImage.imageAr;
    }
  }

  // console.log(profilePicture, 'profilePicture')
  // console.log(identification, 'identification')
  // console.log(educationImage, 'educationImage')
  // console.log(tradeLicense, 'tradeLicense')
  // console.log(tinCertificate, 'tinCertificate')

  Users.findOne(
    {
      _id: mongoose.Types.ObjectId(formData.fields.userId),
      mobile: formData.fields.mobile,
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
            _id: mongoose.Types.ObjectId(formData.fields.userId),
            mobile: formData.fields.mobile,
          },
          {
            name: formData.fields.name,
            city: formData.fields.city,

            language: formData.fields.language
              ? JSON.parse(formData.fields.language)
              : [],
            qualification: formData.fields.qualification
              ? formData.fields.qualification
              : null,
            training: formData.fields.training
              ? formData.fields.training
              : null,

            category: formData.fields.category
              ? JSON.parse(formData.fields.category)
              : [],
            subCategory: formData.fields.subCategory
              ? JSON.parse(formData.fields.subCategory)
              : [],
            sex: formData.fields.sex,
            dob: formData.fields.dob,
            country: formData.fields.country,

            lat: formData.fields.lat,
            lng: formData.fields.lng,
            location: {
              type: "Point",
              coordinates: [
                parseFloat(formData.fields.lng),
                parseFloat(formData.fields.lat),
              ],
            },
            address: formData.fields.address,
            residence: formData.fields.residence,

            identification: identification || [],
            educationImage: educationImage || [],
            tradeLicense: tradeLicense || [],
            tinCertificate: tinCertificate || [],
            profilePicture: profilePicture,
            canTakeBooking: false,

            password: bcrypt.hashSync(formData.fields.password, salt),
            isSignup: 1,
            wallet: 0,
            wallet: data.status ? global.referralAmountTo : 0,
            referralUsed: req.body.refercode ? req.body.refercode : "",
            referralSelf: commonHelper.generateReferral(),
          },
          function (err, user) {
            if (err) throw err;
            if (user) {
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
            } else {
              var response = {
                status: 0,
                message_english: "Something went wrong",
                message_aramaic: "በተሳካ ሁኔታ ይመዝገቡ! እባክዎ ይግቡ",
                data: {},
              };
              res.send(response);
            }
          }
        );
      }
    }
  );
});

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
    body("password").exists().withMessage({
      message_english: "Please send password",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("confirm_password").exists().withMessage({
      message_english: "Please send confirm_password",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("userId").exists().withMessage({
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

router.post("/socialSignup", async function (req, res) {
  let formData = await commonHelper.getFormRecords(req);

  let profilePicture = null;
  if (formData.files.profilePicture) {
    let temp = { image: formData.files.profilePicture };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      profilePicture = uploadedImage.imageAr[0];
    }
  }

  // Id of provider
  let identification = null;
  if (formData.files.identification) {
    let temp = { image: formData.files.identification };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      identification = uploadedImage.imageAr;
    }
  }
  // education documents of provider
  let educationImage = null;
  if (formData.files.educationImage) {
    let temp = { image: formData.files.educationImage };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      educationImage = uploadedImage.imageAr;
    }
  }
  // trade license of provider
  let tradeLicense = null;
  if (formData.files.tradeLicense) {
    let temp = { image: formData.files.tradeLicense };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      tradeLicense = uploadedImage.imageAr;
    }
  }
  // tin certificate of provider
  let tinCertificate = null;
  if (formData.files.tinCertificate) {
    let temp = { image: formData.files.tinCertificate };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      tinCertificate = uploadedImage.imageAr;
    }
  }

  // console.log(profilePicture, 'profilePicture')
  // console.log(identification, 'identification')
  // console.log(educationImage, 'educationImage')
  // console.log(tradeLicense, 'tradeLicense')
  // console.log(tinCertificate, 'tinCertificate')

  Users.findOne(
    {
      _id: mongoose.Types.ObjectId(formData.fields.userId),
      mobile: formData.fields.mobile,
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
            _id: mongoose.Types.ObjectId(formData.fields.userId),
            mobile: formData.fields.mobile,
          },
          {
            name: formData.fields.name,
            city: formData.fields.city,

            language: formData.fields.language
              ? JSON.parse(formData.fields.language)
              : [],
            qualification: formData.fields.qualification
              ? formData.fields.qualification
              : null,
            training: formData.fields.training
              ? formData.fields.training
              : null,

            category: formData.fields.category
              ? JSON.parse(formData.fields.category)
              : [],
            subCategory: formData.fields.subCategory
              ? JSON.parse(formData.fields.subCategory)
              : [],
            sex: formData.fields.sex,
            dob: formData.fields.dob,
            country: formData.fields.country,

            lat: formData.fields.lat,
            lng: formData.fields.lng,
            address: formData.fields.address,
            residence: formData.fields.residence,

            identification: identification || [],
            educationImage: educationImage || [],
            tradeLicense: tradeLicense || [],
            tinCertificate: tinCertificate || [],
            profilePicture: profilePicture,
            canTakeBooking: false,

            socialLoginType: formData.fields.socialLoginType,
            facebookId:
              formData.fields.socialLoginType == "Facebook"
                ? formData.fields.socialId
                : "",
            googleId:
              formData.fields.socialLoginType == "Google"
                ? formData.fields.socialId
                : "",
            isSignup: 1,
            wallet: 0,
            wallet: data.status ? global.referralAmountTo : 0,
            referralUsed: req.body.refercode ? req.body.refercode : "",
            referralSelf: commonHelper.generateReferral(),
          },
          function (err, user) {
            if (err) throw err;
            if (user) {
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
                    name: formData.fields.name,
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
            } else {
              var response = {
                status: 0,
                message_english: "Something went wrong",
                message_aramaic: "በተሳካ ሁኔታ ይመዝገቡ! እባክዎ ይግቡ",
                data: {},
              };
              res.send(response);
            }
          }
        );
      }
    }
  );
});

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
    body("password").exists().withMessage({
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

          if (result.status == 1) {
            if (bcrypt.compareSync(req.body.password, result.password)) {
              var imageUrl =
                process.env.url + "/public/uploads/images/provider_images/";
              var userData = {
                userId: result._id,
                name: result.name,
                username: result.username,
                email: result.email,
                profilePicture: result.profilePicture,
                mobile: result.mobile,
                role_id: result.role_id,
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
                }
              );

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

router.post(
  "/contactus",
  [
    body("subject").exists().withMessage({
      message_english: "Please send subject",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("message").exists().withMessage({
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

// Add service Information
// router.post('/addTiming', async (req, res) => {
//     let formData = await commonHelper.getFormRecords(req)
//     const serviceInformation = new ServiceInformation({
//         providerId: formData.fields.providerId,
//         timings: formData.fields.timings,
//         coverageArea: formData.fields.coverageArea,
//         city: formData.fields.city,
//     })
//     serviceInformation.save((err, doc) => {
//         if (err) throw err
//         if (doc) {
//             var response = { status: 1, message: 'serviceInformation added succesfully', data: doc }
//             res.send(response);
//         }
//     })
// })

// router.post('/getTiming', async (req, res) => {
//     let formData = await commonHelper.getFormRecords(req)
//     ServiceInformation.findOne({ providerId: formData.fields.providerId || req.doc }).exec((err, doc) => {
//         if (err) throw err;
//         if (doc) {
//             var response = { status: 1, message: 'serviceInformation listing', data: doc }
//             res.send(response);
//         }
//     })
// })

// Wallet insert
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
            var response = { status: 0, message: "Somthing went wrong" };
            res.send(response);
          }
          var response = {
            status: 1,
            message: "Wallet request created successfully",
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
      var response = { status: 0, message: "Please send image", data: {} };
      res.send(response);
    }
  } else {
    var response = { status: 0, message: "Please send amount", data: {} };
    res.send(response);
  }
});

// getTransaction
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
      console.log(req.doc, "req.doc");
      console.log(transaction);
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
    let count = await Transaction.countDocuments({ showId: req.doc });
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

router.put("/start", async (req, res) => {
  Booking.findOneAndUpdate(
    { _id: req.query.bookingId },
    { startByProvider: true },
    { new: true },
    async (err, doc) => {
      if (err) {
        let response = { status: 0, message: err, data: {} };
        res.send(response);
      }
      if (doc) {
        let response = {
          status: 0,
          message: "Service stated by provider customer will confirm it",
          data: doc,
        };
        res.send(response);

        if (socketList[doc.customerId]) {
          io.to(socketList[doc.customerId].id).emit("bookingChange", {});
        }

        await pushNotifcation.sendPushNotificationCustomer(
          doc.customerId,
          `Your booking id ${doc.bookingId} has been started`,
          "booking",
          doc._id
        );

        let title = new Notification();
        title.title = `Your booking id ${doc.bookingId} has been started`;
        title.userId = doc.customerId;
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
    }
  );
});

router.put("/pause", async (req, res) => {
  let sec = Number(req.body.second);
  Booking.findOneAndUpdate(
    { _id: req.query.bookingId },
    { seconds: sec },
    { new: true },
    (err, doc) => {
      if (err) {
        let response = { status: 0, message: err, data: {} };
        res.send(response);
      }
      if (doc) {
        let response = {
          status: 0,
          message: "Service paused by provider",
          data: doc,
        };
        res.send(response);

        if (socketList[doc.customerId]) {
          io.to(socketList[doc.customerId].id).emit("bookingChange", {});
        }
      }
    }
  );
});

router.put("/end", async (req, res) => {
  let sec = Number(req.body.second);

  // if customer not acknowledg start then dont end it

  //  let temp = await Booking.findOne({ _id: req.query.bookingId ,status: 5 })
  //  if(temp){
  //      console.log('Customer didnt acknowledge it')
  //      let response = { status: 0, message: 'Customer didn"t acknowledge it', data: {} };
  //      res.send(response);
  //      return
  //  }

  Booking.findOneAndUpdate(
    { _id: req.query.bookingId, status: 5 },
    { endByProvider: true, seconds: sec },
    { new: true },
    async (err, doc) => {
      if (err) {
        let response = { status: 0, message: err, data: {} };
        res.send(response);
      }
      if (doc) {
        let response = {
          status: 1,
          message: "Service ended by provider customer will confirm it",
          data: doc,
        };
        res.send(response);

        if (socketList[doc.customerId]) {
          io.to(socketList[doc.customerId].id).emit("bookingChange", {});
        }

        await pushNotifcation.sendPushNotificationCustomer(
          doc.customerId,
          `Your booking id ${doc.bookingId} has been ended`,
          "booking",
          doc._id
        );

        let title = new Notification();
        title.title = `Your booking id ${doc.bookingId} has been ended`;
        title.userId = doc.customerId;
        title.type = "wallet";
        title.save((err, notification) => {
          if (err) {
            console.log(err);
          }
          if (notification) {
            console.log(notification);
          }
        });
      } else {
        // if (socketList[doc.customerId]) {
        //     io.to(socketList[doc.customerId].id).emit('bookingChange', {})
        // }
        console.log("Customer didnt acknowledge it");
        let response = {
          status: 0,
          message: 'Customer didn"t acknowledge it',
          data: {},
        };
        res.send(response);
      }
    }
  );
});

router.put("/accept", async (req, res) => {
  // to check if this is old notifcation fro round robin
  // let sometemp = await Booking.findOne({ _id: req.query.bookingId, status: 0 });
  // let provider = await RoundRobin.findOne({
  //   bookingId: req.query.bookingId,
  //   userId: req.doc,
  //   isRejected: true,
  // });
  // if (sometemp && provider) {
  //   let response = { status: 0, message: "this booking is expired", data: {} };
  //   return res.send(response);
  // }

  // if already accepted tell provider to already accepted
  let temp = await Booking.findOne({ _id: req.query.bookingId, status: 1 });
  if (temp) {
    console.log("Booking already accepted");
    let response = { status: 0, message: "Booking already accepted", data: {} };
    await RoundRobin.deleteMany({ bookingId: req.query.bookingId });
    res.send(response);
    return;
  }

  Booking.findOneAndUpdate(
    { _id: req.query.bookingId },
    { status: 1, providerId: req.doc },
    { new: true },
    async (err, doc) => {
      if (err) {
        let response = { status: 0, message: err, data: {} };
        res.send(response);
      }
      if (doc) {
        let response = {
          status: 1,
          message: "Booking accepted successfully",
          data: doc,
        };
        res.send(response);

        await RoundRobin.deleteMany({ bookingId: req.query.bookingId });

        if (socketList[doc.customerId]) {
          io.to(socketList[doc.customerId].id).emit("bookingChange", {});
        }

        await pushNotifcation.sendPushNotificationCustomer(
          doc.customerId,
          `Your booking id ${doc.bookingId} has been accpeted`,
          "booking",
          doc._id
        );

        let title = new Notification();
        title.title = `Your booking id ${doc.bookingId} has been accpeted`;
        title.userId = doc.customerId;
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
    }
  );
});

function getStatus(status) {
  return (
    (status == 0 && "Pending") ||
    (status == 1 && "Accepted") ||
    (status == 2 && "Rejected") ||
    (status == 3 && "Canceled") ||
    (status == 4 && "Service Initiated") ||
    (status == 5 && "Service Start") ||
    (status == 6 && "Service Finished") ||
    (status == 7 && "Completed")
  );
}

router.put("/statusChange", async (req, res) => {
  console.log(req.body.status, "statusChange api");
  if (req.body.status == 2) {
    let booking = await Booking.findOne({ _id: req.query.bookingId });

    if (booking && req.body.type == "roundRobin") {
      await RoundRobin.findOneAndUpdate(
        { bookingId: req.query.bookingId, userId: req.doc },
        { isRejected: true }
      );
    }

    if (booking && !booking.providerId) {
      console.log("Not contain providerId");
      let bookingUpdate = await Booking.findOneAndUpdate(
        { _id: req.query.bookingId },
        { $push: { rejectedBy: req.doc } }
      );
      let response = {
        status: 1,
        message: "Status updated successfully",
        data: bookingUpdate,
      };
      return res.send(response);
    } else {
      console.log("contain providerId");
      let bookingUpdate = await Booking.findOneAndUpdate(
        { _id: req.query.bookingId },
        { status: req.body.status }
      );
      let response = {
        status: 1,
        message: "Status updated successfully",
        data: bookingUpdate,
      };
      return res.send(response);
    }
  }

  Booking.findOneAndUpdate(
    { _id: req.query.bookingId },
    { status: req.body.status },
    { new: true },
    async (err, doc) => {
      if (err) {
        let response = { status: 0, message: err, data: {} };
        res.send(response);
      }
      if (doc) {
        let response = {
          status: 1,
          message: "Status updated successfully",
          data: doc,
        };
        res.send(response);

        if (socketList[doc.customerId]) {
          io.to(socketList[doc.customerId].id).emit("bookingChange", {});
        }

        // isWorking
        if (Number(req.body.status) == 4) {
          let admin = await Users.findOneAndUpdate(
            { _id: doc.providerId },
            { isWorking: true }
          );
        }

        await pushNotifcation.sendPushNotificationCustomer(
          doc.customerId,
          `Your booking id ${doc.bookingId} has been ${getStatus(
            req.body.status
          )}`,
          "booking",
          doc._id
        );

        let title = new Notification();
        title.title = `Your booking id ${doc.bookingId} has been ${getStatus(
          req.body.status
        )}`;
        title.userId = doc.customerId;
        title.type = "booking";
        title.save((err, notification) => {
          if (err) {
            console.log(err);
          }
          if (notification) {
          }
        });
      }
    }
  );
});

router.put("/isPaymentReceived", async (req, res) => {
  Booking.findOneAndUpdate(
    { _id: req.query.bookingId },
    { status: 7, isPaymentReceived: "done" },
    { new: true },
    (err, doc) => {
      if (err) {
        let response = { status: 0, message: err, data: {} };
        res.send(response);
      }
      if (doc) {
        let response = {
          status: 0,
          message: "Payment received successfully",
          data: doc,
        };
        res.send(response);

        if (socketList[doc.customerId]) {
          io.to(socketList[doc.customerId].id).emit("bookingChange", {});
        }

        // let title = new Notification()
        // title.title = `Your booking id ${doc.bookingId} has been ${getStatus(req.body.status)}`
        // title.userId = doc.customerId
        // title.type = 'wallet'
        // title.save((err, notification) => {
        //     if (err) { console.log(err) }
        //     if (notification) { console.log(notification) }
        // })
      }
    }
  );
});

router.get("/getBooking", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let perPage = parseInt(req.query.perPage) || 10;
  let type = req.query.type || 1;
  let skip = perPage * (page - 1);
  // try {
  let con = {};
  now = moment();
  let startDay = now.startOf("day").toString();
  let endDay = now.endOf("day").toString();
  let global = await Global.findOne({ type: "Global" });
  let user = await Users.findById(req.doc);
  if (req.query.latlng) {
    req.query.latlng = JSON.parse(req.query.latlng);
    var { latitude, longitude } = req.query.latlng;
  }

  // if(user && !user.canTakeBooking || user.isWorking){
  if (user && !user.canTakeBooking) {
    let customerUrl =
      process.env.url + "/public/uploads/images/customer_images/";
    let bookingUrl = process.env.url + "/public/uploads/images/booking_images/";
    let categoryUrl =
      process.env.url + "/public/uploads/images/categories_images/";
    let count = 0;
    let response = {
      status: 1,
      message_english: "Getting booking list",
      message_aramaic: "የግብይት ዝርዝርን ማግኘት",
      data: [],
      count,
      customerUrl,
      bookingUrl,
      categoryUrl,
    };
    console.log("Can not show new booking");
    return await res.send(response);
  }

  // canTakeBooking: true, isWorking:false,

  if (type == 0) {
    //Pending
    con = {
      status: 0,
      $or: [{ providerId: null }, { providerId: req.doc }],
      is_show: 1,
    };
    con["rejectedBy"] = { $nin: [req.doc] };

    // con.location = {
    //     $near: {
    //         $geometry: {
    //            type: "Point" ,
    //            coordinates: [ parseFloat(    ) ,parseFloat(latitude) ]
    //         },
    //         $maxDistance: global.defaultRadius*1000,
    //         $minDistance: 0
    //       }
    // }
  } else if (type == 1) {
    //Accpeted
    con = {
      $or: [{ status: 1 }, { status: 4 }, { status: 5 }, { status: 6 }],
      is_show: 1,
    };
    con["rejectedBy"] = { $nin: [req.doc] };
    con["providerId"] = req.doc;
  } else if (type == 2) {
    //Completded
    con = { status: 7, is_show: 1 };
    con["rejectedBy"] = { $nin: [req.doc] };
    con["providerId"] = req.doc;
  } else if (type == 3) {
    con = {
      $or: [{ status: 2 }, { status: 3 }, { rejectedBy: { $in: [req.doc] } }],
      is_show: 1,
    }; //Rejected
    // con['providerId'] = req.doc
    // con['rejectedBy'] = {$in: [mongoose.Types.ObjectId(req.doc)]}
    // con['rejectedBy'] = {$in: [req.doc]}
  } else if (type == 4) {
    // con = { $or: [{ type: 'asap', date: { $gte: startDay, $lt: endDay }, status: 0 }, { type: 'scheduled', scheduleDate: { $gte: startDay, $lt: endDay },status:0 }] }
    con = {
      $or: [
        { type: "asap", date: { $gte: startDay, $lt: endDay }, status: 0 },
        {
          type: "scheduled",
          scheduleDate: { $gte: startDay, $lt: endDay },
          status: 1,
        },
      ],
      is_show: 1,
    };
    con["rejectedBy"] = { $nin: [req.doc] }; // Todays Booking
    con["providerId"] = req.doc;
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
  }

  // con['category'] = {$in: user.category}
  // con['subCategory'] = {$in: user.subCategory}

  console.log(con);

  let count = await Booking.count(con);
  let booking = await Booking.find(
    con,
    {},
    { skip: skip, limit: perPage, sort: { createdAt: -1 } }
  )
    .populate("customerId", "name mobile profilePicture")
    .populate("subCategory", "name_english name_aramaic image")
    .populate("category", "name_english name_aramaic image")
    .lean();
  if (booking) {
    var customerUrl =
      process.env.url + "/public/uploads/images/customer_images/";
    var bookingUrl = process.env.url + "/public/uploads/images/booking_images/";
    var categoryUrl =
      process.env.url + "/public/uploads/images/categories_images/";

    // user.subCategory.forEach(element=>{
    //     booking = booking.filter(ele=>String(ele.subCategory) == String(element))
    //     count = booking.length;
    // })

    if (req.query.latlng) {
      // req.query.latlng = JSON.parse(req.query.latlng)
      // let { latitude, longitude } = req.query.latlng
      let key = process.env.googleApiKey;
      // Getting distnace from google map api
      for await (let item of booking) {
        item.lat = parseFloat(item.lat);
        item.lng = parseFloat(item.lng);
        item.distance = null;
        item.duration = null;
        if (latitude && longitude && item.lat && item.lng) {
          await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${Number(
              latitude
            )},${Number(longitude)}&destinations=${Number(item.lat)},${Number(
              item.lng
            )}&key=${key}`
          )
            .then((res) => res.json())
            .then((json) => {
              console.log(json);
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

    let response = {
      status: 1,
      message_english: "Getting booking list",
      message_aramaic: "የግብይት ዝርዝርን ማግኘት",
      data: booking,
      count,
      customerUrl,
      bookingUrl,
      categoryUrl,
    };
    await res.send(response);
  }
  // }
  // catch (e) {
  //     var jsonData = { status: 0, message_english: "Network Error", message_aramaic: 'የአውታረ መረብ ስህተት', data: [] }
  //     res.send(jsonData);
  // }
});

router.get("/getSingleBooking", async function (req, res) {
  try {
    Booking.findOne({ _id: req.query.bookingId }, (err, doc) => {
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
    })
      .populate("customerId", "name profilePicture mobile")
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

router.get("/canTakeBooking", async (req, res) => {
  Users.findOne({ role_id: 3, _id: req.doc }, "canTakeBooking", (err, doc) => {
    if (err) {
      console.log(err);
    }
    if (doc && doc.canTakeBooking) {
      var response = {
        status: 1,
        message_english: "Can take booking",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
        canTakeBooking: 1,
        data: doc,
      };
      res.send(response);
    } else {
      if (doc && doc.isWorking) {
        var response = {
          status: 0,
          message_english:
            "You have a pending booking please first complete it",
          message_aramaic:
            "በአገልግሎት መረጃ ገጽ ውስጥ ተቀይረዋል! አስተዳዳሪው እስኪያፀድቀው ድረስ አዲስ ቦታ ማስያዝ አያገኙም",
          data: doc,
          canTakeBooking: 0,
        };
        res.send(response);
        return;
      }
      var response = {
        status: 0,
        message_english:
          "You have changed in service infomation page! You will not get new booking until admin approves it",
        message_aramaic:
          "በአገልግሎት መረጃ ገጽ ውስጥ ተቀይረዋል! አስተዳዳሪው እስኪያፀድቀው ድረስ አዲስ ቦታ ማስያዝ አያገኙም",
        data: doc,
        canTakeBooking: 0,
      };
      res.send(response);
    }
  }).lean();
});

router.get("/profile", async (req, res) => {
  Users.findOne({ role_id: 3, _id: req.doc }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    if (!doc) {
      var response = {
        status: 0,
        message_english: "User no found",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
        data: {},
      };
      res.send(response);
    } else {
      var categoryUrl =
        process.env.url + "/public/uploads/images/categories_images/";
      var bookingUrl =
        process.env.url + "/public/uploads/images/booking_images/";
      var imageUrl =
        process.env.url + "/public/uploads/images/provider_images/";
      var response = {
        status: 1,
        message_english: "Here is profile",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
        data: doc,
        categoryUrl,
        imageUrl,
        bookingUrl,
      };
      res.send(response);
    }
  });
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
          process.env.url + "/public/uploads/images/provider_images/";
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

router.put("/serviceInformation", async (req, res) => {
  let formData = await commonHelper.getFormRecords(req);

  // education documents of provider
  let educationImage1 = "";
  if (formData.files.educationImage1) {
    let temp = { image: formData.files.educationImage1 };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      educationImage1 = uploadedImage.imageAr;
    }
  }
  // trade license of provider
  let tradeLicense1 = "";
  if (formData.files.tradeLicense1) {
    let temp = { image: formData.files.tradeLicense1 };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      tradeLicense1 = uploadedImage.imageAr;
    }
  }
  // tin certificate of provider
  let tinCertificate1 = "";
  if (formData.files.tinCertificate1) {
    let temp = { image: formData.files.tinCertificate1 };
    var uploadedImage = await commonHelper.uploadImages(
      temp,
      "provider_images"
    );
    if (uploadedImage.status == 1) {
      tinCertificate1 = uploadedImage.imageAr;
    }
  }

  const educationImage =
    (JSON.parse(formData.fields.educationImage).length &&
      educationImage1.length &&
      JSON.parse(formData.fields.educationImage).concat(educationImage1)) ||
    (JSON.parse(formData.fields.educationImage).length &&
      !educationImage1.length &&
      JSON.parse(formData.fields.educationImage)) ||
    (!JSON.parse(formData.fields.educationImage).length &&
      educationImage1.length &&
      educationImage1) ||
    (!JSON.parse(formData.fields.educationImage).length &&
      !educationImage1.length &&
      !educationImage1 &&
      []);

  const tradeLicense =
    (JSON.parse(formData.fields.tradeLicense).length &&
      tradeLicense1.length &&
      JSON.parse(formData.fields.tradeLicense).concat(tradeLicense1)) ||
    (JSON.parse(formData.fields.tradeLicense).length &&
      !tradeLicense1.length &&
      JSON.parse(formData.fields.tradeLicense)) ||
    (!JSON.parse(formData.fields.tradeLicense).length &&
      tradeLicense1.length &&
      tradeLicense1) ||
    (!JSON.parse(formData.fields.tradeLicense).length &&
      !tradeLicense1.length &&
      !tradeLicense1 &&
      []);

  const tinCertificate =
    (JSON.parse(formData.fields.tinCertificate).length &&
      tinCertificate1.length &&
      JSON.parse(formData.fields.tinCertificate).concat(tinCertificate1)) ||
    (JSON.parse(formData.fields.tinCertificate).length &&
      !tinCertificate1.length &&
      JSON.parse(formData.fields.tinCertificate)) ||
    (!JSON.parse(formData.fields.tinCertificate).length &&
      tinCertificate1.length &&
      tinCertificate1) ||
    (!JSON.parse(formData.fields.tinCertificate).length &&
      !tinCertificate1.length &&
      !tinCertificate1 &&
      []);

  Users.findOneAndUpdate(
    { _id: req.doc },
    {
      language: formData.fields.language
        ? JSON.parse(formData.fields.language)
        : [],
      qualification: formData.fields.qualification
        ? formData.fields.qualification
        : null,
      training: formData.fields.training ? formData.fields.training : null,

      category: formData.fields.category
        ? JSON.parse(formData.fields.category)
        : [],
      subCategory: formData.fields.subCategory
        ? JSON.parse(formData.fields.subCategory)
        : [],
      sex: formData.fields.sex,
      dob: formData.fields.dob,
      country: formData.fields.country,

      lat: formData.fields.lat,
      lng: formData.fields.lng,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(formData.fields.lng),
          parseFloat(formData.fields.lat),
        ],
      },
      address: formData.fields.address,
      residence: formData.fields.residence,
      canTakeBooking: false,

      educationImage: educationImage,
      tradeLicense: tradeLicense,
      tinCertificate: tinCertificate,
    },
    { new: true },
    (err, doc) => {
      if (err) {
        console.log(err);
      }
      if (doc) {
        var categoryUrl =
          process.env.url + "/public/uploads/images/categories_images/";
        var bookingUrl =
          process.env.url + "/public/uploads/images/booking_images/";
        var imageUrl =
          process.env.url + "/public/uploads/images/provider_images/";

        var response = {
          status: 1,
          message_english:
            "Information updated successfully ! Admin will approve this.",
          message_aramaic: "አድራሻ በተሳካ ሁኔታ ዘምኗል",
          data: doc,
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
    cb(null, "public/uploads/images/provider_images");
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
              process.env.url + "/public/uploads/images/provider_images/";
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
    body("newPassword").exists().withMessage({
      message_english: "Please send newPassword",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("confirmPassword").exists().withMessage({
      message_english: "Please send confirmPassword",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("oldPassword").exists().withMessage({
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
                  message: "Password change successfully",
                  response: doc,
                };
                res.send(response);
              }
            });
          } else {
            var response = {
              status: 0,
              message: "Old Password is incorrect",
              response: {},
            };
            res.send(response);
          }
        }
      });
    } else {
      var response = {
        status: 0,
        message: "New Password and confirm password do not match",
        response: {},
      };
      res.send(response);
    }
  }
);

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
          data: {},
        };
        res.send(response);
      }
    });
  } catch (e) {
    var response = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      data: { e },
    };
    res.send(response);
  }
});

router.get("/locationUpdate", async function (req, res) {
  try {
    if (socketList[req.query.customerId]) {
      io.to(socketList[req.query.customerId].id).emit("updateLocation", {
        location: req.query.latlng,
      });
    }
    console.log(req.query);
    // req.query.latlng = JSON.parse(req.query.latlng)
    // Booking id
    // Provider latlng

    var response = {
      status: 1,
      message_english: "location send successfully",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      data: { latlng: req.query.latlng },
    };
    res.send(response);
  } catch (e) {
    var response = {
      status: 0,
      message_english: "Network Error",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
      data: { e },
    };
    res.send(response);
  }
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
  console.log(req.query);
  console.log(req.body);

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
  console.log(req.file);
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
            // console.log(req.query.recieverId !== 'null' ? req.query.recieverId : admin._id)
            // console.log(socketList[req.query.recieverId !== 'null' ? req.query.recieverId : admin._id],'***')
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

            await pushNotifcation.sendPushNotificationCustomer(
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

                await pushNotifcation.sendPushNotificationCustomer(
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

// Bank Accouts

router.get("/bankAccount", async (req, res) => {
  try {
    let bankAccount = await BankAccount.find({
      providerId: req.doc,
      is_show: 1,
      status: 1,
    });
    if (bankAccount) {
      var response = {
        status: 1,
        message_english: "Bank Account list",
        message_aramaic: "አድራሻ በተሳካ ሁኔታ ታክሏል",
        data: bankAccount,
      };
      res.send(response);
    } else {
      var response = {
        status: 0,
        message_english: "No Bank Account found",
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
  "/bankAccount",
  [
    body("type").exists().withMessage({
      message_english: "Please send type",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("name").exists().withMessage({
      message_english: "Please send name",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("accountNo").exists().withMessage({
      message_english: "Please send accountNo",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("bankName").exists().withMessage({
      message_english: "Please send bankName",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("ifscCode").exists().withMessage({
      message_english: "Please send ifscCode",
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
      const bankAccount = new BankAccount({
        type: req.body.type,
        providerId: req.doc,
        name: req.body.name,
        accountNo: req.body.accountNo,
        bankName: req.body.bankName,
        ifscCode: req.body.ifscCode,
      });
      bankAccount.save((err, doc) => {
        if (err) throw err;
        if (doc) {
          var response = {
            status: 1,
            message_english: "Bank Account added successfully",
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
  "/bankAccount",
  [
    body("type").exists().withMessage({
      message_english: "Please send type",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("name").exists().withMessage({
      message_english: "Please send name",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("accountNo").exists().withMessage({
      message_english: "Please send accountNo",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("bankName").exists().withMessage({
      message_english: "Please send bankName",
      message_aramaic: "ኦቲፒ በተሳካ ሁኔታ ተልኳል",
    }),
    body("ifscCode").exists().withMessage({
      message_english: "Please send ifscCode",
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
      BankAccount.findOne({ _id: req.body.bankAccountId }, (err, doc) => {
        if (err) throw err;
        if (!doc) {
          var jsonData = {
            status: 0,
            message: "bank Account Not Found",
            data: {},
          };
          res.send(jsonData);
        } else {
          BankAccount.findByIdAndUpdate(
            req.body.bankAccountId,
            {
              type: req.body.type,
              name: req.body.name,
              accountNo: req.body.accountNo,
              bankName: req.body.bankName,
              ifscCode: req.body.ifscCode,
            },
            async (err, doc) => {
              if (err) throw err;
              if (doc) {
                var response = {
                  status: 1,
                  message_english: "bank Account updated successfully",
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

router.delete("/bankAccount/:id", async function (req, res) {
  try {
    BankAccount.findOneAndUpdate(
      { _id: req.params.id },
      { is_show: 0 },
      (err, doc) => {
        if (err) throw err;
        if (doc) {
          var response = {
            status: 1,
            message_english: "Bank Account deleted successfully",
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

// Bank Accouts

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

router.post("/updateLocation", async (req, res) => {
  try {
    Users.findByIdAndUpdate(
      req.doc,
      {
        lat: req.body.lat,
        lng: req.body.lng,
        location: {
          type: "Point",
          coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        },
      },
      (err, doc) => {
        if (err) throw err;
        if (doc) {
          var response = {
            status: 1,
            message_english: "Location Updated successfully",
            message_aramaic: "አካባቢ በተሳካ ሁኔታ ተዘምኗል",
            data: {},
          };
          res.send(response);

          // if (socketList[req.query.customerId]) {
          //     io.to(socketList[req.query.customerId].id).emit('updateLocation', { location: req.query.latlng })
          // }
        }
      }
    );
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
