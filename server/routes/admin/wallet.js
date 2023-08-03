var express = require("express");
var formidable = require("formidable");
var router = express.Router();
var Mongoose = require("mongoose");

var Wallet = require("../../db/wallet");
var User = require("../../db/userSchema");
var Customer = require("../../db/userSchema");
var Transaction = require("../../db/transactionSchema");
var Notification = require("../../db/notification");

const commonHelper = require("../helpers/functions");

router.post("/get", async (req, res) => {
  let formData = await commonHelper.getFormRecords(req);
  let pageNo = parseInt(formData.fields.pageNo);
  let size = parseInt(formData.fields.size);
  let searchItem = formData.fields.searchItem;
  let dateRange = formData.fields.dateRange;
  let query = {};
  if (pageNo < 0 || pageNo === 0) {
    pageNo = 1;
  }
  query.skip = size * (pageNo - 1);
  query.limit = size;
  let searchQuery = {};
  searchQuery.is_show = 1;
  if (searchItem) {
    searchQuery.name = {
      $regex: new RegExp(".*" + searchItem.trim() + ".*", "i"),
    };
  }

  Wallet.countDocuments(searchQuery, function (err, totalCount) {
    if (err) {
      response = { status: false, message: "Error fetching data" };
    }
    Wallet.find(searchQuery, null, { skip: query.skip, limit: query.limit })
      .sort({ createdAt: -1 })
      .lean()
      .populate("userId", "name role_id")
      .populate("adminId", "name role_id")
      .exec(async function (err, data) {
        if (err) {
          response = { status: false, message: "Error fetching data" };
        } else {
          var totalPages = Math.ceil(totalCount / size);
          var imageUrl =
            process.env.url + "/public/uploads/images/wallet_images/";
          response = {
            status: true,
            data: data,
            totalCount: totalCount,
            imageUrl: imageUrl,
            pageNo: pageNo,
            size: size,
            user_length: data.length,
          };
        }
        res.json(response);
      });
  });
});

router.post("/approved", async function (req, res) {
  let formData = await commonHelper.getFormRecords(req);
  Wallet.findOneAndUpdate(
    { _id: formData.fields.id },
    { status: 1, adminId: req.doc },
    { new: true },
    async function (err, user) {
      if (err) throw err;
      if (user) {
        let customer = await User.findById(user.userId);
        if (customer) {
          // Add Money to user wallet
          User.findOneAndUpdate(
            { _id: user.userId },
            { $inc: { wallet: user.amount } },
            { new: true }
          ).exec((err, doc) => {
            if (err) throw err;
            if (doc) {
              const transaction = new Transaction({
                date: new Date(),
                amount: user.amount,
                type: 0,
                balance: doc.wallet,
                showId: user.userId,
                recieverId: user.userId,
                senderId: req.doc,
              });
              transaction.save((err, trans) => {
                if (err) throw err;
                if (trans) {
                  console.log(trans);
                  //  console.log(user)
                }
              });

              let title = new Notification();
              title.title = `Your wallet request of amount ${user.amount} has been approved and has been credited`;
              title.userId = user.userId;
              title.type = "wallet";
              title.save((err, notification) => {
                if (err) {
                  console.log(err);
                }
                if (notification) {
                  console.log(notification);
                }
              });

              var response = {
                status: 1,
                message: "Wallet updated successfully",
                data: user,
              };
              res.send(response);
            }
          });
        } else {
          // Add Money to user wallet
          User.findOneAndUpdate(
            { _id: user.userId },
            { $inc: { wallet: user.amount } },
            { new: true }
          ).exec((err, doc) => {
            if (err) throw err;
            if (doc) {
              const transaction = new Transaction({
                date: new Date(),
                amount: user.amount,
                type: 0,
                balance: doc.wallet,
                showId: user.userId,
                recieverId: user.userId,
                senderId: req.doc,
              });
              transaction.save((err, trans) => {
                if (err) throw err;
                if (trans) {
                  console.log(trans);
                  //  console.log(user)
                }
              });

              let title = new Notification();
              title.title = `Your wallet request of amount ${user.amount} has been approved and has been credited`;
              title.userId = user.userId;
              title.type = "wallet";
              title.save((err, notification) => {
                if (err) {
                  console.log(err);
                }
                if (notification) {
                  console.log(notification);
                }
              });

              var response = {
                status: 1,
                message: "Wallet updated successfully",
                data: user,
              };
              res.send(response);
            }
          });
        }
      }
    }
  );
});

router.post("/reject", async function (req, res) {
  let formData = await commonHelper.getFormRecords(req);
  Wallet.findOneAndUpdate(
    { _id: formData.fields.id },
    { status: 2, adminId: req.doc },
    function (err, user) {
      if (err) throw err;
      var response = {
        status: 1,
        message: "Wallet updated successfully",
        data: user,
      };
      res.send(response);
    }
  );
});

// get all customer and service provider
router.post("/getuser", async (req, res) => {
  let formData = await commonHelper.getFormRecords(req);
  let pageNo = parseInt(formData.fields.pageNo);
  let size = parseInt(formData.fields.size);
  let type = parseInt(formData.fields.type);
  let searchItem = formData.fields.searchItem;
  let query = {};
  if (pageNo < 0 || pageNo === 0) {
    pageNo = 1;
  }
  query.skip = size * (pageNo - 1);
  query.limit = size;
  let searchQuery = {};
  searchQuery.is_show = 1;
  if (type == 0) {
    searchQuery = { $or: [{ role_id: 3 }, { role_id: 4 }] };
    searchQuery.is_show = 1;
  } else if (type == 1) {
    searchQuery.role_id = 4;
  } else {
    searchQuery.role_id = 3;
  }
  //roleId = 2 = Sub admin
  if (searchItem) {
    searchItem = searchItem.replace("+", "");
    searchQuery.$or = [
      { name: { $regex: new RegExp(".*" + searchItem.trim() + ".*", "i") } },
      { mobile: { $regex: new RegExp(".*" + searchItem.trim() + ".*", "i") } },
      {
        onlyMobile: {
          $regex: new RegExp(".*" + searchItem.trim() + ".*", "i"),
        },
      },
    ];
  }
  User.countDocuments(searchQuery, function (err, totalCount) {
    if (err) {
      response = { status: false, message: "Error fetching data" };
    }
    User.aggregate([
      {
        $match: searchQuery,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: query.skip,
      },
      {
        $limit: query.limit,
      },
    ]).exec(async function (err, data) {
      if (err) {
        response = { status: false, message: "Error fetching data" };
      } else {
        var totalPages = Math.ceil(totalCount / size);
        response = {
          status: true,
          data: data,
          totalCount: totalCount,
          pageNo: pageNo,
          size: size,
          user_length: data.length,
        };
      }
      res.json(response);
    });
  });
});


// get all customer and service provider
router.post("/getCustomer", async (req, res) => {
    let formData = await commonHelper.getFormRecords(req);
    let pageNo = parseInt(formData.fields.pageNo);
    let size = parseInt(formData.fields.size);
    let type = parseInt(formData.fields.type);
    let searchItem = formData.fields.searchItem;
    let query = {};
    if (pageNo < 0 || pageNo === 0) {
      pageNo = 1;
    }
    query.skip = size * (pageNo - 1);
    query.limit = size;
    let searchQuery = {};
    searchQuery.is_show = 1;
    if (type == 0) {
      searchQuery = { $or: [{ role_id: 3 }, { role_id: 4 }] };
      searchQuery.is_show = 1;
    } else if (type == 1) {
      searchQuery.role_id = 4;
    } else {
      searchQuery.role_id = 3;
    }
    //roleId = 2 = Sub admin
    if (searchItem) {
      searchItem = searchItem.replace("+", "");
      searchQuery.$or = [
        { name: { $regex: new RegExp(".*" + searchItem.trim() + ".*", "i") } },
        { mobile: { $regex: new RegExp(".*" + searchItem.trim() + ".*", "i") } },
        {
          onlyMobile: {
            $regex: new RegExp(".*" + searchItem.trim() + ".*", "i"),
          },
        },
      ];
    }
    User.countDocuments(searchQuery, function (err, totalCount) {
      if (err) {
        response = { status: false, message: "Error fetching data" };
      }
      User.aggregate([
        {
          $match: searchQuery,
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: query.skip,
        },
        {
          $limit: query.limit,
        },
      ]).exec(async function (err, data) {
        if (err) {
          response = { status: false, message: "Error fetching data" };
        } else {
          var totalPages = Math.ceil(totalCount / size);
          response = {
            status: true,
            data: data,
            totalCount: totalCount,
            pageNo: pageNo,
            size: size,
            user_length: data.length,
          };
        }
        res.json(response);
      });
    });
  });

router.post("/updatewallet", async function (req, res) {
  let formData = await commonHelper.getFormRecords(req);

  let customer = await Customer.findById(formData.fields.userId);
  if (customer) {
    User.findOneAndUpdate(
      { _id: formData.fields.userId },
      {
        $inc: {
          wallet:
            formData.fields.paymentType == "debit"
              ? -formData.fields.amount
              : formData.fields.amount,
        },
      },
      { new: true },
      function (err, user) {
        if (err) {
          var response = { status: 0, message: "Error", data: {} };
          res.send(response);
        }
        const transaction = new Transaction({
          date: new Date(),
          amount: formData.fields.amount,
          type: formData.fields.paymentType == "debit" ? 1 : 0,
          balance: user.wallet,
          showId: formData.fields.userId,
          recieverId: formData.fields.userId,
          senderId: req.doc,
        });
        transaction.save((err, doc) => {
          if (err) throw err;
          if (doc) {
            //  console.log(doc)
            //  console.log(user)
          }
        });

        let title = new Notification();
        title.title = `Your wallet has been ${
          formData.fields.paymentType == "debit" ? "Debited" : "Credited"
        } of amount ${formData.fields.amount}`;
        title.userId = formData.fields.userId;
        title.type = "wallet";
        title.save((err, notification) => {
          if (err) {
            console.log(err);
          }
          if (notification) {
            console.log(notification);
          }
        });

        var response = {
          status: 1,
          message: "Wallet updated successfully",
          data: user,
        };
        res.send(response);
      }
    );
  } else {
    User.findOneAndUpdate(
      { _id: formData.fields.userId },
      {
        $inc: {
          wallet:
            formData.fields.paymentType == "debit"
              ? -formData.fields.amount
              : formData.fields.amount,
        },
      },
      { new: true },
      function (err, user) {
        if (err) {
          var response = { status: 0, message: "Error", data: {} };
          res.send(response);
        }
        const transaction = new Transaction({
          date: new Date(),
          amount: formData.fields.amount,
          type: formData.fields.paymentType == "debit" ? 1 : 0,
          balance: user.wallet,
          showId: formData.fields.userId,
          recieverId: formData.fields.userId,
          senderId: req.doc,
        });
        transaction.save((err, doc) => {
          if (err) throw err;
          if (doc) {
            //  console.log(doc)
            //  console.log(user)
          }
        });

        let title = new Notification();
        title.title = `Your wallet has been ${
          formData.fields.paymentType == "debit" ? "Debited" : "Credited"
        } of amount ${formData.fields.amount}`;
        title.userId = formData.fields.userId;
        title.type = "wallet";
        title.save((err, notification) => {
          if (err) {
            console.log(err);
          }
          if (notification) {
            console.log(notification);
          }
        });

        var response = {
          status: 1,
          message: "Wallet updated successfully",
          data: user,
        };
        res.send(response);
      }
    );
  }
});

// get all transaction of that user
router.post("/getTransaction", async (req, res) => {
  let formData = await commonHelper.getFormRecords(req);
  let pageNo = parseInt(formData.fields.pageNo);
  let size = parseInt(formData.fields.size);
  let searchItem = formData.fields.searchItem;
  let query = {};
  if (pageNo < 0 || pageNo === 0) {
    pageNo = 1;
  }
  query.skip = size * (pageNo - 1);
  query.limit = size;
  let searchQuery = {};

  searchQuery.$or = [
    { showId: Mongoose.Types.ObjectId(formData.fields.userId) },
  ];
  if (searchItem) {
    searchQuery.name = {
      $regex: new RegExp(".*" + searchItem.trim() + ".*", "i"),
    };
  }
  Transaction.countDocuments(searchQuery, function (err, totalCount) {
    if (err) {
      response = { status: false, message: "Error fetching data" };
    }
    Transaction.find(searchQuery, {}, query)
      .sort({ date: -1 })
      .populate("senderId", "name")
      .exec(async function (err, data) {
        if (err) {
          response = { status: false, message: "Error fetching data" };
        } else {
          var totalPages = Math.ceil(totalCount / size);
          response = {
            status: true,
            data: data,
            totalCount: totalCount,
            pageNo: pageNo,
            size: size,
            user_length: data.length,
          };
        }
        res.json(response);
      });
  });
});

router.post("/getSingleUser", async (req, res) => {
  let formData = await commonHelper.getFormRecords(req);
  let userId = Mongoose.Types.ObjectId(formData.fields.userId);
  const user = await User.findById(userId);
  if (user) {
    User.findOne({ _id: userId }, (err, user) => {
      if (err) throw err;
      if (user) {
        var response = {
          status: 1,
          message: "Getting single user",
          data: user,
        };
        res.send(response);
      }
    });
  } else {
    User.findOne({ _id: userId }, (err, user) => {
      if (err) throw err;
      if (user) {
        var response = {
          status: 1,
          message: "Getting single user",
          data: user,
        };
        res.send(response);
      }
    });
  }
});

module.exports = router;
