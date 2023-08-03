const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const jwt = require('jsonwebtoken');
const { base64encode, base64decode } = require('nodejs-base64');

var mongoose = require('mongoose');
var objectId = mongoose.Types.ObjectId();

const roleId = 2

const commonHelper = require('../helpers/functions');
const mailSend = require('../helpers/mailer');
const DM = require('../helpers/message');

const Users = require('../../db/userSchema');


router.post("/startup", async function (req, res) {
    const user = new Users({
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        mobile: '9587293059',
        password: bcrypt.hashSync('Qwerty@123', salt),
        role_id: 1,
        wallet: 0
    });

    user.save((err, doc) => {
        if (err) throw err;
        if (doc) {
            var response = { status: 1, message: 'Super Admin Created Succesfully', data: doc }
            res.send(response);

        }
    })

})

router.post("/login", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    var condition = { $or: [{ email: formData.fields.email, role_id: 1 }, { email: formData.fields.email, role_id: 2 }], is_show: 1 };
    Users.find(condition, async function (err, result) {
        if (err) throw err;
        if (!result.length) {
            var response = { status: 0, message: 'Email not registered', response: {} }
            res.send(response);
        } else {
            if (result[0].status == 1) {
                if (bcrypt.compareSync(formData.fields.password, result[0].password)) {
                    var user_id = result[0]._id;
                    var user_data = {
                        name: result[0].name,
                        username: result[0].username,
                        email: result[0].email,
                        image: result[0].image,
                        mobile: result[0].mobile,
                        role_id: result[0].role_id,
                        access: result[0].access,
                    }
                    jwt.sign({ _id: user_id }, process.env.privateKey, { expiresIn: '30 days' }, function (err, token) {
                        if (err) console.log(err)
                        var data = { user_id: user_id, user_data: user_data };
                        var response = { status: 1, message: 'Login Successfully', response: data, token: token }
                        res.send(response);
                    });
                } else {
                    var response = { status: 0, message: 'Invalid email or password', response: {} }
                    res.send(response);
                }
            } else {
                var response = { status: 0, message: 'Your account is deactivated by admin.', response: {} }
                res.send(response);
            }
        }
    });
})

router.post("/forgot_password", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.find({ email: formData.fields.email }, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            var response = { status: 0, message: 'Email not registered', response: {} }
            res.send(response);
        } else {
            let otp = commonHelper.generateOTP()
            Users.findOneAndUpdate({ email: formData.fields.email }, { otp: otp, otp_status: 1 }, function (err, user) {
                if (err) throw err;
                var passwordResetUrl = process.env.siteAdminUrl + "/reset_password/" + base64encode(user._id + ':' + otp);
                mailData = {
                    email: formData.fields.email,
                    subject: "Forgot Password",
                    html: "Link to reset your password is <a href='" + passwordResetUrl + "'>Reset</a>"
                }
                mailSend(mailData);
                var response = { status: 1, message: 'A link has been sent to your registered email id. Kindly click on it to reset your password', response: {} }
                res.send(response);
            });
        }
    });
})

router.post("/verifyOTP", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.find({ _id: formData.fields.user_id, otp: formData.fields.otp, otp_status: 1 }, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            var response = { status: 0, message: 'Wrong Url', response: {} }
            res.send(response);
        } else {

            Users.findOneAndUpdate({ _id: formData.fields.user_id }, {
                otp: null,
                otp_status: 0
              }, function (err, user) {
                if (err) throw err;
                if(user)console.log(user)
              });

            var response = { status: 1, message: 'Success', response: {} }
            res.send(response);
        }
    });
})

router.post("/reset_password", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    formData.fields.password = formData.fields.password.replace(/\s+/g, ' ').trim();
    if (formData.fields.password) {
        Users.find({ _id: formData.fields.user_id }, function (err, result) {
            if (err) throw err;
            if (result.length == 0) {
                var response = { status: 0, message: 'Invalid User', response: {} }
                res.send(response);
            } else {
                Users.findOneAndUpdate({ _id: formData.fields.user_id }, {
                    password: bcrypt.hashSync(formData.fields.password, salt),
                    otp: null,
                    otp_status: 0
                }, function (err, user) {
                    if (err) throw err;
                    var response = { status: 1, message: 'Password reset successfully', response: {} }
                    res.send(response);
                });
            }
        });
    } else {
        var response = { status: 0, message: 'Please provide valid password', response: {} }
        res.send(response);
    }
})



async function auth(req, res, next) {
    if (req.headers['authentication']) {
        let token = req.headers['authentication']
        token = token.replace('Bearer ', '');
        jwt.verify(token, process.env.privateKey, function (err, decoded) {
            if (err) {
                res.status(401).json({
                    status: 0,
                    message: 'Unauthorized'
                })
            }
            if (decoded) {
                // console.log(decoded._id)
                req.doc = decoded._id
                res.set('token', token);
                res.setHeaders
                next()
            }
        });
    }
    else {
        res.status(401).json({
            status: 0,
            message: 'Unauthorized'
        })
    }
}
router.use(auth)






/** Admin Auth Routes Start **/

router.post('/insertSubAdmin', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)

    if (formData.fields.name) {
        if (formData.fields.email) {
            if (formData.fields.password) {

                Users.find({ email: formData.fields.email,is_show:1 }, function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {
                        var user = new Users({
                            name: formData.fields.name,
                            email: formData.fields.email,
                            access: formData.fields.access ? formData.fields.access.split(',') : [],
                            password: bcrypt.hashSync(formData.fields.password, salt),
                            role_id: roleId,
                            referralSelf: commonHelper.generateReferral(),
                        });
                        user.save(function (err) {
                            if (err) throw err;
                            // Send Mail
                            let temp = DM.newSubAdmin
                            temp = temp.replace('<name>', formData.fields.name)
                            temp = temp.replace('<email>', formData.fields.email)
                            temp = temp.replace('<password>', formData.fields.password)
                            let data = {
                                email: formData.fields.email,
                                subject: 'New Subadmin',
                                html: `<p>${temp}</p>`
                            }
                            mailSend(data)
                            // Send Mail
                            var jsonData = { status: 1, message: "Inserted Successfully", response: {} }
                            res.send(jsonData);
                        });
                    } else {
                        var jsonData = { status: 0, message: "Email already registered", response: {} }
                        res.send(jsonData);
                    }
                })

            } else {
                var response = { status: 0, message: "Password not found" }
                res.send(response);
            }

        } else {
            var response = { status: 0, message: "Email not found" }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: "Name not found" }
        res.send(response);
    }
});

router.post('/getSubAdmin', async (req, res) => {
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
    searchQuery.role_id = 2; //roleId = 2 = Sub admin
    if (searchItem) {
        searchQuery.$or = [
            { name: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { email: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
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
    // console.log(searchQuery)
    // console.log(query)
    Users.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }
        Users.aggregate([
            {
                $match: searchQuery
            },
            {
                $sort: { 'createdAt': -1 }
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
                response = { "status": true, "data": data, "totalCount": totalCount, 'pageNo': pageNo, 'size': size, user_length: data.length };
            }
            res.json(response);
        });
    });
})

router.post('/getSingleSubAdmin', async (req, res) => {
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
        var response = { status: 1, message: 'Single sub admin', response: data }
        res.send(response);
    })
})

router.post('/updateSubAdmin', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)

    if (formData.fields.user_id) {
        if (formData.fields.name) {
            if (formData.fields.email) {
                Users.find({ email: formData.fields.email,is_show:1, _id: { $ne: formData.fields.user_id } }, function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {
                        Users.findOneAndUpdate({ _id: formData.fields.user_id }, {
                            name: formData.fields.name,
                            email: formData.fields.email,
                            access: formData.fields.access ? formData.fields.access.split(',') : [],
                        }, async (err, doc) => {
                            if (err) throw err;
                            var response = { status: 1, message: "Updated Succesfully", response: doc }
                            res.send(response);
                        })
                    } else {
                        var jsonData = { status: 0, message: "Email already registered", response: {} }
                        res.send(jsonData);
                    }
                })
            } else {
                var response = { status: 0, message: "Email not found" }
                res.send(response);
            }
        } else {
            var response = { status: 0, message: "name not found" }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: "User not found" }
        res.send(response);
    }
});

router.post("/deleteSubAdmin", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let user_id = mongoose.Types.ObjectId(formData.fields.user_id)
    if (!user_id) {
        var response = { status: 0, message: 'Please send user id', response: {} }
        res.send(response);
    }
    Users.findOneAndUpdate({ _id: user_id }, { is_show: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'User deleted successfully', data: user }
        res.send(response);
    });
});

router.post("/inactiveSubadmin", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'User Inactivated successfully', data: user }
        res.send(response);
    });
});

router.post("/activeSubadmin", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'User activated successfully', data: user }
        res.send(response);
    });
});


router.post("/update_profile", function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        fields.first_name = fields.username.replace(/\s+/g, ' ').trim();
        // fields.last_name = fields.last_name.replace(/\s+/g,' ').trim();

        if (fields.username) {

            let fileName = ''
            if (files.profile_image && files.profile_image.name) {
                fileName = new Date().getTime() + files.profile_image.name.replace(" ", "-");
                var oldpath = files.profile_image.path;
                var newpath = __dirname + '/../../public/uploads/images/user_images/' + fileName;
                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                });
            }

            Users.find({ _id: fields.user_id }, function (err, result) {
                if (err) throw err;
                if (result.length == 0) {
                    var response = { status: 0, message: 'Invalid User', response: {} }
                    res.send(response);
                } else {
                    let updateObject = { username: fields.username };
                    if (fileName.length != 0) { updateObject.image = fileName }
                    // var fileExtenstion = fileName.split('.')[1];


                    Users.findOneAndUpdate({ _id: fields.user_id }, updateObject, function (err, user) {
                        if (err) throw err;
                        var user_data = {
                            // first_name: fields.first_name,
                            // last_name: fields.last_name,
                            email: user.email,
                            image: (fileName.length != 0) ? fileName : user.image,
                            mobile: user.mobile,
                            role_id: user.role_id,
                            username: fields.username,
                        }
                        var data = { user_data: user_data };
                        var response = { status: 1, message: 'Profile updated successfully', response: data }
                        res.send(response);
                    });

                }
            });

        } else {
            var response = { status: 0, message: 'Please provide valid name' }
            res.send(response);
        }

    })
})

router.post("/update_password", function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {


        fields.password = fields.password.replace(/\s+/g, ' ').trim();
        if (fields.password) {
            Users.find({ _id: fields.user_id }, function (err, result) {
                if (err) throw err;

                if (!result.length) {
                    var response = { status: 0, message: 'Invalid User', response: {} }
                    res.send(response);
                } else {

                    if (passwordHash.verify(fields.old_password, result[0].password)) {

                        if (fields.old_password != fields.password) {

                            Users.findOneAndUpdate({ _id: fields.user_id }, {
                                password: passwordHash.generate(fields.password),
                                otp: null,
                                otp_status: 0
                            }, function (err, user) {
                                if (err) throw err;
                                var response = { status: 1, message: 'Password updated successfully', response: {} }
                                res.send(response);
                            });
                        } else {
                            var response = { status: 0, message: 'Current password and new password must different', response: {} }
                            res.send(response);
                        }

                    } else {
                        var response = { status: 0, message: 'Old Password do not match', response: {} }
                        res.send(response);
                    }

                }
            });
        } else {
            var response = { status: 0, message: 'Please provide valid password', response: {} }
            res.send(response);
        }
    })
})


router.post('/profile', async (req, res) => {
    console.log(req.doc)
    Users.findOne({ _id: req.doc }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            var response = { status: 1, message: 'here is your profile', response: doc }
            res.send(response);
        }
    })
})

router.post('/changepassword', async (req, res) => {
    console.log(req.doc)
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.oldPassword) {
        if (formData.fields.newPassword) {
            if (formData.fields.confirmPassword) {
                if (formData.fields.confirmPassword == formData.fields.newPassword) {
                    Users.findOne({ _id: req.doc, }).exec((err, doc) => {
                        if (err) throw err;
                        if (doc) {
                            if (bcrypt.compareSync(formData.fields.oldPassword, doc.password)) {
                                doc.password = bcrypt.hashSync(formData.fields.newPassword, salt)
                                doc.save((err, user) => {
                                    if (err) throw err
                                    if (user) {
                                        var response = { status: 1, message: 'Password change successfully', response: doc }
                                        res.send(response);
                                    }
                                })
                            }
                            else {
                                var response = { status: 0, message: 'Old Password is incorrect', response: {} }
                                res.send(response);
                            }

                        }
                    })

                } else {
                    var response = { status: 0, message: 'New Password and confirm password do not match', response: {} }
                    res.send(response);
                }
            } else {
                var response = { status: 0, message: 'Please provide confirmPassword', response: {} }
                res.send(response);
            }
        } else {
            var response = { status: 0, message: 'Please provide newPassword', response: {} }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide old password', response: {} }
        res.send(response);
    }
})


router.post("/export", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let searchQuery = {
        role_id: roleId,status:1,is_show:1
    }
    if (formData.fields.searchItem) {
        formData.fields.searchItem = formData.fields.searchItem.replace('+','')
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
    Users.find(searchQuery, 'name email', function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'All admin list', data: user }
        res.send(response);
    });
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

module.exports = router