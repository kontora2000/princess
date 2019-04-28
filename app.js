//init
const path=require('path');
const fs = require('fs');
const rimraf=require('rimraf');
const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require ('socket.io')(http);
const SocketIOFile = require('socket.io-file');

const mongoose  = require('mongoose');

const uri='mongodb+srv://princess-admin:4434070a@cluster0-uemqs.mongodb.net/test?retryWrites=true';
const messageModel =  require('./models/message.model');
const commentModel =  require('./models/comment.model');



//uses
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/_js',express.static(__dirname+"/_js"));
app.use('/_js/build',express.static(__dirname+"/_js/build"));
app.use('/projects',express.static(__dirname+"/projects/"));
app.use('/comments/',express.static(__dirname+"/comments/"));

app.use('/_css',express.static(__dirname+"/_css"));
app.use('/_img',express.static(__dirname+"/_img"));
app.use('/_fonts',express.static(__dirname+"/_fonts"));
app.use('/_img/icons',express.static(__dirname+"/_img/icons"));



//
//pages
app.get('/',function(req,res){
	res.render ('princess');
});


var lastDir='';
var projects = {
	projects:[],
	files:[],
	getProjects: function(dir=__dirname+'/projects/',filter){
		if (dir.slice(-1)!=='/')
			dir+='/';
		if (fs.statSync(dir).isDirectory()) {
			lastDir=dir;
			var files = fs.readdirSync(dir);
			if (files.length==0)
			{
				if (dir.search(filter)<0) 
					return ;
				let split = dir.split('/');
				if (split.length<5) return ;
				let projectName = split[split.length-2];
				this.projects.push({name:projectName,files:[],dir:dir})
				return ;
			}
			files.forEach(file => {
				if (fs.statSync(dir+file).isDirectory()) {
					lastDir=dir;
					this.getProjects(dir+file,filter);
				}
				else {
					if (dir.includes(filter)==false)
					{
						return ;
					}
					let split =lastDir.split('/');
					var projectName=split[split.length-2];
					var src='../projects/'+filter+'/'+projectName+'/'+file;
					this.files.push(src);
					for (let i =0;i<this.projects.length;i++)
					{
						if (projectName==this.projects[i].name) {
							this.projects[i].files.push(src);
							this.files=[];
							return;
						}
					}
					this.projects.push({'name':projectName, 'files':this.files,'dir':lastDir});
					this.files=[];
					return ;
				}
			});
		}
		else 
		{
			console.log('not dir!');
			return ;
		}
	},
	filter:function(filter){
		var filtered = [];
		for (i=0;i<this.files.length;i++)
		{
			if (this.files[i].search('/'+filter.toString()+'/')>0) {   
				var filename = this.files[i];
				filtered.push(filename);
			}
		}
		return filtered;
	}    
}


var connectedUserCount=0;


app.get('/chat',(req,res)=>{
	res.sendFile(__dirname+'/views/chat.html');
});



app.get('project/:id', function(req,res)
{
	if (req.xhr) {
		;
	}
});

app.get('/authroize/:token', (req,res) =>{
	res.sendFile(__dirname+'/views/admin/auth.html');	
});

app.get('/admin/chat',(req,res)=>{
	res.sendFile(__dirname+'/views/admin/chat-admin.html');
});

app.get('/admin/projects',(req,res)=>{
	res.sendFile(__dirname+'/views/admin/projects.html');
});

app.get('/admin/comments',(req,res)=>{
	res.sendFile(__dirname+'/views/admin/comments.html');
});
//sockets
io.on('connection',(socket)=> {
	
	//projects file upload
	/////
	/////
	var uploadCat = 'Kitchens;'
	var uploadProjectName='';
	var count=0;
	projects.getProjects(__dirname+'/projects/','Kitchens/');
	var uploads={};

	for (let i=0;i<projects.projects.length;i++)
	{
		uploads[projects.projects[i].name] = projects.projects[i].dir;
	}
	var uploader = new SocketIOFile(socket, {
		uploadDir:__dirname+'/projects',							// simple directory
		accepts: ['image/png', 'image/jpeg'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
		// maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit)
		chunkSize: 10240,							// default is 10240(1KB)
		transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
		overwrite: false, 							// overwrite file if exists, default is true.
		rename: function(filename) {
			var split = filename.split('.');	// split filename by .(extension)
			var fname = split[0];	// filename without extension
			var ext = split[1];
			var name="";
			if (uploadProjectName!=='')
				name =`/${uploadCat}/${uploadProjectName}/${fname}_${count++}.${ext}`;
			else 
				name =  `/${uploadCat}/${fname}.${ext}`;
			console.log(name);
			return (name);
		}
		
	});
	uploader.on('ready', ()=>{
		if (uploadProjectName==='empty')
			;
	})

	uploader.on('start', (fileInfo) => {
		// console.log('Start uploading');
		console.log(fileInfo);
	});
	uploader.on('stream', (fileInfo) => {
		// console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
	});
	uploader.on('complete', (fileInfo) => {
		// console.log('Upload Complete.');
		// console.log(fileInfo);
		// socket.emit('projectsready', projects.projects);
	});
	uploader.on('error', (err) => {
		// console.log('Error!', err);
	});
	uploader.on('abort', (fileInfo) => {
		// console.log('Aborted: ', fileInfo);
	});

	//projects file get
	socket.on('getprojects', (where)=>{
		projects.projects=[];
		if (where=='undefined' || where==null) {
			console.log('category is undefined or null')
			return ;
		}
		if (where.category!=='all' && where.category!==null && where!=='undefined'){
			projects.getProjects(__dirname+'/projects/',where.category);
			uploadCat=__dirname+'/projects/'+where.category;
			uploadProjectName= where.project;
		}
		else {
			projects.getProjects(__dirname+'/projects/');
		}
		socket.emit('projectsready', projects.projects);
	}) 

	socket.on('selectProject', (project)=> {
		uploadCat = project.category;
		uploadProjectName=project.project;
	})

	socket.on('createProject', (project)=>{
		var dir = __dirname+'/projects/'+project.category+'/'+project.name;
		if (!fs.existsSync(dir))
			fs.mkdirSync(dir);
		projects.projects.push({name:project.name, files:[], dir:__dirname+'/projects/'+project.category+'/'+project.name});
		uploadCat = project.category;
		uploadProjectName=project.name;
		console.log(uploadProjectName);
	})

	socket.on('deleteProject',(project)=>{
		var dir= __dirname+'/projects/'+project.category+'/'+project.name;
		var files = fs.readdirSync(dir);
		files.forEach(file => {
			fs.unlink(dir+'/'+file, (err)=>{console.log(err)});
		});
		fs.rmdir(dir, (err)=>{console.log(err)});
    	//projects.getProjects(__dirname+'/projects/',project.category);
  //   	if (projects.projects.length!==0) {
		//   uploadProjectName=projects.projects[0].name;
		//   uploadCat = projects.getProjects(project.category);
		// }
		 // socket.emit('projectsready',projects.projects);
		}) 

	socket.on('deleteImage',(img)=>{
		img=img.slice(2);
		fs.unlink(__dirname+img, (err)=>{
			
		});
	})
	////////////
	///////////
	////////////

	mongoose.connect(uri);
	///////////////////
	/////comments//////
	//////////////////
	socket.on('getComments',()=>{
		console.log('hey');
		uploadProjectName='';
		uploadCat='../comments/avatars';
		commentModel.find({}).
		lean().
		exec((err,comments)=>{
			if (!err)
				socket.emit('commentsReady',comments);	
		})
	})

	socket.on('updateComment',()=>{

	})

	socket.on('createComment',(comment)=>{
		commentModel.create(comment,err=>{
			//тут обработка ошибки будет
			socket.emit('commentCreated',comment);
		})		
	})

	socket.on('deleteComment',(comment)=>{
		commentModel.deleteOne({author:comment.author}, (err)=>{
			//тут обработка ошибки будет
			//тут можно улучшить код, отправляя индекс удаленного элемента
			socket.emit('commentDeleted',comment);
		});
	})

	socket.on('updateComment',(comment)=>{
		commentModel.updateOne({author:comment.author},comment, (err,res)=>{
			//тут обработка ошибки будет
			//тут можно улучшить код, отправляя только индекс обновленного элемента
			socket.emit('commentUpdated',comment);
		})
	})
	///////////////////
	/////chat//////////
	//////////////////
	
	connectedUserCount++;

	socket.on('message', (msg)=>{
		messageModel.create(msg, err => {
			if (err) {
				console.log('error');
			}
			else {
				if (msg.user===777)
					msg.class='user';
				else 
					msg.class='princess-furniture';
				io.emit('message',msg);
			}
		})
	});

	socket.on('history', (id)=>{
		messageModel.find({$or:[{owner:id},{recipient:id}]}).
		sort({date:1}).
		lean().
		exec((err,messages)=>{
			for (let i=0;i<messages.length;i++)
				if (messages[i].owner==777)
					messages[i].class='princess-furniture';
				else 
					messages[i].class='user';
				messages.to=id;
				io.emit('history', messages)
			});
	});

	socket.on('adminhistory', ()=>{
		var dialogs=[]; 
		var isFound=false;
		messageModel.find({}).
		sort({date:1}).
		lean().
		exec((err,messages)=>{
			for (let i=0;i<messages.length;i++) {
				if (messages.owner==777)
					messages[i].class='user';
				else 
					messages[i].class='princess-furniture';
				if (dialogs.length!==0) {	
					for (let k=0;k<dialogs.length;k++) {
						if (dialogs[k].user==messages[i].owner || dialogs[k].user==messages[i].recipient) {
							dialogs[k].messages.push(messages[i]);
							isFound=true;
							break;
						}
					}
				}
				else {
					let user=(messages[i].owner.toString()=='777')?messages[i].recipient:messages[i].owner;
					dialogs.push({'user':user,'messages':[messages[i]]});
					
					continue;
				}
				if (isFound!=true)
				{
					let user=(messages[i].owner.toString()=='777')?messages[i].recipient:messages[i].owner;
					dialogs.push({'user':user,'messages':[messages[i]]});

					isFound=false;
				}
				} //for messages
				io.emit('adminhistoryget',dialogs);	
			});
	});

})

//end -chat

//projects

//end projects
io.on('disconnection',(socket)=>{
	connectedUserCount--;
})

http.listen(80);
