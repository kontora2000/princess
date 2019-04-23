const path=require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require ('socket.io')(http);


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
    res.render ('test');
    res.end();
});

app.get('/test',function(req,res){
    res.render ('test');
    res.end();
});

var connectedUserCount=0;
app.get('/admin-chat',(req,res)=>{res.sendFile(__dirname+'/views/frontend/chat-admin.html');});
app.get('/chat',(req,res)=>{res.sendFile(__dirname+'/views/frontend/chat.html');});

io.on('connection',(socket)=> {
	connectedUserCount++;
	socket.on('message', (msg)=>{
		if (msg.userID===777)
			msg.class='user';
		else 
			msg.class='princess-furniture';
		io.emit('message',msg)})
})

io.on('disconnection',(socket)=>{
	connectedUserCount--;
})

http.listen(80);
