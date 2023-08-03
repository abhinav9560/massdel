const express = require('express');
const path = require('path');
const body_parser = require('body-parser');
const fs = require('fs');
var app = express();
const jwt = require('jsonwebtoken');



/** Local Work Start **/
var https = app;
/** Local Work End **/

/** Live Work Start **/
// const httpsOn = require('https');
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/massdl.devtechnosys.tech/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/massdl.devtechnosys.tech/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/massdl.devtechnosys.tech/chain.pem', 'utf8');
// const credentials = {
//     key: privateKey,
//     cert: certificate,
//     ca: ca
// };
// var https = httpsOn.createServer(credentials, app);
/** Live Work Start **/

const cors = require('cors')
app.use(cors())

require('dotenv').config()

const niv = require('node-input-validator');
const mongoose = require('mongoose');

niv.extend('unique', async ({ value, args }) => {
  // default field is email in this example
  const field = args[1] || 'email';
  let condition = {};

  condition[field] = value;

  // add ignore condition
  if (args[2]) {
    condition['_id'] = { $ne: mongoose.Types.ObjectId(args[2]) };
  }
  let emailExist = await mongoose.model(args[0]).findOne(condition).select(field);
  // email already exists
  if (emailExist) {
    return false;
  }
  return true;
});

mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true);

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  // res.setHeader("Access-Control-Allow-Origin", "*");
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  // res.setHeader("Access-Control-Allow-Methods", "*");
  // res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Expose-Headers", "*");
  next();
});

app.use("", express.static(path.join(__dirname, 'dist')));
app.get('/', function (req, res) {
  // var data = { "string": "Hello World!!" }
  // res.send(data);
  res.sendFile((path.join(__dirname, 'dist/index.html')))
});


const adminRoutes = require('./server/routes/admin/admin')
const serviceproviderRoutes = require('./server/routes/admin/serviceprovider')
const categoryRoutes = require('./server/routes/admin/category')
const customerAdminRoutes = require('./server/routes/admin/customer')
const faqRoutes = require('./server/routes/admin/faq')
const emailRoutes = require('./server/routes/admin/email')
const cmsRoutes = require('./server/routes/admin/cms')
const bookingRoutes = require('./server/routes/admin/booking')
const walletRoutes = require('./server/routes/admin/wallet')
const chatRoutes = require('./server/routes/admin/chat')
const dashboardRoutes = require('./server/routes/admin/dashboard')
const cityRoutes = require('./server/routes/admin/city')
const qualificationRoutes = require('./server/routes/admin/qualification')
const languageRoutes = require('./server/routes/admin/language')
const trainingRoutes = require('./server/routes/admin/training')
const promocodeRoutes = require('./server/routes/admin/promocode')

const customerRoutes = require('./server/routes/app/customer')
const providerRoutes = require('./server/routes/app/provider')

const CronRoutes = require('./server/routes/helpers/cron')

app.use('/panel/admin', adminRoutes)

app.use('/app/customer', customerRoutes)
app.use('/app/provider', providerRoutes)


// Auth middleware
async function auth(req, res, next) {
  if (req.headers['authentication']) {
    let token = req.headers['authentication']
    token = token.replace('Bearer ', '');
    jwt.verify(token, process.env.privateKey, function (err, decoded) {
      if (err) {
        res.status(401).json({
          status: 0,
          message: 'Unauthorized'
        })
      }
      if (decoded) {
        req.doc = decoded._id
        jwt.sign({ _id: decoded._id }, process.env.privateKey, { expiresIn: '40m' }, function (err, token) {
          if (err) console.log(err)
          res.setHeader('token', token);
          next()
        });
      }
    });
  }
  else {
    res.status(401).json({
      status: 0,
      message: 'Unauthorized'
    })
  }
}
app.use(auth)


app.use('/panel/serviceprovider', serviceproviderRoutes)
app.use('/panel/category', categoryRoutes)
app.use('/panel/customer', customerAdminRoutes)
app.use('/panel/faq', faqRoutes)
app.use('/panel/email', emailRoutes)
app.use('/panel/cms', cmsRoutes)
app.use('/panel/booking', bookingRoutes)
app.use('/panel/wallet', walletRoutes)
app.use('/panel/chat', chatRoutes)
app.use('/panel/dashboard', dashboardRoutes)
app.use('/panel/city', cityRoutes)
app.use('/panel/qualification', qualificationRoutes)
app.use('/panel/language', languageRoutes)
app.use('/panel/training', trainingRoutes)
app.use('/panel/promocode', promocodeRoutes)

/** 404 Work Start **/
var dir = path.join(__dirname, 'public');

var mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};

app.all('*', function (req, res) {

  var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
  if (file.indexOf(dir + path.sep) !== 0) {
    return res.status(403).end('Forbidden');
  }
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
  // var jsonData = { status: 404, message: "Page Not Found", response: [] };
  // res.send(jsonData);
});
/** 404 Work Start **/

const server = https.listen(process.env.PORT, function () {
  console.log("App listening: http://localhost:" + process.env.PORT);
})

var io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
global.io = io

global.socketList = {}




io.on('connection', (socket) => {
  // console.log("Socket connection ho gya")
  // console.log(Object.keys(socketList).length)
  // console.log("socketList",socketList)
  // console.log(socket.id)
  // console.log(socket.handshake.query.auth)
  socketList[socket.handshake.query.auth] = socket

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on('disconnect', () => {
    // console.log("Socket disconnect ho gya")
    // Here we will delete form object
    delete socketList[socket.handshake.query.auth]
  });
});

