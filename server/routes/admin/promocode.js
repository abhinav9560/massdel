var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var Promocode = require('../../db/promocode');

const commonHelper = require('../helpers/functions');

router.post("/insert", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.type && formData.fields.name) {
        formData.fields.couponCode = formData.fields.couponCode.trim();
        formData.fields.name = formData.fields.name.trim();

        let ifExist = await Promocode.countDocuments({ couponCode: formData.fields.couponCode, name: formData.fields.name, is_show: 1 })
        if (ifExist) {
            var response = { status: 0, message: 'Name Already Exist', dataflow: 0, data: {} }
            res.send(response);
            return
        }

        const newcity = new Promocode({
            createdBy:req.doc,
            couponCode: formData.fields.couponCode,
            name: formData.fields.name,
            type: formData.fields.type,
            discount: formData.fields.discount,
            limitPerUser: formData.fields.limitPerUser,
            startDate: formData.fields.startDate,
            endDate: formData.fields.endDate,
        });
        newcity.save(async function (saveError, saveSuccess) {
            if (saveError) { throw saveError; };
            if (saveSuccess) {
                var response = { status: 1, message: 'Promocode addedd successfully', data: saveSuccess }
                res.send(response);
            }
            else {
                var response = { status: 0, message: 'Oops something wrong please try after some time' }
                res.send(response);
            }
        });
    } else {
        var response = { status: 0, message: 'Please provide both name' }
        res.send(response);
    }
});

router.post("/get", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
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
        searchQuery.$or = [
            { name: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { couponCode: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]

    }
    searchQuery.is_show = 1;
    Promocode.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }
        Promocode.find(searchQuery, {}, query, async function (err, data) {

            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                response = { "status": true, "data": data, "pages": totalPages, 'pageNo': pageNo, 'size': size, 'length': data.length };
            }
            res.json(response);
        }).sort({ 'createdAt': -1 })
    });
});


router.post("/delete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Promocode.findOneAndUpdate({ _id: formData.fields.id }, { is_show: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Promocode deleted successfully', data: slide }
        res.send(response);
    });
});

router.post("/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Promocode.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Promocode Activated successfully', data: slide }
        res.send(response);
    })
});

router.post("/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Promocode.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Promocode De-activated successfully', data: slide }
        res.send(response);
    });
});

router.post("/getSingle", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Promocode.findOne({ _id: formData.fields.id }, function (err, slide) {
        if (err) throw err
        console.log(slide)
        if (slide) {
            var response = { status: 1, message: 'found successfully', data: slide }
            res.send(response);
        } else {
            var response = { status: 0, message: 'Something wrong', data: slide }
            res.send(response);
        }
    });
});


router.post("/update", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.id) {
        if (formData.fields.name && formData.fields.couponCode) {
            formData.fields.name = formData.fields.name.trim();
            formData.fields.couponCode = formData.fields.couponCode.trim();

            let ifExist = await Promocode.countDocuments({ name: formData.fields.name, couponCode: formData.fields.couponCode, is_show: 1, _id: { $ne: formData.fields.id } })
            if (ifExist) {
                var response = { status: 0, message: 'Name Already Exist', dataflow: 0, data: {} }
                res.send(response);
                return
            }

            Promocode.findOneAndUpdate({ _id: formData.fields.id }, {
                createdBy:req.doc,
                couponCode: formData.fields.couponCode,
                name: formData.fields.name,
                type: formData.fields.type,
                discount: formData.fields.discount,
                limitPerUser: formData.fields.limitPerUser,
                startDate: formData.fields.startDate,
                endDate: formData.fields.endDate,
            }, function (err, slide) {
                if (err) throw err
                if (slide) {
                    var response = { status: 1, message: 'Updated successfully', data: slide }
                    res.send(response);
                } else {
                    var response = { status: 0, message: 'Something wrong', data: slide }
                    res.send(response);
                }
            });
        } else {
            var response = { status: 0, message: 'Please provide both name', data: slide }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide id', data: slide }
        res.send(response);
    }
});



module.exports = router