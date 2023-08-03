const express = require('express');
const router = express.Router()

var mongoose = require('mongoose');
var objectId = mongoose.Types.ObjectId();

const commonHelper = require('../helpers/functions');

const Category = require('../../db/categorySchema');
const Subcategory = require('../../db/subcategorySchema');

router.post('/insert', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields.name_english) {
    if (formData.fields.name_aramaic) {
        if (formData.files.image) {
            var ImageType = formData.files.image.type;
            if (ImageType == 'image/jpeg' || ImageType == 'image/jpg' || ImageType == 'image/png') {
                    var uploadedImage = await commonHelper.uploadImages(formData.files, 'categories_images');
                    if (uploadedImage.status == 1) {
                        formData.fields.imageis = uploadedImage.imageAr[0]
                    }
                    Category.countDocuments({  $or: [{ name_english: { $regex: new RegExp("^" + formData.fields.name_english.toLowerCase(), "i") } }, { name_english: { $regex: new RegExp("^" + formData.fields.name_english.toLowerCase(), "i") } }], is_show: 1 },
                        async function (error, success) {
                            if (error) { throw error };
                            if (!success) {
                                var newCategory = new Category({
                                    name_english: formData.fields.name_english,
                                    name_aramaic: formData.fields.name_aramaic,
                                    image: (formData.fields.imageis ? formData.fields.imageis : ''),
                                });
                                newCategory.save(async function (error, success) {
                                    var response = { status: 1, dataflow: 1, message: 'New category created successfully', data: success };
                                    res.send(response);
                                });
                            } else {
                                var response = { status: 0, dataflow: 0, message: 'This category already exists' };
                                res.send(response);
                            }
                        });
            } else {
                var response = { status: 0, dataflow: 0, message: 'Invalid image Type' };
                res.send(response);
            }
        } else {
            var response = { status: 0, dataflow: 1, message: 'Category image not found' };
            res.send(response);
        }
    } else {
        var response = { status: 0, dataflow: 1, message: 'Category name (Aramaic) not found' };
        res.send(response);
    }
} else {
    var response = { status: 0, dataflow: 1, message: 'Category name (English) not found' };
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

    if (searchItem) {
        searchQuery.$or = [
            { name_english: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { name_aramaic: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]
    }

    Category.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }
        Category.aggregate([
            {
                $match: searchQuery
            },
            {
                $skip: query.skip
            },
            {
                $limit: query.limit
            },
            {
                $sort: { 'createdAt': -1 }
            }
        ]).exec(async function (err, data) {
            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                var imageUrl = process.env.url + "/public/uploads/images/categories_images/";
                response = { "status": true, "data": data, "totalCount": totalCount, imageUrl: imageUrl, 'pageNo': pageNo, 'size': size, user_length: data.length };
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
    Category.findOne({ _id: user_id }).exec((err, data) => {
        if (err) {
            console.log(err)
        }
        var imageUrl = process.env.url + "/public/uploads/images/categories_images/";
        var response = { status: 1, message: 'Single Category', response: data, imageUrl: imageUrl }
        res.send(response);
    })
})

router.post('/update', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)

    if (formData.fields._id) {
        if (formData.fields.name_english) {
        if (formData.fields.name_aramaic) {

            formData.fields.name_english = formData.fields.name_english.replace(/\s+/g, ' ').trim();
            formData.fields.name_aramaic = formData.fields.name_aramaic.replace(/\s+/g, ' ').trim();

                var checkCondition = {
                    name_english: { $regex: new RegExp("^" + formData.fields.name_english.toLowerCase(), "i") },
                    is_show: 1, _id: { $ne: mongoose.Types.ObjectId(formData.fields._id) }
                }

                Category.countDocuments(checkCondition, async function (error, success) {
                    if (error) { throw error };
                    if (!success) {

                        var updates = {
                            name_english: formData.fields.name_english,
                            name_aramaic: formData.fields.name_aramaic,
                        };

                        if (formData.files.image) {
                            // console.log(formData.files.image)
                            var imageUpload = await commonHelper.uploadImages(formData.files, 'categories_images');
                            // console.log(imageUpload.status)
                            if (imageUpload.status == 1) {
                                updates.image = imageUpload.imageAr[0];
                            }
                        }

                        Category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(formData.fields._id) }, updates, async function (error, success) {
                            if (error) throw error;

                            success.name_aramaic = formData.fields.name_aramaic;
                            success.name_english = formData.fields.name_english;
                         
                            if (updates.image) {
                                success.image = updates.image;
                                var is_image = 1;
                            } else {
                                var is_image = 0;
                            }

                            var response = { status: 1, message: "Category updated successfully!!", data: success, is_image: is_image }
                            res.send(response);
                        });
                    } else {
                        var response = { status: 0, message: "This category already exists!!" }
                        res.send(response);
                    }
                })
            } else {
                var response = { status: 0, message: "Please provide category name_english" }
                res.send(response);
            }
        } else {
            var response = { status: 0, message: "Please provide category name_english" }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: "Category found" }
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
    Subcategory.find({ category_id: user_id, is_show:1,status:1  }, (err, doc) => {
        if (err) console.log(err);
        if (doc) {
            if (doc.length > 0) {
                var response = { status: 0, message: 'The category you want to delete has sub actegories, please delete them first and and then delete the category', data: {} }
                res.send(response);
                return
            }else{
                Category.findOneAndUpdate({ _id: user_id }, { is_show: 0 }, function (err, updateSuccess) {
                    if (err) throw err
                    if (updateSuccess) {
                        Subcategory.updateMany({ category_id: user_id }, { is_show: 0 }, async function (updateError, updateSuccessSub) {
                            if (updateError) { throw updateError };
                            if (updateSuccessSub) {
                                var response = { status: 1, message: 'Category deleted successfully.', data: updateSuccess }
                                res.send(response);
                            } else {
                                var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                                res.send(response);
                            }
                        })
                    } else {
                        var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                        res.send(response);
                    }
                }); 
            }
        }else{
            Category.findOneAndUpdate({ _id: user_id }, { is_show: 0 }, function (err, updateSuccess) {
                if (err) throw err
                if (updateSuccess) {
                    Subcategory.updateMany({ category_id: user_id }, { is_show: 0 }, async function (updateError, updateSuccessSub) {
                        if (updateError) { throw updateError };
                        if (updateSuccessSub) {
                            var response = { status: 1, message: 'Category deleted successfully.', data: updateSuccess }
                            res.send(response);
                        } else {
                            var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                            res.send(response);
                        }
                    })
                } else {
                    var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                    res.send(response);
                }
            });
        }
    })
});

router.post("/inactive", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let user_id = formData.fields.id
    // Category.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, user) {
    //     if (err) throw err
    //     var response = { status: 1, message: 'Category Inactivated successfully', data: user }
    //     res.send(response);
    // });
    Subcategory.find({ category_id: user_id, is_show:1,status:1  }, (err, doc) => {
        if (err) console.log(err);
        if (doc) {
            if (doc.length > 0) {
                var response = { status: 0, message: 'The category you want to deactivate has sub categories, please deactivate them first and and then deactivate the category', data: {} }
                res.send(response);
                return
            }else{
                Category.findOneAndUpdate({ _id: user_id }, { status: 0 }, function (err, updateSuccess) {
                    if (err) throw err
                    if (updateSuccess) {
                        Subcategory.updateMany({ category_id: user_id }, { status: 0 }, async function (updateError, updateSuccessSub) {
                            if (updateError) { throw updateError };
                            if (updateSuccessSub) {
                                var response = { status: 1, message: 'Category inactive successfully.', data: updateSuccess }
                                res.send(response);
                            } else {
                                var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                                res.send(response);
                            }
                        })
                    } else {
                        var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                        res.send(response);
                    }
                }); 
            }
        }else{
            Category.findOneAndUpdate({ _id: user_id }, { status: 0 }, function (err, updateSuccess) {
                if (err) throw err
                if (updateSuccess) {
                    Subcategory.updateMany({ category_id: user_id }, { status: 0 }, async function (updateError, updateSuccessSub) {
                        if (updateError) { throw updateError };
                        if (updateSuccessSub) {
                            var response = { status: 1, message: 'Category inactive successfully.', data: updateSuccess }
                            res.send(response);
                        } else {
                            var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                            res.send(response);
                        }
                    })
                } else {
                    var response = { status: 0, message: 'Something went wrong please try after some time.', data: updateSuccess }
                    res.send(response);
                }
            });
        }
    })
});

router.post("/active", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Category.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Category activated successfully', data: user }
        res.send(response);
    });
});



router.post('/getSubCategory', async (req, res) => {
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

    if (searchItem) {
        searchQuery.$or = [
            { name_english: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
            { name_aramaic: { $regex: new RegExp('.*' + searchItem.trim() + '.*', 'i') } },
        ]
    }

    Subcategory.countDocuments(searchQuery, function (err, totalCount) {
        if (err) {
            response = { "status": false, "message": "Error fetching data" }
        }
        Subcategory.aggregate([
            {
                $match: searchQuery
            },
            {
                $lookup:
                {
                    from: 'categories',
                    let: { category_id: "$category_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$category_id"] }
                            }
                        },
                        {
                            $project: {
                                name_english: 1
                            }
                        }
                    ],
                    as: 'category',
                },
            },
            {
                $skip: query.skip
            },
            {
                $limit: query.limit
            }
        ]).exec(async function (err, data) {
            if (err) {
                response = { "status": false, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size);
                var imageUrl = process.env.url + "/public/uploads/images/categories_images/";
                response = { "status": true, "data": data, "totalCount": totalCount, imageUrl: imageUrl, 'pageNo': pageNo, 'size': size, user_length: data.length };
            }
            res.json(response);
        });
    });
})


router.post("/addSubCategory", async function (req, res) {
    var formData = await commonHelper.getFormRecords(req);
    if (formData.fields.name_english) {
    if (formData.fields.name_aramaic) {
        if (formData.fields._id) {

            formData.fields.name_english = formData.fields.name_english.trim();
            formData.fields.name_aramaic = formData.fields.name_aramaic.trim();

            if (formData.files.image) {
                var ImageType = formData.files.image.type;
                if (ImageType == 'image/jpeg' || ImageType == 'image/jpg' || ImageType == 'image/png') {
                        var uploadedImage = await commonHelper.uploadImages(formData.files, 'categories_images');
                        if (uploadedImage.status == 1) {
                            formData.fields.imageis = uploadedImage.imageAr[0]
                                Subcategory.countDocuments({$or: [{ name_english: { $regex: new RegExp("^" + formData.fields.name_english.toLowerCase(), "i") } }, { name_english: { $regex: new RegExp("^" + formData.fields.name_english.toLowerCase(), "i") } }], is_show: 1 }, async function (error, success) {
                                    if (error) { throw error };
                                    if (!success) {
                                        var newCategory = new Subcategory({
                                            name_english: formData.fields.name_english,
                                            name_aramaic: formData.fields.name_aramaic,
                                            category_id: mongoose.Types.ObjectId(formData.fields._id),
                                            image: formData.fields.imageis,
                                            minRate: formData.fields.minRate,
                                            minDuration: formData.fields.minDuration,
                                            softLimit: formData.fields.softLimit,
                                            hardLimit: formData.fields.hardLimit,
                                        });
                                        newCategory.save(async function (error, success) {
                                            var response = { status: 1, dataflow: 1, message: 'New Subcategory created successfully', data: success };
                                            res.send(response);
                                        });
                                    } else {
                                        var response = { status: 0, dataflow: 0, message: 'This Subcategory already exists' };
                                        res.send(response);
                                    }
                                });
                        }
                    }
            } else {
                var response = { status: 0, dataflow: 0, message: 'Please send Image' };
                res.send(response);
            }
        } else {
            var response = { status: 0, dataflow: 1, message: 'Parent category not found' };
            res.send(response);
        }
    } else {
        var response = { status: 0, dataflow: 1, message: 'Category name_aramaic not found' };
        res.send(response);
    }
} else {
    var response = { status: 0, dataflow: 1, message: 'Category name_english not found' };
    res.send(response);
}
});

router.post("/foundParentCategory", async function (req, res) {
    var formData = await commanHelper.getFormRecords(req);
    if (formData.fields._id) {
        Subcategory.findOne({ _id: mongoose.Types.ObjectId(formData.fields._id) }, async function (error, success) {
            if (error) { throw error };
            var response = { status: 1, dataflow: 1, message: 'Category found successfully', data: success };
            res.send(response);
        });

    }
});

router.post('/editSubCategory', async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    if (formData.fields._id) {
        if (formData.fields.name_english) {
        if (formData.fields.name_aramaic) {
            formData.fields.name_english = formData.fields.name_english.trim();
            formData.fields.name_aramaic = formData.fields.name_aramaic.trim();
                var checkCondition = {
                    $or: [{ name_english: { $regex: new RegExp("^" + formData.fields.name_english.toLowerCase(), "i") } }, { name_english: { $regex: new RegExp("^" + formData.fields.name_english.toLowerCase(), "i") } }]
                    ,is_show: 1, _id: { $ne: mongoose.Types.ObjectId(formData.fields._id) }
                }
                Subcategory.countDocuments(checkCondition, async function (error, success) {
                    if (error) { throw error };
                    if (!success) {
                        var updates = {
                            name_english: formData.fields.name_english,
                            name_aramaic: formData.fields.name_aramaic,
                            category_id: formData.fields.category_id,
                            minRate: formData.fields.minRate,
                            minDuration: formData.fields.minDuration,
                            softLimit: formData.fields.softLimit,
                            hardLimit: formData.fields.hardLimit,
                            categories_order: (formData.fields.categories_order ? parseInt(formData.fields.categories_order) : 0),
                        };
                        if (formData.files.image) {
                            var imageUpload = await commonHelper.uploadImages(formData.files, 'categories_images');
                            if (imageUpload.status == 1) {
                                updates.image = imageUpload.imageAr[0];
                            }
                        }
                        Subcategory.findOneAndUpdate({ _id: mongoose.Types.ObjectId(formData.fields._id) }, updates, async function (error, success) {
                            if (error) throw error;
                            success.name = formData.fields.name;
                            success.categories_order = (formData.fields.categories_order ? parseInt(formData.fields.categories_order) : 0);
                            if (updates.image) {
                                success.image = updates.image;
                                var is_image = 1;
                            } else {
                                var is_image = 0;
                            }
                            var response = { status: 1, message: "Category updated successfully!!", data: success, is_image: is_image }
                            res.send(response);
                        });
                    } else {
                        var response = { status: 0, message: "This category already exists!!" }
                        res.send(response);
                    }
                })
        } else {
            var response = { status: 0, message: "Please provide name_aramaic" }
            res.send(response);
        }
    } else {
        var response = { status: 0, message: "Please provide name_english" }
        res.send(response);
    }
    } else {
        var response = { status: 0, message: "Category found" }
        res.send(response);
    }
});

router.post("/deleteSubCategory", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Subcategory.findOneAndUpdate({ _id: formData.fields.user_id }, { is_show: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Subcategory deleted successfully', data: user }
        res.send(response);
    });
});

router.post("/activeSubCategory", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Subcategory.findOneAndUpdate({ _id: formData.fields.id }, { status: 1 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Subcategory activated successfully', data: user }
        res.send(response);
    });
});

router.post("/deactiveSubCategory", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Subcategory.findOneAndUpdate({ _id: formData.fields.id }, { status: 0 }, function (err, user) {
        if (err) throw err
        var response = { status: 1, message: 'Subcategory Inactivated successfully', data: user }
        res.send(response);
    });
});

router.post('/getAllParentCategories', async function (req, res) {
    Category.find({ is_show: 1, status: 1 }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Category found successfully', data: slide }
        res.send(response);
    });
})

router.post('/getSubCatById', async function (req, res) {
    Subcategory.find({ is_show: 1, status: 1, category_id: { $in: req.body } }, function (err, slide) {
        if (err) throw err
        var response = { status: 1, message: 'Category found successfully', data: slide }
        res.send(response);
    });
})

router.post('/getSingleSubCategory', async (req, res) => {
    let formData = await commonHelper.getFormRecords(req)
    let _id = mongoose.Types.ObjectId(formData.fields._id)
    if (!_id) {
        var response = { status: 0, message: 'Please send id', response: {} }
        res.send(response);
    }
    Subcategory.findOne({ _id: _id }).exec((err, data) => {
        if (err) {
            console.log(err)
        }
        var imageUrl = process.env.url + "/public/uploads/images/categories_images/";
        var response = { status: 1, message: 'Single sub Category', response: data, imageUrl: imageUrl }
        res.send(response);
    })
})

router.post("/category/export", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let searchQuery = {
        status:1,is_show:1
    }
    if (formData.fields.searchItem) {
        formData.fields.searchItem = formData.fields.searchItem.replace('+','')
        searchQuery.$or = [
            { name_english: { $regex: new RegExp('.*' + formData.fields.searchItem.trim() + '.*', 'i') } },
            { name_aramaic: { $regex: new RegExp('.*' + formData.fields.searchItem.trim() + '.*', 'i') } },
        ]
    }
    console.log(searchQuery)
    Category.find(searchQuery, 'name_english name_aramaic', function (err, doc) {
        if (err) throw err
        var response = { status: 1, message: 'All category list', data: doc }
        res.send(response);
    });
});


router.post("/category/multiStatusChange", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Category.updateMany({ _id: { $in: JSON.parse(formData.fields.idArray) } }, { status: parseInt(formData.fields.status) }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            let response = { status: 1, message: ' Status updated succesfully', data: doc }
            res.send(response)
        }
    })
});

router.post("/category/multiDelete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Category.updateMany({ _id: { $in: JSON.parse(formData.fields.idArray) } }, { is_show: 0 }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            let response = { status: 1, message: ' Deleted succesfully', data: doc }
            res.send(response)
        }
    })
});

router.post("/subcategory/export", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    let searchQuery = {
        status:1,is_show:1
    }
    if (formData.fields.searchItem) {
        formData.fields.searchItem = formData.fields.searchItem.replace('+','')
        searchQuery.$or = [
            { name_english: { $regex: new RegExp('.*' + formData.fields.searchItem.trim() + '.*', 'i') } },
            { name_aramaic: { $regex: new RegExp('.*' + formData.fields.searchItem.trim() + '.*', 'i') } },
        ]
    }
    Subcategory.find(searchQuery, 'name_english name_aramaic minRate minDuration softLimit hardLimit', function (err, doc) {
        if (err) throw err
        if(doc){
            console.log(doc)
            let data = []
            doc.forEach(element => {
                let temp = {}
                temp.name_english = element.name_english
                temp.name_aramaic = element.name_aramaic
                temp.minRate = element.minRate
                temp.minDuration = element.minDuration
                temp.softLimit = element.softLimit
                temp.hardLimit = element.hardLimit
                temp.category_name_en = element.category_id.name_english
                temp.category_name_ar = element.category_id.name_aramaic
                data.push(temp)
            });
          
            var response = { status: 1, message: 'All Subcategory list', data: data }
            res.send(response);
        }
       
    }).populate('category_id')
});


router.post("/subcategory/multiStatusChange", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Subcategory.updateMany({ _id: { $in: JSON.parse(formData.fields.idArray) } }, { status: parseInt(formData.fields.status) }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            let response = { status: 1, message: ' Status updated succesfully', data: doc }
            res.send(response)
        }
    })
});

router.post("/subcategory/multiDelete", async function (req, res) {
    let formData = await commonHelper.getFormRecords(req)
    Subcategory.updateMany({ _id: { $in: JSON.parse(formData.fields.idArray) } }, { is_show: 0 }).exec((err, doc) => {
        if (err) throw err;
        if (doc) {
            let response = { status: 1, message: ' Deleted succesfully', data: doc }
            res.send(response)
        }
    })
});

module.exports = router