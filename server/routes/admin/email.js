var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var Email = require('../../db/emailTemplateSchema');

const commonHelper = require('../helpers/functions');

router.post("/insert", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.name) {
        if (formData.fields.slug) {
            formData.fields.name = formData.fields.name.trim();
            formData.fields.slug = formData.fields.slug.trim();
            const newquestion = new Email({
                name: formData.fields.name,
                slug: formData.fields.slug,
                subject: formData.fields.subject,
                description: formData.fields.description,
            });

            newquestion.save(async function (saveError, saveSuccess) {
                if (saveError) { throw saveError; };
                if (saveSuccess) {
                    var response = { status: 1, message: 'Email Template addedd successfully', dataflow: 1, data: saveSuccess }
                    res.send(response);
                }
                else {
                    var response = { status: 0, message: 'Oops something wrong please try after some time', dataflow: 0 }
                    res.send(response);
                }
            });

        } else {
            var response = { status: 0, message: 'Please provide slug', dataflow: 0 }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide name', dataflow: 0 }
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
        searchQuery.name = { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') };
    }
    searchQuery.is_show = 1;
    Email.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }

        Email.find(searchQuery, {}, query, async function (err, data) {

            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                response = { "status": true, "data": data, "pages": totalPages, 'pageNo': pageNo, 'size': size, 'length': data.length };
            }
            res.json(response);
        }).sort({'createdAt':-1})
    });
});


router.post("/delete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Email.findOneAndUpdate({ _id: formData.fields.id }, { is_show: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Email Template deleted successfully', data: slide }
        res.send(response);
    });
});

router.post("/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Email.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Email Template Activated successfully', data: slide }
        res.send(response);
    })
});

router.post("/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Email.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Email Template De-activated successfully', data: slide }
        res.send(response);
    });
});

router.post("/getSingle", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Email.findOne({ _id: formData.fields.id }, function (err, slide) {
        if (err) throw err
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
        if (formData.fields.name) {
            if (formData.fields.slug) {
                Email.findOneAndUpdate({ _id: formData.fields.id }, {
                    name: formData.fields.name,
                    slug: formData.fields.slug,
                    subject: formData.fields.subject,
                    description: formData.fields.description,
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
                var response = { status: 0, message: 'Please provide slug', data: {} }
                res.send(response);
            }
        } else {
            var response = { status: 0, message: 'Please provide name', data: {} }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide id', data: {} }
        res.send(response);
    }
});



module.exports = router