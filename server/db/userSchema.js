var mongoose = require('mongoose');
var ObjectId = require('mongoose').ObjectId;
var userSchema = mongoose.Schema({

  name: {
    type: String,
    default: ''
  },

  email: {
    type: String,
    default: "",
  },

  access: {
    type: [],
    default: []
  },

  category: {
    type: [{ type: ObjectId, ref: 'categories' }],
    default: []
  },

  subCategory: {
    type: [{ type: ObjectId, ref: 'sub_categories' }],
    default: []
  },

  password: String,

  // Full mobile number
  mobile: {
    type: String,
    default: ""
  },
  // country code
  countryCode: {
    type: String,
    default: ""
  },
  // only mobile number
  onlyMobile: {
    type: String,
    default: ""
  },

  wallet: {
    type: Number,
    default: 0
  },
  sex: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  dob: {
    type: String,
    default: ""
  },
  referralSelf: {
    type: String,
    default: '',
    unique: true,
    index: true,
    trim:true,
    sparse:true
  },
  referralUsed: {
    type: String,
    default: '',
  },
  refercodeUsedBy: {
    type: [{ type: ObjectId, ref: 'Users' }],
    default: []
  },
  promocodeUsed: {
    type: [{ type: ObjectId, ref: 'Promocode' }],
    default: []
  },
  city: {
    type: ObjectId,
    ref: 'city'
  },
  language: [

  ],
  qualification: {
    type: ObjectId,
    ref: 'qualification'
  },
  training: {
    type: ObjectId,
    ref: 'training'
  },

  // Provider 
  rating: {
    type: Number,
    default: 0
  },

  noOfRating: {
    type: Number,
    default: 0
  },

  profilePicture: {
    type: String,
    default: ""
  },

  identification: [],
  educationImage: [],
  tradeLicense: [],
  tinCertificate: [],

  // Provider 

  /* 1=> Admin, 2 => sub admin, 3=>provider 4=>customers */
  role_id: {
    type: Number,
    default: 2
  },
  facebookId: {
    type: String,
    default: ""
  },
  googleId: {
    type: String,
    default: ""
  },
  socialLoginType:{
    type: String,
    default: "",
    enum: ['Facebook','Google','']
  },
  otp: {
    type: String,
    default: ""
  },

  otp_status: {
    type: String,
    default: 0
  },

  // refercode: {
  //   type: String,
  //   default: ''
  // },
  // refercodeUsed: {
  //   type: String,
  //   default: ''
  // },


  address: {
    type: String,
    default: ""
  },
  residence: {
    type: String,
    default: ""
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  },

  lat: {
    type: String,
    default: ""
  },
  lng: {
    type: String,
    default: ""
  },

  pushNotiAccess: {
    type: Boolean,
    default: true
  },

  smsAccess: {
    type: Boolean,
    default: true
  },

  verified: {
    type: Number,
    default: 0
  },
  isSignup: {
    type: Number,
    default: 0
  },

  notificationToken: {
    type: String,
    default: ''
  },
  deviceType: {
    type: String,
    default: ''
  },

  /* 1=> account create by admin, 2=>self signup , 3=>facebook signup */
  account_created_by: {
    type: Number,
    default: 1,
  },
  canTakeBooking: {
    type: Boolean,
    default: false
  },
  isWorking: {
    type: Boolean,
    default: false
  },
  status: {
    type: Number,
    default: 1
  },
  /* 0=>yes deleted, 1=>not deleted */
  is_show: {
    type: Number,
    default: 1
  },

}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Users', userSchema);;
