var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var TandC = require('../../db/tandcSchema');
var Guide = require('../../db/guideSchema');
var Global = require('../../db/globalsetting');
var Slider = require('../../db/slider');

const commonHelper = require('../helpers/functions');

router.post("/insert", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.title_english) {
        if (formData.files.image) {
            var ImageType = formData.files.image.type;
            if (ImageType == 'image/jpeg' || ImageType == 'image/jpg' || ImageType == 'image/png') {
                var uploadedImage = await commonHelper.uploadImages(formData.files, 'guide_images');
                if (uploadedImage.status == 1) {
                    formData.fields.imageis = uploadedImage.imageAr[0]
                }
            }
            const newquestion = new Guide({
                title_english: formData.fields.title_english,
                title_aramaic: formData.fields.title_aramaic,
                description_english: formData.fields.description_english,
                description_aramaic: formData.fields.description_aramaic,
                image: (formData.fields.imageis ? formData.fields.imageis : ''),
            });
            newquestion.save(async function (saveError, saveSuccess) {
                if (saveError) { throw saveError; };
                if (saveSuccess) {
                    var response = { status: 1, message: 'Guide Template addedd successfully', dataflow: 1, data: saveSuccess }
                    res.send(response);
                }
                else {
                    var response = { status: 0, message: 'Oops something wrong please try after some time', dataflow: 0 }
                    res.send(response);
                }
            });
        } else {
            var response = { status: 0, message: 'Please provide image', dataflow: 0 }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide title', dataflow: 0 }
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
            { title_english: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { title_aramaic: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]
    }
    searchQuery.is_show = 1;
    Guide.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }

        Guide.find(searchQuery, {}, query, async function (err, data) {

            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                var imageUrl = process.env.url + "/public/uploads/images/guide_images/";
                response = { "status": true, "data": data, "pages": totalPages, 'pageNo': pageNo, 'size': size, 'length': data.length, imageUrl: imageUrl };
            }
            res.json(response);
        }).sort({ 'createdAt': -1 })
    });
});


router.post("/delete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Guide.findOneAndUpdate({ _id: formData.fields.id }, { is_show: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Guide Template deleted successfully', data: slide }
        res.send(response);
    });
});

router.post("/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Guide.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Guide Template Activated successfully', data: slide }
        res.send(response);
    })
});

router.post("/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Guide.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Guide Template De-activated successfully', data: slide }
        res.send(response);
    });
});

router.post("/getSingle", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Guide.findOne({ _id: formData.fields.id }, function (err, slide) {
        if (err) throw err
        if (slide) {
            var imageUrl = process.env.url + "/public/uploads/images/guide_images/";
            var response = { status: 1, message: 'found successfully', data: slide, imageUrl: imageUrl }
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
        if (formData.fields.title_english) {

            var updates = {
                title_english: formData.fields.title_english,
                title_aramaic: formData.fields.title_aramaic,
                description_english: formData.fields.description_english,
                description_aramaic: formData.fields.description_aramaic,
            };

            if (formData.files.image) {
                // console.log(formData.files.image)
                var imageUpload = await commonHelper.uploadImages(formData.files, 'guide_images');
                // console.log(imageUpload.status)
                if (imageUpload.status == 1) {
                    updates.image = imageUpload.imageAr[0];
                }
            }

            Guide.findOneAndUpdate({ _id: formData.fields.id }, updates, function (err, slide) {
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
            var response = { status: 0, message: 'Please provide title', data: {} }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide id', data: {} }
        res.send(response);
    }
});

// *************   tandc

router.post("/tandc/insert", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.description_english && formData.fields.description_aramaic) {
        const newquestion = new TandC({
            description_english: formData.fields.description_english,
            description_aramaic: formData.fields.description_aramaic,
            slug: formData.fields.slug.trim(),
            title: formData.fields.title.trim(),
        });
        newquestion.save(async function (saveError, saveSuccess) {
            if (saveError) { throw saveError; };
            if (saveSuccess) {
                var response = { status: 1, message: 'T&C Template addedd successfully', dataflow: 1, data: saveSuccess }
                res.send(response);
            }
            else {
                var response = { status: 0, message: 'Oops something wrong please try after some time', dataflow: 0 }
                res.send(response);
            }
        });
    } else {
        var response = { status: 0, message: 'Please provide both description', dataflow: 0 }
        res.send(response);
    }
});


router.post("/tandc/get", async function (req, res) {
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
            { description_english: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { description_aramaic: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]
    }
    searchQuery.is_show = 1;
    TandC.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }

        TandC.find(searchQuery, {}, query, async function (err, data) {

            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                response = { "status": true, "data": data, "pages": totalPages, 'pageNo': pageNo, 'size': size, 'length': data.length };
            }
            res.json(response);
        }).sort({ _id: -1 })
    });
});


router.post("/tandc/delete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    TandC.findOneAndUpdate({ _id: formData.fields.id }, { is_show: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'T&C Template deleted successfully', data: slide }
        res.send(response);
    });
});

router.post("/tandc/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    TandC.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'T&C Template Activated successfully', data: slide }
        res.send(response);
    })
});

router.post("/tandc/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    TandC.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'T&C Template De-activated successfully', data: slide }
        res.send(response);
    });
});

router.post("/tandc/getSingle", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    TandC.findOne({ _id: formData.fields.id }, function (err, slide) {
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


router.post("/tandc/update", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.id) {
        if (formData.fields.description_english && formData.fields.description_aramaic) {
            TandC.findOneAndUpdate({ _id: formData.fields.id }, {
                description_english: formData.fields.description_english,
                description_aramaic: formData.fields.description_aramaic,
                slug: formData.fields.slug.trim(),
                title: formData.fields.title.trim(),
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
            var response = { status: 0, message: 'Please provide both description', data: {} }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: 'Please provide id', data: {} }
        res.send(response);
    }
});


router.get("/globalsetting", async function (req, res) {
    Global.findOne({ type: 'Global' }, (err, doc) => {
        if (err) { throw err }
        if (doc) {
            var response = { status: 1, message: 'Global setting', data: doc }
            res.send(response);
        }
    })
})

router.post("/globalsetting", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Global.findOneAndUpdate({ type: 'Global' }, {
        commision: formData.fields.commision,
        referralAmountBy: formData.fields.referralAmountBy,
        referralAmountTo: formData.fields.referralAmountTo,
        defaultRadius: formData.fields.defaultRadius,
        paymentMode: JSON.parse(formData.fields.paymentMode),
        cancellationTime: JSON.parse(formData.fields.cancellationTime)
    }, (err, doc) => {
        if (err) { throw err }
        if (doc) {
            var response = { status: 1, message: 'Global setting updated', data: doc }
            res.send(response);
        }
    })
})


// Slider


router.post("/slider/insert", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
 
        if (formData.files.image) {
            var ImageType = formData.files.image.type;
            if (ImageType == 'image/jpeg' || ImageType == 'image/jpg' || ImageType == 'image/png') {
                var uploadedImage = await commonHelper.uploadImages(formData.files, 'guide_images');
                if (uploadedImage.status == 1) {
                    formData.fields.imageis = uploadedImage.imageAr[0]
                }
            }
            const newquestion = new Slider({
                image: (formData.fields.imageis ? formData.fields.imageis : ''),
            });
            newquestion.save(async function (saveError, saveSuccess) {
                if (saveError) { throw saveError; };
                if (saveSuccess) {
                    var response = { status: 1, message: 'Slider addedd successfully', dataflow: 1, data: saveSuccess }
                    res.send(response);
                }
                else {
                    var response = { status: 0, message: 'Oops something wrong please try after some time', dataflow: 0 }
                    res.send(response);
                }
            });
        } else {
            var response = { status: 0, message: 'Please provide image', dataflow: 0 }
            res.send(response);
        }
});


router.post("/slider/get", async function (req, res) {
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
            { title_english: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { title_aramaic: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]
    }
    searchQuery.is_show = 1;
    Slider.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }

        Slider.find(searchQuery, {}, query, async function (err, data) {
            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                var imageUrl = process.env.url + "/public/uploads/images/guide_images/";
                response = { "status": true, "data": data, "pages": totalPages, 'pageNo': pageNo, 'size': size, 'length': data.length, imageUrl: imageUrl };
            }
            res.json(response);
        }).sort({ 'createdAt': -1 })
    });
});


router.post("/slider/delete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Slider.findOneAndUpdate({ _id: formData.fields.id }, { is_show: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Slider deleted successfully', data: slide }
        res.send(response);
    });
});

router.post("/slider/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Slider.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Slider Activated successfully', data: slide }
        res.send(response);
    })
});

router.post("/slider/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Slider.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Slider De-activated successfully', data: slide }
        res.send(response);
    });
});

router.post("/slider/getSingle", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Slider.findOne({ _id: formData.fields.id }, function (err, slide) {
        if (err) throw err
        if (slide) {
            var imageUrl = process.env.url + "/public/uploads/images/guide_images/";
            var response = { status: 1, message: 'found successfully', data: slide, imageUrl: imageUrl }
            res.send(response);
        } else {
            var response = { status: 0, message: 'Something wrong', data: slide }
            res.send(response);
        }
    });
});


router.post("/slider/update", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.id) {
       

            var updates = {
                // title_english: formData.fields.title_english,
                // title_aramaic: formData.fields.title_aramaic,
                // description_english: formData.fields.description_english,
                // description_aramaic: formData.fields.description_aramaic,
            };

            if (formData.files.image) {
                // console.log(formData.files.image)
                var imageUpload = await commonHelper.uploadImages(formData.files, 'guide_images');
                // console.log(imageUpload.status)
                if (imageUpload.status == 1) {
                    updates.image = imageUpload.imageAr[0];
                }
            }

            Slider.findOneAndUpdate({ _id: formData.fields.id }, updates, function (err, slide) {
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
        var response = { status: 0, message: 'Please provide id', data: {} }
        res.send(response);
    }
});


module.exports = router