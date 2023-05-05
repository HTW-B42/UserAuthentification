const express = require('express');
const router = express.Router();

// mongodb user models
const User =require('./../models/User');

// mongodb user verification model
const UserVerification =require('./../models/UserVerification');

// email handler
const nodemailer = require("nodemailer");

// unique String
const {v4: uuidv4} = require("uuid");

// .env variables
require("dotenv").config();

// Password handler
const bcrypt = require('bcrypt');

// nodemailer
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
});

// testing success
transporter.verify((error, success) => {
    if(error){
        console.log(error)
    }else {
        console.log("Ready for messages");
        console.log(success);
    }
});

// Signup
router.post('/signup', (req, res) => {
    let {name, email, password} = req.body;

    //console.log('Request Headers:', req.headers);
    //console.log('Request Body:', req.body);
    //console.log('Name:', name);
    //console.log('Email:', email);
    //console.log('Password:', password);


    name = name.trim();
    email = email.trim();
    password = password.trim();



    if(name == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    }else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        })
    }else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is to short!"
        })
    }else {
        // Checking if user already exists
        User.find({email}).then(result => {
            if (result.length){
                // A user already exists
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists"
                })
            }else {
                // Try to create new user

                // password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result,
                        })
                    })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occured while saving user account!"
                            })
                        })
                })
                    .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing password!"
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })
    }
})

// Signin

router.post('/signin', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied"
        })
    }else {
        // Check if user exist
        User.find({email})
            .then(data => {
                if (data.length) {
                    // User exists

                    const hashedPassword = data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if(result){
                            // Password match
                            res.json({
                                status: "SUCCESS",
                                message: "Signin successful",
                                data: data
                            })
                        }else {
                            res.json({
                                status: "FAILED",
                                message: "Invalid password entered!"
                            })
                        }
                    })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occured while comparing passwords!!"
                            })
                        })
                }else {
                    res.json({
                        status: "FAILED",
                        message: "Invalid credentials entered!"
                    })
                }
            }).catch(err => {
                res.json({
                    status: "FAILED",
                    message: "An error occured while checking for existing user"
                })
        })
    }
})
module.exports = router;