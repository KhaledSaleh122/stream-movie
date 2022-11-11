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



const https = require("https") // https module to create a ssl enabled server
const path = require("path") // path module 
const fs = require("fs") //file system module


const options ={
    key:fs.readFileSync(path.join(__dirname,'./key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'./cert.pem')) 
}
const sslserver =https.createServer(options,app)

sslserver.listen(3000,()=>{console.log(`Secure Server is listening on port ${3000}`)});

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");//sending movie name to search using <form action="/search" method="get"> ->> input name "q"
});

app.get("/search",async function(req,res){
    var mName = req.query.q;
    console.log("Movie Name : "+mName);
    var qUrl = "https://shahed4u.vip/";
    const qUrl_O = new URL(qUrl);
    console.log("Domain of website "+ qUrl);
    var htmlPage = "";
    var res2 =  await doPostToDoItem();
    console.log(res2)
    res.send(res2);
});



async function doPostToDoItem() {


    const options = {
        hostname: 'shahed4u.vip',
        path: '/',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let p = new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                resolve((responseBody));
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });

    return await p;
}
