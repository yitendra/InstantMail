const functions = require('firebase-functions');
const express = require('express');
const nodemailer = require('nodemailer');
const bodyparser= require('body-parser')
const fileMiddleware = require('express-multipart-file-parser')
var admin = require("firebase-admin");

var serviceAccount = require("./AccountServices.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://yourmailtoyou.firebaseio.com"
});

const database = admin.database()
const rootRef = database.ref()


const app = express();
app.use(bodyparser.urlencoded({extended:true}))
app.use(fileMiddleware)

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'email',
           pass: 'password'
       }
   });


app.get('/', (req, res) => {
    res.render('index.ejs')
});

function mailsender(mailOptions,res){
    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
          var msg=("Something Went Wrong!\n" + err)
          res.render('index.ejs',{msg:msg})
        }
        else
          var msg=("Email Sent!")
          res.render('index.ejs',{msg:msg})
     });
}

app.post('/send',(req,res)=>{
    var email=req.body.formEmail;
    var subject=req.body.formSubject;
    var body=req.body.formBody;
    var file=req.files[0];

    if(file.originalname!=""){
    const mailOptions = {
        from: 'yourmail2you@gmail.com', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: body,// plain text body
        attachments: [
            {   // utf-8 string as an attachment
              filename: file.originalname,
              content: file.buffer
            }]
      };
    mailsender(mailOptions,res)
    }
    else{
        const mailOptions = {
            from: 'yourmail2you@gmail.com', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: body
          };
        mailsender(mailOptions,res)  
    }


})

// app.get('/test',(req,res)=>{
    
//     rootRef.once("value")
//   .then(function(snapshot) {
//     var count= snapshot.child("count").val(); // "last"
//     res.send(count)
//     console.log('////////////////////////////////////')
//     console.log(count)
//   });
// })

app.get("/ysecretfile",(req,res)=>{
    res.render('FileUploadingToFirebase.ejs')
    });


app.get('*',(req,res)=>{
    res.send("404 Not Found!")
})
exports.app = functions.https.onRequest(app);
  