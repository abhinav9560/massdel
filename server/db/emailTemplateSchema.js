var mongoose = require('mongoose');
var emailTempSchema = mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  slug: {
    type: String,
    default: ""
  },
  subject: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },

  /* status 0=>means inactive, 1=>means Active */
  status: {
    type: Number,
    default: 1
  },

  /* is show 0=>means deleted, 1=>means not deleted */
  is_show: {
    type: Number,
    default: 1
  },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

var emailTemplate = mongoose.model('emailTemplate',emailTempSchema);
module.exports = emailTemplate;
