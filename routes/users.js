const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const validator = require("validator");

//User model
const User = require('../models/User'); 
//Login Page
router.get('/login',(req,res) => res.render('login'));

//Register Page
router.get('/register',(req,res) => res.render('register'));

//Register Handle
router.post('/register',(req,res) =>{
    // console.log(req.body);
    const {name,email,password,password2} = req.body;
    // res.send('hello');
    let errors = [];

    //Check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg:'Please fill in all fields'});
    }

    //Check passwords match
    if(password !== password2){
        errors.push({msg:'Passwords do not match'});
    }

    //Check pass length
    if(password.length < 6){
        errors.push({msg:'Password should be at least 6 characters'});
    }

    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        // Validation passed
        User.findOne({email : email})
           .then(user => {
            if(user){
                //User Already Exists
                errors.push({msg: 'Email is already registered'});
                res.render('register',{
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }
            else{
                //Create new User
                const ans = validator.isEmail(email);
                if(!ans){
                    req.flash('error_msg','Enter a Valid Email');
                    res.redirect('register');
                }
                else{
                    const newUser = new User({
                        name:name,
                        email: email,
                        password: password
                    });
                    // console.log(newUser);
                    // res.send('hello');
                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newUser.password,salt,(err,hash) =>{
                            if(err) throw err;
                            //Set password to hashed
                            newUser.password = hash;
                            //Save user
                            newUser.save()
                            .then(user =>{
                                req.flash('success_msg','You are now registered and can log in');
                                res.redirect('login');
                            })
                            .catch(err => console.log(err));
                        })
                    })
                }
            }
           });
    }
})

//Login Handle
router.post('/login',(req,res,next) => {
    passport.authenticate('local',{
        successRedirect : '/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
});

//Logout Handle
router.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(err) return err;
        req.flash('success_msg','You are logged out');
        res.redirect('/users/login');
    });
})
module.exports = router;