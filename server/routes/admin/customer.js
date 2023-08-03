const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const jwt = require('jsonwebtoken');
const { base64encode, base64decode } = require('nodejs-base64');

var mongoose = require('mongoose');
var objectId = mongoose.Types.ObjectId();

const roleId = 4 //customer

const commonHelper = require('../helpers/functions');
const mailSend = require('../helpers/mailer');
const DM = require('../helpers/message');

const Users = require('../../db/userSchema');
const City = require('../../db/city');


router.get("/getCity", async (req, res) => {
    City.find({ status: 1, is_show: 1 }, 'name_english name_aramaic', (err, doc) => {
        if (err) console.log(err)
        if (doc) {
            var response = { status: 1, message: 'City list', data: doc }
            res.send(response);
        }
    })
})

router.post('/insert', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.name) {
        // if (formData.fields.email) {
        if (formData.fields.password) {
            if (formData.files.profilePicture) {
                let temp = {}
                temp.image = formData.files.profilePicture
                let uploadedImage = await commonHelper.uploadImages(temp, 'customer_images');
                // console.log(uploadedImage)
                if (uploadedImage.status == 1) {
                    formData.fields.profilePicture = uploadedImage.imageAr[0]
                }
            }
            Users.find({ mobile: formData.fields.mobile }, function (err, result) {
                if (err) throw err;
                if (result.length == 0) {
                    var user = new Users({
                        name: formData.fields.name,
                        email: formData.fields.email,
                        mobile: formData.fields.mobile,
                        city: formData.fields.city,
                        address: formData.fields.address,
                        profilePicture: formData.fields.profilePicture,
                        password: bcrypt.hashSync(formData.fields.password, salt),
                        role_id: roleId,
                        wallet: 0,
                        isSignup: 1,
                        referralSelf: commonHelper.generateReferral()
                        // location: {
                        //     type: "Point",
                        //     coordinates: [parseFloat(formData.fields.lng), parseFloat(formData.fields.lat)],
                        // },
                        // lat: parseFloat(formData.fields.lat),
                        // lng: parseFloat(formData.fields.lng),

                    });
                    user.save(function (err) {
                        if (err) throw err;

                        // Send Mail
                        // let temp = DM.newSubAdmin
                        // temp = temp.replace('<name>', formData.fields.name)
                        // temp = temp.replace('<email>', formData.fields.email)
                        // temp = temp.replace('<password>', formData.fields.password)
                        // let data = {
                        //     email: formData.fields.email,
                        //     subject: 'New User',
                        //     html: `<p>${temp}</p>`
                        // }
                        // mailSend(data)
                        // Send Mail

                        var jsonData = { status: 1, message: "Customer Created Successfully", response: {} }
                        res.send(jsonData);
                    });
                } else {
                    var jsonData = { status: 0, message: "Mobile already registered", response: {} }
                    res.send(jsonData);
                }
            })
        } else {
            var response = { status: 0, message: "Password not found" }
            res.send(response);
        }

        // } else {
        //     var response = { status: 0, message: "Email not found" }
        //     res.send(response);
        // }
    } else {
        var response = { status: 0, message: "Name not found" }
        res.send(response);
    }
});

router.post('/get', async (req, res) => {
    let formData = await commonHelper.getFormRecords(req)
    let pageNo = parseInt(formData.fields.pageNo);
    let size = parseInt(formData.fields.size);
    let searchItem = formData.fields.searchItem;
    let dateRange = formData.fields.dateRange;
    let query = {}
    if (pageNo < 0 || pageNo === 0) {
        pageNo = 1;
    }
    query.skip = size * (pageNo - 1)
    query.limit = size
    let searchQuery = {}
    searchQuery.is_show = 1;
    searchQuery.isSignup = 1;
    searchQuery.role_id = roleId; //roleId = 4 = customer
    if (searchItem) {
        searchItem = searchItem.replace('+', '')
        searchQuery.$or = [
            { name: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { mobile: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { onlyMobile: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]
    }
    if (dateRange) {
        dateRange = JSON.parse(dateRange)
        let start = new Date(dateRange.start)
        let end = new Date(dateRange.end)
        searchQuery.createdAt = {
            $gt: start,
            $lte: end,
        }
    }

    Users.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }
        Users.aggregate([
            {
                $match: searchQuery
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: query.skip
            },
            {
                $limit: query.limit
            },

        ]).exec(async function (err, data) {
            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                var imageUrl = process.env.url + "/public/uploads/images/customer_images/";
                response = { "status": true, "data": data, "imageUrl": imageUrl, "totalCount": totalCount, 'pageNo': pageNo, 'size': size, user_length: data.length };
            }
            res.json(response);
        });
    });
})

router.post('/getSingle', async (req, res) => {
    let formData = await commonHelper.getFormRecords(req)
    let user_id = mongoose.Types.ObjectId(formData.fields.user_id)
    if (!user_id) {
        var response = { status: 0, message: 'Please send user id', response: {} }
        res.send(response);
    }
    Users.findOne({ _id: user_id, role_id: roleId }).exec((err, data) => {
        if (err) {
            console.log(err)
        }
        var imageUrl = process.env.url + "/public/uploads/images/customer_images/";
        var response = { status: 1, imageUrl: imageUrl, message: 'Single Customer', response: data }
        res.send(response);
    })

})

router.post('/update', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.user_id) {
        if (formData.fields.name) {
            // if (formData.fields.email) {
            if (formData.files.profilePicture) {
                let temp = {}
                temp.image = formData.files.profilePicture
                let uploadedImage = await commonHelper.uploadImages(temp, 'customer_images');
                // console.log(uploadedImage)
                if (uploadedImage.status == 1) {
                    formData.fields.profilePicture = uploadedImage.imageAr[0]
                }
            }
            Users.findOne({ mobile: formData.fields.mobile, _id: { $ne: formData.fields.user_id } }, function (err, result) {
                if (err) throw err;
                if (!result) {
                    Users.findOne({ _id: formData.fields.user_id }, function (err, user) {
                        if (err) throw err;
                        if (user) {
                            user.name = formData.fields.name
                            user.email = formData.fields.email
                            user.mobile = formData.fields.mobile
                            user.city = formData.fields.city
                            user.address = formData.fields.address
                            isSignup = 1
                            // location = {
                            //     type: "Point",
                            //     coordinates: [parseFloat(formData.fields.lng), parseFloat(formData.fields.lat)],
                            // }
                            // lat = parseFloat(formData.fields.lat)
                            // lng = parseFloat(formData.fields.lng)
                            if (formData.fields.profilePicture) {
                                user.profilePicture = formData.fields.profilePicture
                            }
                            user.save((err, doc) => {
                                console.log(err)
                                if (doc) {
                                    var response = { status: 1, message: "Updated Succesfully", response: doc }
                                    res.send(response);
                                }
                            })
                        }
                    })
                } else {
                    var jsonData = { status: 0, message: "Mobile already registered", response: {} }
                    res.send(jsonData);
                }
            })
            // } else {
            //     var response = { status: 0, message: "Email not found" }
            //     res.send(response);
            // }
        } else {
            var response = { status: 0, message: "name not found" }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: "Customer not found" }
        res.send(response);
    }
});

router.post("/delete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let user_id = mongoose.Types.ObjectId(formData.fields.user_id)
    if (!user_id) {
        var response = { status: 0, message: 'Please send user id', response: {} }
        res.send(response);
    }
    Users.findOneAndUpdate({ _id: user_id }, { is_show: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Customer deleted successfully', data: user }
        res.send(response);
    });
});
router.post("/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Customer Inactivated successfully', data: user }
        res.send(response);
    });
});

router.post("/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Customer activated successfully', data: user }
        res.send(response);
    });
});

router.post("/export", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let searchQuery = {
        role_id: roleId, status: 1, is_show: 1
    }
    if (formData.fields.searchItem) {
        formData.fields.searchItem = formData.fields.searchItem.replace('+', '')
        searchQuery.$or = [
            { name: { $regex: new RegExp('.*' + formData.fields.searchItem.trim() + '.*', 'i') } },
            { mobile: { $regex: new RegExp('.*' + formData.fields.searchItem.trim() + '.*', 'i') } },
            { onlyMobile: { $regex: new RegExp('.*' + formData.fields.searchItem.trim() + '.*', 'i') } },
        ]
    }
    if (formData.fields.dateRange) {
        formData.fields.dateRange = JSON.parse(formData.fields.dateRange)
        let start = new Date(formData.fields.dateRange.start)
        let end = new Date(formData.fields.dateRange.end)
        searchQuery.createdAt = {
            $gt: start,
            $lte: end,
        }
    }

    Users.find(searchQuery, 'name mobile city', function (err, user) {
        if (err) throw err
        let data = []
        user.forEach(element => {
            let temp = {}
            temp.name = element.name
            temp.mobile = element.mobile
            temp.city = element.city ? element.city.name_english : ''
            element.city = ''
            data.push(temp)
        });
        var response = { status: 1, message: 'All customer list', data: data }
        res.send(response);
    }).populate('city')
});


router.post("/multiStatusChange", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    console.log(formData.fields)
    Users.updateMany({ role_id: roleId, _id: { $in: JSON.parse(formData.fields.idArray) } }, { status: parseInt(formData.fields.status) }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            let response = { status: 1, message: ' Status updated succesfully', data: doc }
            res.send(response)
        }
    })
});

router.post("/multiDelete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    console.log(formData.fields)
    Users.updateMany({ role_id: roleId, _id: { $in: JSON.parse(formData.fields.idArray) } }, { is_show: 0 }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            let response = { status: 1, message: ' Deleted succesfully', data: doc }
            res.send(response)
        }
    })
});


router.post("/changePassword", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    console.log(formData.fields)

    Users.findOne({ _id: formData.fields.userId, }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            doc.password = bcrypt.hashSync(formData.fields.password, salt)
            doc.save((err, user) => {
                if (err) throw err
                if (user) {
                    var response = { status: 1, message: 'Password changed successfully', message_aramaic: 'ኦቲፒ በተሳካ ሁኔታ ተልኳል', data: doc }
                    res.send(response);
                }
            })
        }
    })

});


module.exports = router