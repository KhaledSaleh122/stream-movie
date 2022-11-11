//require packages
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended :true}));
app.use(express.urlencoded({ extended: false }));
//const https = require('https');
const { http, https } = require('follow-redirects');
//
var port = 5000;
app.listen(process.env.PORT,function(){
    console.log("Server Started at port "+ port);
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
    const request = https.request({ host: 'shahed4u.vip', path: '/'}, response => {
        console.log(response.responseUrl);
    });
    request.end();
});