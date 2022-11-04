const https = require('https');
const express = require("express");
const Readable = require('stream').Readable;
const bodyParser = require("body-parser");
const fs = require("fs");
var request = require("request");
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');
var downloadFile = null;
//////////////////////////////////////
var port = 3000;
const app = express();
app.use(bodyParser.urlencoded({extended :true}));
app.use(express.urlencoded({ extended: false }));
app.listen(port,function(){
    console.log("Server Started at port "+ port);
});
let cors = require("cors");
app.use(cors());
//var siteUrl = "https://shahed4u.vip/?s=dying+light";
app.get("/",function(req,res){
    if(downloadFile){
        downloadFile.destroy();

    }
    res.sendFile(__dirname+"/index.html");//sending movie name to search using <form action="/search" method="get"> ->> input name "q"
});

app.get("/search",function(req,res){
    if(downloadFile){
        downloadFile.destroy();

    }
    var mName = req.query.q;//data from http://localhost:3000/ using form
    var qUrl = "https://shahed4u.vip/"; //url used to search for url
    console.log("Domain of website "+ qUrl);
    request({url:qUrl,followRedirect :false}, function (error, response, body) { // getting the current website url
        var rdUrl = response.headers.location;
        console.log("Domain of redirect website "+ rdUrl);
        if(error){
            console.log("Error In URl [Rep] = "+ error);
        }else{
            request(rdUrl+"?s="+mName.replace(" ","+"),function(urlErr,urlRes,urlBody){ //getting html page for the qurey [name of movie]
                if(urlErr){
                    console.log("Error In Current URl [Rep] = "+ urlErr);
                }else{
                    console.log("Finding all results for the search input "+mName)
                    shahed4u_Search_Result(urlBody,rdUrl,mName.replace(/ /g,'+'),function(resBody){
                        console.log("html page is ready now, sending it to client");
                        res.send(resBody);
                    }); //sending html body , current webiste url and name of movie to get every single movie in the all pages
                    //res.send(urlBody);
                }
            });
        }
    });
});
app.get("/resultIndex",function(req,res){
    if(downloadFile){
        downloadFile.destroy();

    }
    res.sendFile(__dirname+"/result.html");
});

function shahed4u_Search_Result(htmlBody,domain,movieName,callBack){
    const $ = cheerio.load(htmlBody);
    var countOfMovies = $(".row.MediaGrid").children().length;//how many movies in the page 1
    console.log("The Count Of Movies "+ countOfMovies);
    if(countOfMovies > 0){ // check if there movie or not
        countOfPages = $(".page-numbers").length;
        if(countOfPages > 0){
            countOfPages =  $(".page-numbers").children().last().prev().text();
        }else{
            countOfPages = 1;
        }
        console.log("The Count Of Pages "+ countOfPages);
        const moviesName = [];
        const moviesUrl = [];
        const moviesType = [];
        var indexMovie = 0;
        for(var i = 1 ; i <= Number(countOfPages) ;i++ ){
            var pageUrl = domain+"/page/"+i+"/?s="+movieName;
            request(pageUrl,function(err,res,body){
                if(err){
                    console.log("Cant Reach "+pageUrl+ " [Rep] = "+err);
                }else{
                    console.log("Found "+ $(".row.MediaGrid").children().length + " result");
                    $(".row.MediaGrid").children().each(function(eleIndex,element){
                        var movieUrl =  $(element).children().children().first().attr("href");
                        var title = $(element).children().children().first().attr("title");
                        if(!movieUrl || !title){
                            console.log("Error getting movieUrl or title");
                        }else{
                            var formatTitle = "";
                            for(var j= 0 ; j<title.length;j++){
                                if(title.charCodeAt(j) >= 0 && title.charCodeAt(j)<=127){
                                    if(formatTitle.length > 0 || title.charCodeAt(j) != 32){
                                        if(formatTitle.length> 0 && (formatTitle.charCodeAt(formatTitle.length-1) != 32 || title.charCodeAt(j) !=32)){
                                            formatTitle = formatTitle + title.charAt(j);
                                        }else if (formatTitle.length == 0 ){
                                            formatTitle = formatTitle + title.charAt(j);
                                        }
                                    }
                                }
                            }
                            var isMovie = $(element).children().children(".episode-block").children().last().text();
                            if(isMovie=="" || isMovie == "1"){
                                var allowToAdd = true;
                                var typeOfMovie = "";
                                if(isMovie == "1"){
                                    formatTitle = formatTitle.substring(0,formatTitle.length-3);
                                    typeOfMovie = "series";
                                    for(var x = 0 ; x < moviesName.length;x++){
                                        var cur = formatTitle.split(" ");
                                        var pre = (moviesName[x]+"").split(" ");
                                        var ind = 0;
                                        while(ind < cur.length && cur[ind] == pre[ind] ){
                                            ind++;
                                        }
                                        if(ind == cur.length){
                                            allowToAdd = false;
                                        }else if(ind < cur.length){
                                            if(!isNaN(cur[ind]) || !isNaN(pre[ind])){
                                                allowToAdd = false;
                                                if(!isNaN(pre[ind])){
                                                    formatTitle = ""
                                                    for(var k = 0 ; k < ind;k++){
                                                        formatTitle = formatTitle + pre[k] + " ";
                                                    }
                                                    moviesName[x] = formatTitle;
                                                }
                                            }
                                        }
                                    }
                                }else{
                                    typeOfMovie = "movie";
                                }
                                if(allowToAdd || indexMovie == 0){
                                    moviesName[indexMovie] = formatTitle;
                                    moviesUrl[indexMovie] = movieUrl;
                                    moviesType[indexMovie] = typeOfMovie;
                                    indexMovie++;
                                }
                            }
                        }
                        //console.log(movieUrl);
                    });
                }
            });
        }
        setTimeout(function(){
            request("http://localhost:3000/resultIndex",function(reqErr,reqRes,reqBody){
                const $local = cheerio.load(reqBody);
                moviesName.forEach(function(v,indx){
                    $local("#loadhere").append('<h1 id="q'+indx+'"><span style="background-color:#e4c6ce;">'+indx+'</span><span style="margin:10px;">'+moviesName[indx]+'</span><span class="url" style="display:none;">'+moviesUrl[indx]+'</span><span class="domain" style="display:none;">'+domain+'</span><span class="type" style="background-color:#e4c6ce;">'+moviesType[indx]+'</span><h1>');
                });
                console.log("sending html page after editing"); //problem
                callBack($local.html());
            });
        },4000);
    }
}

app.get("/search/result",function(req,res){
    if(downloadFile){
        downloadFile.destroy();

    }
    var q = req.query.q;
    var url = req.query.url;
    var type = req.query.type;
    var domain = req.query.domain;
    console.log(url);
    if(type == "series"){
        request((url+""),function(err,resp,body){
            console.log("Checking Type "+ type);
            if((type+"") == "series"){
                console.log("mathcing type series");
                shahed4u_series(body,domain,function(reqBody){
                    console.log("html page is ready now, sending it to client");
                    res.send(reqBody);
                });
            }
        });
    }else{
        console.log("mathcing type movie");
        var options = {
            url:  (url+""),
            timeout: 120000
        }
        request(options,function(err,resp,body){
            const $ = cheerio.load(body);
            url = $(".btns .watch-btn").attr("href");
            //urld = 'https://vidhd.fun/embed-egrpcymbmlvg.html';
            request((url+""),function(err1,resp1,body1){
                const $load = cheerio.load(body1);
                var url = $load(".media-stream input").attr("value");
                request((url+""),function(err1,resp1,body1){
                    const $load = cheerio.load(body1);
                    var x = $load.html().lastIndexOf("kmx");
                    var str = '';
                    while($load.html()[x] != '|'){
                        str = str + $load.html()[x] ;
                        x++;
                    }
                    var str1 = $load($load("#vplayer").children()[0]).attr("src");
                    var index = (str1.match("//").index)+2;
                    var str2 = '';
                    while(str1.charAt(index) != '/'){
                        str2 = str2 + str1.charAt(index) ;
                        index++;
                    }
                    var resUrl = "https://"+str2+"/"+str+"/v.mp4";
                    mp4Url = resUrl;
                    console.log(resUrl);
                    res.redirect("http://192.168.1.14:3000/search/result/redir/watch?url="+mp4Url);
                   // res.sendFile(__dirname + '/video.html');
                });
         });
        });
    }
});

function shahed4u_series(htmlBody,domain,callBack){
    const $ = cheerio.load(htmlBody);
    const seasonUrl = [];
    console.log("Getting Seasones " +$("#seasons .row").children().length);
    request("http://localhost:3000/seasonIndex",function(reqErr,reqRes,reqBody){
        const $local = cheerio.load(reqBody);
        $("#seasons .row").children().each(function(index,ele){
            var urlSeas = $(ele).children().find('.fullClick').attr("href");
            var seasonNum = $(ele).children().first().children().find('em').text();
            console.log($(ele).children().find('.fullClick').attr("href"));
            $local("#loadhere").append('<h1 id="q'+index+'"><span style="background-color:#e4c6ce;">'+index+'</span><span style="margin:10px;"> Seasone '+seasonNum+'</span><span class="url" style="display:none;">'+urlSeas+'</span><span class="domain" style="display:none;">'+domain+'</span><h1>');
        });
        console.log("sending html page after editing");
        callBack($local.html());
    });
}


app.get("/seasonIndex",function(req,res){
    res.sendFile(__dirname+"/season.html");
});


app.get("/search/result/eposide",function(req,res){
    if(downloadFile){
        downloadFile.destroy();

    }
    var q = req.query.q;
    var url = req.query.url;
    var domain = req.query.domain;
    request((url+""),function(err,resp,body){
        shahed4u_eposide(body,domain,function(reqBody){
            console.log("html page is ready now, sending it to client");
            res.send(reqBody);
        });
    });
});

function shahed4u_eposide(htmlBody,domain,callBack){
    const $ = cheerio.load(htmlBody);
    const eposideUrl = [];
    console.log("Getting eposide " +$("#episodes .row").children().length);
    request("http://localhost:3000/eposiedIndex",function(reqErr,reqRes,reqBody){
        const $local = cheerio.load(reqBody);
        $("#episodes .row").children().each(function(index,ele){
            var urlepo = $(ele).find('a').attr("href");
            var epoNum = $(ele).find('em').text();
            if(urlepo){
                $local("#loadhere").append('<h1 id="q'+index+'"><span style="background-color:#e4c6ce;">'+index+'</span><span style="margin:10px;"> eposide '+epoNum+'</span><span class="url" style="display:none;">'+urlepo+'</span><span class="domain" style="display:none;">'+domain+'</span><h1>');
            }
        });
        console.log("sending html page after editing");
        callBack($local.html());
    });
}

app.get("/eposiedIndex",function(req,res){
    res.sendFile(__dirname+"/eposide.html");
});


var mp4Url = "";
app.get("/search/result/redir",function(req,res){
    if(downloadFile){
        downloadFile.destroy();

    }
    var urld = req.query.url;
    console.log(urld);
    var domain = req.query.domain;
    var options = {
        url:  (urld+""),
        timeout: 120000
    }
    request(options,function(err,resp,body){
        const $ = cheerio.load(body);
        urld = $(".btns .watch-btn").attr("href");
        //urld = 'https://vidhd.fun/embed-egrpcymbmlvg.html';
        request((urld+""),function(err1,resp1,body1){
            const $load = cheerio.load(body1);
            var url = $load(".media-stream input").attr("value");
            request((url+""),function(err1,resp1,body1){
                const $load = cheerio.load(body1);
                var x = $load.html().lastIndexOf("kmx");
                var str = '';
                while($load.html()[x] != '|'){
                    str = str + $load.html()[x] ;
                    x++;
                }
                var str1 = $load($load("#vplayer").children()[0]).attr("src");
                var index = (str1.match("//").index)+2;
                var str2 = '';
                while(str1.charAt(index) != '/'){
                    str2 = str2 + str1.charAt(index) ;
                    index++;
                }
                var resUrl = "https://"+str2+"/"+str+"/v.mp4";
                mp4Url = resUrl;
                console.log(resUrl);
                res.redirect("http://192.168.1.14:3000/search/result/redir/watch?url="+mp4Url);
               // res.sendFile(__dirname + '/video.html');
            });
     });
    });
});



app.get("/search/result/redir/watch",function(req,res){
    if(downloadFile){
        downloadFile.destroy();

    }
    var VideoUrl =  req.query.url;
    res.send("<video src='/video?url="+VideoUrl+"' controls>test</video>");
});

var s = new Readable();
s._read = () => {};
app.get("/video",function(req,res){
    var VideoUrl =  req.query.url;
    getRemoteFile("file.mp4",VideoUrl,res);
});


function showProgress(file, cur, len, total,chuu) {
    console.log("Downloading " + file + " - " + (100.0 * cur / len).toFixed(2) 
        + "% (" + (cur / 1048576).toFixed(2) + " MB) of total size: " 
        + total.toFixed(2) + " MB");
    s.push(chuu);
}


function getRemoteFile(file, url,res) {
    if(downloadFile){
        downloadFile.destroy();
    }
    s = new Readable();
    s._read = () => {};
    s.pipe(res);
    const request = https.get((url+""), function(response) {
        console.log("starting");
        var len = parseInt(response.headers['content-length'], 10);
        var cur = 0;
        var total = len / 1048576; //1048576 - bytes in 1 Megabyte
        response.once('data',function(){
            console.log("x");
        });
        response.on('data', function(chunk) {
            cur += chunk.length;
            showProgress(file, cur, len, total,chunk);
        });

        response.on('end', function() {
            s.push(null);
            console.log("Download complete");
        });
        response.on("close",function(){
            //s.push(null);
            console.log("closed");
        });
        s.on("data",function(){
            console.log("sss");
        });
    });
        downloadFile = request;

}

/*
function getRemoteFile(file, url,res,req) {
    let localFile = fs.createWriteStream(file);
        download = true;
        const request = https.get(url, function(response) {
        var len = parseInt(response.headers['content-length'], 10);
        var cur = 0;
        var total = len / 1048576; //1048576 - bytes in 1 Megabyte

        response.on('data', function(chunk) {
            cur += chunk.length;
            showProgress(file, cur, len, total,chunk);
        });

        response.on('end', function() {
            s.push(null);
            console.log("Download complete");
        });
     response.pipe(localFile);
        s.on("data",function(){
            console.log("sss");
        });
        const range = req.headers.range
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10)
        const end = parts[1] ?parseInt(parts[1], 10) :total - 1
        const chunksize = (end - start) + 1;
        });
        if(!senddata){
            s.pipe(res);
            s.on("close",function(){
                senddata = false;
            });
            s.on("end",function(){
                senddata = false;
            });
            senddata = true;
        }

  }
  */
