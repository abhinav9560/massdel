var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var Faq = require('../../db/faqSchema');

const commonHelper = require('../helpers/functions');

router.post("/insert", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.question_english && formData.fields.question_aramaic) {
        if (formData.fields.answer_english && formData.fields.answer_aramaic) {
            formData.fields.question_english = formData.fields.question_english.trim();
            formData.fields.question_aramaic = formData.fields.question_aramaic.trim();
            formData.fields.answer_english = formData.fields.answer_english.trim();
            formData.fields.answer_aramaic = formData.fields.answer_aramaic.trim();
            const newquestion = new Faq({
                question_english: formData.fields.question_english,
                question_aramaic: formData.fields.question_aramaic,
                answer_english: formData.fields.answer_english,
                answer_aramaic: formData.fields.answer_aramaic,
            });
            newquestion.save(async function (saveError, saveSuccess) {
                if (saveError) { throw saveError; };
                if (saveSuccess) {
                    var response = { status: 1, message: 'Question addedd successfully', dataflow: 1, data: saveSuccess }
                    res.send(response);
                }
                else {
                    var response = { status: 0, message: 'Oops something wrong please try after some time', dataflow: 0 }
                    res.send(response);
                }
            });
        } else {
            var response = { status: 0, message: 'Please provide answer', dataflow: 0 }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide both question', dataflow: 0 }
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
            { question_english: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { question_aramaic: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]
        
    }
    searchQuery.is_show = 1;
    Faq.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }
        Faq.find(searchQuery, {}, query, async function (err, data) {

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
    Faq.findOneAndUpdate({ _id: formData.fields.id }, { is_show: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Question deleted successfully', data: slide }
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
    Faq.findOne({ _id: formData.fields.id }, function (err, slide) {
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
        if (formData.fields.question_english && formData.fields.question_aramaic) {
            if (formData.fields.answer_english && formData.fields.answer_aramaic) {
                formData.fields.question_english = formData.fields.question_english.trim();
                formData.fields.question_aramaic = formData.fields.question_aramaic.trim();
                formData.fields.answer_english = formData.fields.answer_english.trim();
                formData.fields.answer_aramaic = formData.fields.answer_aramaic.trim();
                Faq.findOneAndUpdate({ _id: formData.fields.id }, { 
                    question_english: formData.fields.question_english, 
                    question_aramaic: formData.fields.question_aramaic, 
                    answer_english: formData.fields.answer_english, 
                    answer_aramaic: formData.fields.answer_aramaic,
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
                var response = { status: 0, message: 'Please provide answer', data: slide }
                res.send(response);
            }
        } else {
            var response = { status: 0, message: 'Please provide both question', data: slide }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide id', data: slide }
        res.send(response);
    }
});



module.exports = router