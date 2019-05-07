var mongoose = require("mongoose");
var passport = require("passport");
var userModel = require("./models/user.model");

var userController = {};

userController.login = function(req, res) {
  	if (req.session.user!==true)
        res.sendFile(__dirname+'/views/admin/auth.html');
    else
      res.redirect('/admin/projects');
};

userController.chat = function(req,res){
  if (req.session.user)
          res.sendFile(__dirname+'/views/admin/chat-admin.html');
	else res.status(404)       
          .sendFile(__dirname+'/views/404.html');
	
}

userController.projects = function(req,res){
	 if (req.session.user)
          res.sendFile(__dirname+'/views/admin/projects.html');
  else res.status(404)       
          .sendFile(__dirname+'/views/404.html');
	
}

userController.comments = function(req,res){
	 if (req.session.user)
          res.sendFile(__dirname+'/views/admin/comments.html');
  else res.status(404)       
          .sendFile(__dirname+'/views/404.html');
}

userController.doLogin = function(req, res) {
  passport.authenticate('local')(req, res, function () {
    req.session.user=true;
    res.redirect('/admin/projects');
  });
};

userController.logout = function(req, res) {
  req.logout();
  req.session.user=false;
  res.redirect('/admin');

};


module.exports = userController;