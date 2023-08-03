var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;

var faq = mongoose.Schema({
  question_english: {
    type: String,
    default: '',
  },
  answer_english: {
    type: String,
    default: '',
  },
  question_aramaic: {
    type: String,
    default: '',
  },
  answer_aramaic: {
    type: String,
    default: '',
  },
  status: {
    type: Number,
    default: 1
  },
  is_show: {
    type: Number,
    default: 1
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

var faq = mongoose.model('faq', faq);
module.exports = faq;
