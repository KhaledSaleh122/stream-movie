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
const { Console } = require("console");
//const { http, https } = require('follow-redirects');
////////////////////////////////////
app.use(express.static(__dirname));


const https = require("https") // https module to create a ssl enabled server
const path = require("path") // path module 
const fs = require("fs"); //file system module
const { http } = require("follow-redirects");
const { Http2ServerRequest } = require("http2");


const options ={
    key:fs.readFileSync(path.join(__dirname,'./key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'./cert.pem')) 
}
app.listen((process.env.PORT || 3000),()=>{
    console.log("started"+ (process.env.PORT || 3000))
})
app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");//sending movie name to search using <form action="/search" method="get"> ->> input name "q"
});

app.get("/search",async function(req,res){
    var mName = req.query.q;
    console.log("Movie Name : "+mName);
    var qUrl = "https://shahed4u.vip/";
    //var qUrl = "https://www.youtube.com/";
    const qUrl_O = new URL(qUrl);
    console.log("Domain of website "+ qUrl);
    var htmlPage = "";
    https.get(qUrl,function(respon){
        console.log(respon)
        respon.on("data",(data)=>{
            htmlPage = htmlPage+data;
        })
        respon.on("end",()=>{
            res.send(htmlPage);
        })
    })
});


