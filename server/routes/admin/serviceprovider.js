const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const jwt = require('jsonwebtoken');
const { base64encode, base64decode } = require('nodejs-base64');

var mongoose = require('mongoose');
var objectId = mongoose.Types.ObjectId();

const roleId = 3

const commonHelper = require('../helpers/functions');

const Users = require('../../db/userSchema');

var Language = require('../../db/language');
var Qualification = require('../../db/qualification');
var Training = require('../../db/training');
var City = require('../../db/city');
var BankAccount = require('../../db/bankAccount');

router.get("/getCity", async (req, res) => {
    City.find({ status: 1, is_show: 1 }, 'name_english name_aramaic', (err, doc) => {
        if (err) console.log(err)
        if (doc) {
            var response = { status: 1, message: 'City list', data: doc }
            res.send(response);
        }
    })
})

router.get("/getLanguage", async (req, res) => {
    Language.find({ status: 1, is_show: 1 }, 'name_english name_aramaic', (err, doc) => {
        if (err) console.log(err)
        if (doc) {
            var response = { status: 1, message: 'Language list', data: doc }
            res.send(response);
        }
    })
})

router.get("/getQualification", async (req, res) => {
    Qualification.find({ status: 1, is_show: 1 }, 'name_english name_aramaic', (err, doc) => {
        if (err) console.log(err)
        if (doc) {
            var response = { status: 1, message: 'Qualification list', data: doc }
            res.send(response);
        }
    })
})

router.get("/getTraining", async (req, res) => {
    Training.find({ status: 1, is_show: 1 }, 'name_english name_aramaic', (err, doc) => {
        if (err) console.log(err)
        if (doc) {
            var response = { status: 1, message: 'Training list', data: doc }
            res.send(response);
        }
    })
})

router.post('/insertServiceProvider', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)

    if (formData.fields.name) {
        if (formData.fields.mobile) {
            if (formData.fields.password) {

                //  console.log(formData.files.profilePicture)
                //  console.log(formData.files.profilePicture)
                if (formData.files.identification) {
                    let temp = {}
                    temp.image = formData.files.identification
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');

                    if (uploadedImage.status == 1) {
                        formData.fields.identification = uploadedImage.imageAr[0]
                    }
                }

                if (formData.files.profilePicture) {
                    let temp = {}
                    temp.image = formData.files.profilePicture
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');

                    if (uploadedImage.status == 1) {
                        formData.fields.profilePicture = uploadedImage.imageAr[0]
                    }
                }

                if (formData.files.educationImage) {
                    let temp = {}
                    temp.image = formData.files.educationImage
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');

                    if (uploadedImage.status == 1) {
                        formData.fields.educationImage = uploadedImage.imageAr[0]
                    }
                }

                if (formData.files.tradeLicense) {
                    let temp = {}
                    temp.image = formData.files.tradeLicense
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');

                    if (uploadedImage.status == 1) {
                        formData.fields.tradeLicense = uploadedImage.imageAr[0]
                    }
                }

                if (formData.files.tinCertificate) {
                    let temp = {}
                    temp.image = formData.files.tinCertificate
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');

                    if (uploadedImage.status == 1) {
                        formData.fields.tinCertificate = uploadedImage.imageAr[0]
                    }
                }

                Users.find({ mobile: formData.fields.mobile }, function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {
                        var user = new Users({
                            name: formData.fields.name,
                            mobile: formData.fields.mobile,
                            city: formData.fields.city,
                            address: formData.fields.address,
                            residence: formData.fields.residence,
                            sex: formData.fields.sex,
                            dob: formData.fields.dob,
                            isSignup:1,
                            verified:1,
                            // language: formData.fields.language,
                            qualification: formData.fields.qualification,
                            training: formData.fields.training,
                            country: formData.fields.country,
                            identification: formData.fields.identification,
                            profilePicture: formData.fields.profilePicture,
                            educationImage: formData.fields.educationImage,
                            tradeLicense: formData.fields.tradeLicense,
                            tinCertificate: formData.fields.tinCertificate,
                            category: formData.fields.category ? formData.fields.category.split(',') : [],
                            subCategory: formData.fields.subCategory ? formData.fields.subCategory.split(',') : [],
                            language: formData.fields.language ? formData.fields.language.split(',') : [],
                            referralSelf: commonHelper.generateReferral(),
                            password: bcrypt.hashSync(formData.fields.password, salt),
                            role_id: roleId,

                            location: {
                                type: "Point",
                                coordinates: formData.fields.lng != 'null' && formData.fields.lat != 'null' ? [parseFloat(formData.fields.lng), parseFloat(formData.fields.lat)] : [],
                            },
                            lat: formData.fields.lat != 'null' ? parseFloat(formData.fields.lat) : 'null',
                            lng: formData.fields.lng != 'null' ? parseFloat(formData.fields.lng) : 'null',

                        });
                        user.save(function (err) {
                            if (err) throw err;
                            var jsonData = { status: 1, message: "Inserted Successfully", response: {} }
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

        } else {
            var response = { status: 0, message: "mobile not found" }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: "Name not found" }
        res.send(response);
    }
});

router.post('/getServiceProvider', async (req, res) => {
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
    searchQuery.role_id = roleId; //roleId = 3 = Servcie Provider
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
        let start = new Date(dateRange.start).setHours(0,0,0,0)
        let end = new Date(dateRange.end).setHours(23,59,59,999)
        searchQuery.createdAt = {
            $gt: start,
            $lte: end,
        }
    }
    console.log(searchQuery)

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
                var imageUrl = process.env.url + "/public/uploads/images/provider_images/";
                response = { "status": true, "data": data, "imageUrl": imageUrl, "totalCount": totalCount, 'pageNo': pageNo, 'size': size, user_length: data.length };
            }
            res.json(response);
        });
    });
})

router.post('/getSingleServiceProvider', async (req, res) => {
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
        var imageUrl = process.env.url + "/public/uploads/images/provider_images/";
        var response = { status: 1, imageUrl: imageUrl, message: 'Single Provider', response: data }
        res.send(response);
    })
})

router.post('/updateServiceProvider', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.user_id) {
        if (formData.fields.name) {
            if (formData.fields.mobile) {

                if (formData.files.identification) {
                    let temp = {}
                    temp.image = formData.files.identification
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');
                    // console.log(uploadedImage)
                    if (uploadedImage.status == 1) {
                        formData.fields.identification = uploadedImage.imageAr[0]
                    }
                }
                if (formData.files.profilePicture) {
                    let temp = {}
                    temp.image = formData.files.profilePicture
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');
                    // console.log(uploadedImage)
                    if (uploadedImage.status == 1) {
                        formData.fields.profilePicture = uploadedImage.imageAr[0]
                    }
                }
                if (formData.files.tradeLicense) {
                    let temp = {}
                    temp.image = formData.files.tradeLicense
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');
                    // console.log(uploadedImage)
                    if (uploadedImage.status == 1) {
                        formData.fields.tradeLicense = uploadedImage.imageAr[0]
                    }
                }

                if (formData.files.educationImage) {
                    let temp = {}
                    temp.image = formData.files.educationImage
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');
                    // console.log(uploadedImage)
                    if (uploadedImage.status == 1) {
                        formData.fields.educationImage = uploadedImage.imageAr[0]
                    }
                }

                if (formData.files.tinCertificate) {
                    let temp = {}
                    temp.image = formData.files.tinCertificate
                    let uploadedImage = await commonHelper.uploadImages(temp, 'provider_images');
                    // console.log(uploadedImage)
                    if (uploadedImage.status == 1) {
                        formData.fields.tinCertificate = uploadedImage.imageAr[0]
                    }
                }
                Users.findOne({ mobile: formData.fields.mobile, _id: { $ne: formData.fields.user_id } }, function (err, result) {
                    if (err) throw err;
                    if (!result) {
                        Users.findOne({ _id: formData.fields.user_id }, function (err, user) {
                            if (err) throw err;
                            if (user) {
                                user.name = formData.fields.name
                                user.mobile = formData.fields.mobile
                                user.city = formData.fields.city
                                user.address = formData.fields.address
                                user.residence = formData.fields.residence
                                user.sex = formData.fields.sex
                                user.dob = formData.fields.dob
                                user.language = formData.fields.language
                                user.qualification = formData.fields.qualification
                                user.training = formData.fields.training
                                user.country = formData.fields.country
                                user.category = formData.fields.category ? formData.fields.category.split(',') : []
                                user.subCategory = formData.fields.subCategory ? formData.fields.subCategory.split(',') : []
                                user.language = formData.fields.language ? formData.fields.language.split(',') : []
                                if (formData.fields.identification) {
                                    user.identification = formData.fields.identification
                                }
                                if (formData.fields.profilePicture) {
                                    user.profilePicture = formData.fields.profilePicture
                                }
                                if (formData.fields.educationImage) {
                                    user.educationImage = formData.fields.educationImage
                                }
                                if (formData.fields.tradeLicense) {
                                    user.tradeLicense = formData.fields.tradeLicense
                                }
                                if (formData.fields.tinCertificate) {
                                    user.tinCertificate = formData.fields.tinCertificate
                                }
                                if (formData.fields.lng && formData.fields.lat) {
                                    user.location = {
                                        type: "Point",
                                        coordinates: [parseFloat(formData.fields.lng), parseFloat(formData.fields.lat)],
                                    },
                                    lat = parseFloat(formData.fields.lat)
                                    lng = parseFloat(formData.fields.lng)
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
                        var jsonData = { status: 0, message: "mobile already registered", response: {} }
                        res.send(jsonData);
                    }
                })
            } else {
                var response = { status: 0, message: "mobile not found" }
                res.send(response);
            }
        } else {
            var response = { status: 0, message: "name not found" }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: "Provider not found" }
        res.send(response);
    }
});

router.post("/deleteServiceProvider", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let user_id = mongoose.Types.ObjectId(formData.fields.user_id)
    if (!user_id) {
        var response = { status: 0, message: 'Please send user id', response: {} }
        res.send(response);
    }
    Users.findOneAndUpdate({ _id: user_id }, { is_show: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Provider deleted successfully', data: user }
        res.send(response);
    });
});
router.post("/inactiveServiceProvider", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Provider Inactivated successfully', data: user }
        res.send(response);
    });
});

router.post("/activeServiceProvider", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Users.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Provider activated successfully', data: user }
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
    console.log(searchQuery)

    Users.find(searchQuery, 'name mobile wallet address residence', function (err, user) {
        if (err) throw err
        let data = []
        console.log(user)
        user.forEach(element => {
            let temp = {}
            temp.name = element.name
            temp.mobile = element.mobile
            temp.wallet = element.wallet
            temp.address = element.address
            temp.residence = element.residence
            temp.city = element.city ? element.city.name_english : ''
            temp.language = element.language ? element.language.name_english : ''
            temp.qualification = element.qualification ? element.qualification.name_english : ''
            temp.training = element.training ? element.training.name_english : ''
            element.city = ''
            data.push(temp)
        });
        var response = { status: 1, message: 'All provider list', data: data }
        res.send(response);
    }).populate('city').populate('language').populate('qualification').populate('training')
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
    Users.updateMany({ role_id: roleId, _id: { $in: JSON.parse(formData.fields.idArray) } }, { is_show: 0 }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            let response = { status: 1, message: ' Deleted succesfully', data: doc }
            res.send(response)
        }
    })
});

router.get("/canTakeBooking/:id", async (req, res) => {
    Users.findOne({ _id: req.params.id }, function (err, data) {
        data.canTakeBooking = !data.canTakeBooking;
        data.save(function (err) {
            if (err) console.log(err)
            else {
                let response = { status: 1, message: ' Updated succesfully', data: {} }
                res.send(response)
            }
        });
    });
})

router.get("/getBankAccounts/:id", async (req, res) => {
    let bankAccount = await BankAccount.find({ providerId: req.params.id, is_show: 1 })
    if (bankAccount) {
        let response = { status: 1, message: 'Getting bank accounsts details', data: bankAccount }
        res.send(response)
    } else {
        let response = { status: 0, message: 'Something went wrong', data: [] }
        res.send(response)
    }

})

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