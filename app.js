const path=require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const io = require ('socket.io');


const app = express();



app.set('view engine','ejs');

app.set('views', path.join(__dirname, '/views'));

app.use('/_js',express.static(__dirname+"/_js"));

app.use('/_js/build',express.static(__dirname+"/_js/build"));

app.use('/projects',express.static(__dirname+"/views/projects/"));

app.use('/_css',express.static(__dirname+"/_css"));

app.use('/_img',express.static(__dirname+"/_img"));

app.use('/_fonts',express.static(__dirname+"/_fonts"));

app.use('/_img/icons',express.static(__dirname+"/_img/icons"));


app.get('/',function(req,res){

    res.render ('princess');
    res.end();

});

app.get('/test',function(req,res){

    res.render ('test');
    res.end();

});

app.get('/chat',(req,res)=>res.render('frontend/chat')



app.listen(3001);
