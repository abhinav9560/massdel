var express = require('express');
var formidable = require('formidable');
var router = express.Router();

var Global = require('../../db/globalsetting');
var Message = require('../../db/message');
var Conversation = require('../../db/conversation');
var Users = require('../../db/userSchema');
var Customer = require('../../db/userSchema');

const commonHelper = require('../helpers/functions');
const pushNotifcation = require('../helpers/pushNotifcation');
const pushNotificationProvider = require('../helpers/pushNotificationProvider');


router.get('/getConversation', async (req, res) => {
    let Admin = await Users.findOne({ role_id: 1 })
    Conversation.find({ 'user.userId': Admin._id })
        .populate('user.userId', 'name').exec(async (err, doc) => {
            if (err) console.log(err)
            if (doc) {

                await doc.forEach(async (ele) => {
                    doc.message = await Message.find({ conversationId: ele._id, isRead: false })
                })

                response = { "status": 1, "message": "Message", data: doc }
                res.send(response)
            }
        })
})


router.get('/getMessage/:id', async (req, res) => {
    let Admin = await Users.findOne({ role_id: 1 })
    Message.find({ conversationId: req.params.id })
        .populate('senderId', 'name').exec(async (err, doc) => {
            if (err) console.log(err)
            if (doc) {
                let chatUrl = process.env.url + "/public/uploads/images/chat_image/";
                response = { "status": 1, "message": "Message", data: doc, adminId: Admin._id, chatUrl }

                let update = await Message.updateMany({ conversationId: req.params.id }, { isRead: true })

                res.send(response)
            }
        })
})

router.post('/sendMessage', async (req, res) => {
    let formData = await commonHelper.getFormRecords(req)
    let admin = await Users.findOne({ role_id: 1 })
    var ImageType = formData.files.message && formData.files.message.type;
    let image = null
    if (ImageType == 'image/jpeg' || ImageType == 'image/jpg' || ImageType == 'image/png') {
        let temp = {}
        temp.image = formData.files.message
        var uploadedImage = await commonHelper.uploadImages(temp, 'chat_image');
        if (uploadedImage.status == 1) {
            image = uploadedImage.imageAr[0]
        }
    }

    console.log(formData.fields.recieverId, 'reciever id')

    let user = await Users.findOne({ _id: formData.fields.recieverId })



    Conversation.findOne(
        { 'user.userId': { $all: [formData.fields.recieverId, admin._id] } }
        , (err, group) => {
            if (err) {
                console.log(err)
            }
            if (group) {
                const message = new Message();
                message.message = Number(formData.fields.type) ? image : formData.fields.message
                message.type = Number(formData.fields.type)
                message.senderId = admin._id
                message.recieverId = formData.fields.recieverId
                message.conversationId = group._id
                message.save(async (err, msg) => {
                    if (err) { console.error(err) }
                    if (msg) {
                        res.json({
                            success: 1,
                            message: 'message Inserted',
                            data: msg
                        })
                        if (socketList[formData.fields.recieverId]) {
                            io.to(socketList[formData.fields.recieverId].id).emit('chatReload', {})
                        }

                        if (user.role_id == 3) {
                            console.log('Priovder')
                            await pushNotificationProvider.sendPushNotificationProvider(formData.fields.recieverId, 'You have a new message', 'chat', formData.fields.recieverId)

                        } else {
                            console.log('Customer')
                            await pushNotifcation.sendPushNotificationCustomer(formData.fields.recieverId, 'You have a new message', 'chat', formData.fields.recieverId)

                        }

                    }
                })
            }
            else {
                const newGroup = new Conversation();
                let array = [{ userId: formData.fields.senderId }, { userId: admin._id }]
                newGroup.user = array
                newGroup.save((err, doc) => {
                    if (err) { console.error(err) }
                    if (doc) {
                        const message = new Message();
                        message.message = formData.fields.message
                        message.type = Number(formData.fields.type)
                        message.senderId = admin._id
                        message.recieverId = formData.fields.recieverId
                        message.conversationId = doc._id
                        message.save(async (err, msg) => {
                            if (err) { console.error(err) }
                            if (msg) {
                                res.json({
                                    success: 1,
                                    message: 'message Inserted',
                                    data: msg
                                })
                                if (socketList[formData.fields.recieverId]) {
                                    io.to(socketList[formData.fields.recieverId].id).emit('chatReload', {})
                                }

                                if (user.role_id == 3) {
                                    console.log('Priovder')
                                    await pushNotificationProvider.sendPushNotificationProvider(formData.fields.recieverId, 'You have a new message', 'chat', formData.fields.recieverId)
                                } else {
                                    console.log('Customer')
                                    await pushNotifcation.sendPushNotificationCustomer(formData.fields.recieverId, 'You have a new message', 'chat', formData.fields.recieverId)

                                }


                            }
                        })
                    }
                })
            }
        })
})


module.exports = router