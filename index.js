//require packages/////////////////////////
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended :true}));
app.use(express.urlencoded({ extended: false }));
const CloudflareBypasser = require('cloudflare-bypasser');
const cloudscraper = require('cloudscraper-version.two');
const captcha = require('2captcha');
let cf = new CloudflareBypasser();
const https = require('https');
//const { http, https } = require('follow-redirects');
////////////////////////////////////
var port = 3000;
app.listen(process.env.PORT || port,function(){
    console.log("Server Started at port "+ (process.env.PORT||port));
});

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");//sending movie name to search using <form action="/search" method="get"> ->> input name "q"
});

app.get("/search",function(req,res){
    var mName = req.query.q;
    console.log("Movie Name : "+mName);
    var qUrl = "https://shahed4u.vip/";
    const qUrl_O = new URL(qUrl);
    console.log("Domain of website "+ qUrl);
    var htmlPage = "";
    https.get(qUrl,function(res){
        console.log(res);
        console.log(res.rawHeaders[9]);
    })
    /*
    const request = https.request({ host: 'shahed4u.vip', path: '/'}, response => {
        response.on("data",(data)=>{
            htmlPage = htmlPage+ data;
        })
        response.on("end",()=>{
            console.log(response.responseUrl);
            res.send(htmlPage)
        })
    });
    request.end();
    */
});