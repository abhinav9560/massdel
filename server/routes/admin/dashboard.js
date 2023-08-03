var express = require('express');
var formidable = require('formidable');
var router = express.Router();

const Users = require('../../db/userSchema')
const Booking = require('../../db/bookingSchema')

const commonHelper = require('../helpers/functions');

router.get("/get", async function (req, res) {
    try {
        let customer = await Users.countDocuments({ is_show: 1, isSignup: 1, role_id: 4 })

        let provider = await Users.countDocuments({ role_id: 3, is_show: 1, isSignup: 1 })

        let booking = await Booking.countDocuments({})


        // let activeBooking = await Booking.countDocuments({ $or: [{ status: { $ne: 6 } }, { status: { $ne: 7 } }] })

        let data = { customer, provider, booking }
        let response = { status: 1, data: data, provider: 'provider' }
        res.send(response)
    }
    catch (err) {
        console.log(err)
    }
});

async function getProvider(RecordsFrom, RecordsTo) {
    return new Promise((resolve, reject) => {
        Users.aggregate([
            {
                $match: {
                    is_show: 1,
                    role_id: 3,
                    isSignup: 1,
                    createdAt: { $gte: new Date(RecordsFrom), $lt: new Date(RecordsTo) }
                }
            },
            {
                $group: {
                    _id: { "$toInt": { $substr: ['$createdAt', 5, 2] } },
                    users: { $sum: 1 }
                },
            },
        ]).exec(async function (error, doc) {
            if (error) throw error
            resolve(doc)
        })
    })
}

async function getCustomer(RecordsFrom, RecordsTo) {
    return new Promise((resolve, reject) => {
        Users.aggregate([
            {
                $match: {
                    is_show: 1,
                    role_id: 4,
                    isSignup: 1,
                    createdAt: { $gte: new Date(RecordsFrom), $lt: new Date(RecordsTo) }
                }
            },
            {
                $group: {
                    _id: { "$toInt": { $substr: ['$createdAt', 5, 2] } },
                    users: { $sum: 1 }
                },
            },
        ]).exec(async function (error, doc) {
            if (error) throw error
            resolve(doc)
        })
    })
}

async function getBooking(RecordsFrom, RecordsTo) {
    return new Promise((resolve, reject) => {
        Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(RecordsFrom), $lt: new Date(RecordsTo) }
                }
            },
            {
                $group: {
                    _id: { "$toInt": { $substr: ['$createdAt', 5, 2] } },
                    users: { $sum: 1 }
                },
            },
        ]).exec(async function (error, doc) {
            if (error) throw error
            resolve(doc)
        })
    })
}

router.post("/getChartData", async function (req, res) {
    try {
        let formData = await commonHelper.getFormRecords(req)
        let choosedYear = parseInt(formData.fields.year)
        if (choosedYear) {
            var currentYear = parseInt(choosedYear);
            var RecordsFrom = '01/01/' + currentYear.toString();
            var RecordsTo = '01/01/' + (currentYear + 1).toString();
        } else {
            var currentYear = new Date().getFullYear();
            var RecordsFrom = '01/01/' + currentYear.toString();
            var RecordsTo = '01/01/' + (currentYear + 1).toString();
        }

        let providerData = await getProvider(RecordsFrom, RecordsTo)
        let customerData = await getCustomer(RecordsFrom, RecordsTo)
        let bookingData = await getBooking(RecordsFrom, RecordsTo)

        providerData = await commonHelper.getChartInfo(providerData)
        customerData = await commonHelper.getChartInfo(customerData)
        bookingData = await commonHelper.getChartInfo(bookingData)

        let data = { providerData, customerData, bookingData }
        let response = { status: 1, data: data }
        res.send(response)
    }
    catch (err) {
        console.log(err)
    }
});

module.exports = router