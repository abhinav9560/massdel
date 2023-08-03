var express = require('express');

var router = express.Router();
var Booking = require('../../db/bookingSchema');
var User = require('../../db/userSchema');
var Notification = require('../../db/notification');
var Category = require('../../db/categorySchema');
var SubCategory = require('../../db/subcategorySchema');

const commonHelper = require('../helpers/functions');

// router.post("/insert", async function (req, res) {
//     let formData = await commonHelper.getFormRecords(req)
//     if (formData.fields.question) {
//         if (formData.fields.answer) {
//             formData.fields.question = formData.fields.question.trim();
//             formData.fields.answer = formData.fields.answer.trim();
//             const newquestion = new Faq({
//                 question: formData.fields.question,
//                 answer: formData.fields.answer,
//             });

//             newquestion.save(async function (saveError, saveSuccess) {
//                 if (saveError) { throw saveError; };
//                 if (saveSuccess) {
//                     var response = { status: 1, message: 'Question addedd successfully', dataflow: 1, data: saveSuccess }
//                     res.send(response);
//                 }
//                 else {
//                     var response = { status: 0, message: 'Oops something wrong please try after some time', dataflow: 0 }
//                     res.send(response);
//                 }
//             });

//         } else {
//             var response = { status: 0, message: 'Please provide answer', dataflow: 0 }
//             res.send(response);
//         }
//     } else {
//         var response = { status: 0, message: 'Please provide question', dataflow: 0 }
//         res.send(response);
//     }
// });

router.post("/get", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    console.log(formData.fields)
    var pageNo = parseInt(formData.fields.pageNo);
    var size = parseInt(formData.fields.size);
    var searchItem = formData.fields.searchItem;
    var query = {}
    if (pageNo < 0 || pageNo === 0) {
        response = { status: false, message: "Invalid page number, should start with 1" };
        return res.json(response)
    }
    query.skip = size * (pageNo - 1)
    query.limit = size;
    var searchQuery = {}
    if (searchItem) {
        searchQuery.question = { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') };
    }
    if (formData.fields.statusFilter) {
        formData.fields.statusFilter = Number(formData.fields.statusFilter)
        if (formData.fields.statusFilter == 8) {

        } else {
            searchQuery.status = formData.fields.statusFilter
        }
    }
    searchQuery.is_show = 1;

    if (formData.fields.duration !== '5') {
        console.log('', formData.fields.duration)
    }

    if (formData.fields.dateRange) {
        formData.fields.dateRange = JSON.parse(formData.fields.dateRange)
        let start = new Date(formData.fields.dateRange.start).setHours(0, 0, 0, 0)
        let end = new Date(formData.fields.dateRange.end).setHours(23, 59, 59, 999)
        searchQuery.createdAt = {
            $gt: start,
            $lte: end,
        }
    }

    Booking.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }
        Booking.find(searchQuery, {}, query).sort({ 'createdAt': -1 }).populate('customerId').populate('providerId').exec(async function (err, data) {
            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                response = { "status": true, "data": data, "pages": totalPages, 'pageNo': pageNo, 'size': size, 'length': data.length, totalCount: totalCount };

                // response = { "status": true, "data": data, "totalCount": totalCount, imageUrl: imageUrl, 'pageNo': pageNo, 'size': size, user_length: data.length };
            }
            res.json(response);
        })
    });
});

router.post("/cancle", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Booking.findOneAndUpdate({ _id: formData.fields.id }, { status: 3 }, async function (err, slide) {
        if (err) throw err
        if (slide.providerId) {
            let data = await User.findOneAndUpdate({ _id: slide.providerId }, { isWorking: false })
        }
        var response = { status: 1, message: 'Booking cancelled successfully', data: slide }
        res.send(response);
    });
});


router.post("/delete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Booking.findOneAndUpdate({ _id: formData.fields.id }, { is_show: 0 }, async function (err, slide) {
        if (err) throw err
        if (slide.providerId) {
            let data = await User.findOneAndUpdate({ _id: slide.providerId }, { isWorking: false })
        }
        var response = { status: 1, message: 'Booking deleted successfully', data: slide }
        res.send(response);
    });
});

router.post("/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Faq.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Question Activated successfully', data: slide }
        res.send(response);
    })
});

router.post("/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Faq.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Question De-activated successfully', data: slide }
        res.send(response);
    });
});

router.post("/getSingle", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Booking.findOne({ _id: formData.fields.id }).populate('customerId').populate('providerId').populate('subCategory').exec(function (err, doc) {
        if (err) throw err;
        if (doc) {
            var response = { status: 1, message: 'found successfully', data: doc }
            res.send(response);
        } else {
            var response = { status: 0, message: 'Something wrong', data: {} }
            res.send(response);
        }
    });
});


router.post("/update", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.id) {
        if (formData.fields.question) {
            if (formData.fields.answer) {
                Faq.findOneAndUpdate({ _id: formData.fields.id }, { question: formData.fields.question, answer: formData.fields.answer }, function (err, slide) {
                    if (err) throw err
                    if (slide) {
                        var response = { status: 1, message: 'Updated successfully', data: slide }
                        res.send(response);
                    } else {
                        var response = { status: 0, message: 'Something wrong', data: {} }
                        res.send(response);
                    }
                });
            } else {
                var response = { status: 0, message: 'Please provide answer', data: {} }
                res.send(response);
            }
        } else {
            var response = { status: 0, message: 'Please provide question', data: {} }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide id', data: {} }
        res.send(response);
    }
});

router.post('/getNotification', async (req, res) => {
    let admin = await User.findOne({ role_id: 1 })
    Notification.find({ userId: admin._id }).sort({ 'createdAt': -1 }).limit(10).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            var response = { status: 1, message: 'Get notification', data: doc }
            res.send(response);
        }
    })
});

router.post('/readNotification', async (req, res) => {
    try {
        let update = await Notification.updateMany({ isRead: false }, { isRead: true })
        if (update) {
            var response = { status: 1, message: 'notification read', data: update }
            res.send(response);
        }
    } catch (err) {
        var response = { status: 0, message: err, data: {} }
        res.send(response);
    }
});

router.post('/customerautocomplete', async (req, res) => {
    try {
        let formData = await commonHelper.getFormRecords(req)
        let searchQuery = {
            status: 1,
            is_show: 1,
            role_id: 4
        }
        searchQuery.name = { $regex: new RegExp('.*' + formData.fields.search.trim() + '.*', 'i') };
        let user = await User.find(searchQuery)
        var response = { status: 1, message: 'customerautocomplete', data: user }
        res.send(response);
    } catch (err) {
        var response = { status: 0, message: err, data: {} }
        res.send(response);
    }
});

router.post('/providerautocomplete', async (req, res) => {
    try {
        let formData = await commonHelper.getFormRecords(req)
        let searchQuery = {
            status: 1,
            is_show: 1,
            role_id: 3
        }
        searchQuery.name = { $regex: new RegExp('.*' + formData.fields.search.trim() + '.*', 'i') };
        let user = await User.find(searchQuery)
        var response = { status: 1, message: 'providerautocomplete', data: user }
        res.send(response);
    } catch (err) {
        var response = { status: 0, message: err, data: {} }
        res.send(response);
    }
});

router.post('/getAllCat', async (req, res) => {
    try {
        let searchQuery = {
            status: 1,
            is_show: 1
        }
        let category = await Category.find(searchQuery)
        var response = { status: 1, message: 'getAllCat', data: category }
        res.send(response);
    } catch (err) {
        var response = { status: 0, message: err, data: {} }
        res.send(response);
    }
});

router.post('/getSubCat', async (req, res) => {
    try {
        let formData = await commonHelper.getFormRecords(req)
        let searchQuery = {
            status: 1,
            is_show: 1,
            category_id: formData.fields.id
        }
        let category = await SubCategory.find(searchQuery)
        var response = { status: 1, message: 'getSubCat', data: category }
        res.send(response);
    } catch (err) {
        var response = { status: 0, message: err, data: {} }
        res.send(response);
    }
});

router.post('/insertBooking', async (req, res) => {
    try {
        let formData = await commonHelper.getFormRecords(req)
        console.log(formData)
        if (formData.files.image) {
            let temp = {}
            temp.image = formData.files.image
            let uploadedImage = await commonHelper.uploadImages(temp, 'booking_images');
            console.log(uploadedImage)
            if (uploadedImage.status == 1) {
                formData.fields.image = uploadedImage.imageAr[0]
            }
        }

        let body = formData.fields
        // console.log(formData.fields)

        const booking = new Booking({
            date: new Date(),
            address: body.address,
            additionalNotes: body.additionalNotes,
            providerId: body.providerId ? body.providerId : null,
            customerId: body.customerId,
            image: body.image,
            // image: req.files && req.files.length ? req.files.map(element => element.filename) : [],
            paymentMode: body.paymentMode,
            subCategory: body.subCategory,
            category: body.category,
            type: body.type,
            scheduleDate: body.type == 'scheduled' ? Date(body.scheduleDate) : null,
            status: 0,
            lat: parseFloat(body.lat),
            lng: parseFloat(body.lng),
            location: {
                type: "Point",
                coordinates: [parseFloat(body.lng), parseFloat(body.lat)],
            }
        })
        booking.save(async (err, doc) => {
            if (err) throw err
            if (doc) {
                var response = { status: 1, message: "Booking added successfully", message_aramaic: 'ቦታ ማስያዝ በተሳካ ሁኔታ ታክሏል', data: doc }
                res.send(response);


                let title = new Notification()
                title.title = `Your booking of id ${doc.bookingId} has placed successfully`
                title.userId = req.doc
                title.type = 'booking'
                title.save((err, notification) => {
                    if (err) { console.log(err) }
                    if (notification) { console.log(notification) }
                })

            }
        })


    } catch (err) {
        var response = { status: 0, message: err, data: {} }
        res.send(response);
    }
});

router.post("/changeProvider", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Booking.findOneAndUpdate({ _id: formData.fields.id }, { providerId: formData.fields.providerId }, async function (err, slide) {
        if (err) throw err
        if (slide.providerId) {
            let data = await User.findOneAndUpdate({ _id: slide.providerId }, { isWorking: false })
        }
        var response = { status: 1, message: 'Provider Changed Successfully', data: slide }
        res.send(response);
    });
});

module.exports = router