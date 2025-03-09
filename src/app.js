require("dotenv").config();
const express = require('express');



const userModel = require("./models/user.model");
const notesModel = require("./models/notes.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const expressSession = require("express-session");

const passport = require("../passportConfig")

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

     app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
      );

     app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        (req, res) => {
            const token = jwt.sign({
                id: req.user._id
            },"secret");
            res.cookie("token",token);
          res.redirect('/profile/'+req.user.username);
        }
      );
    



app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/about",(req,res)=>{
    res.render("about");
});

app.get("/register",(req,res)=>{
    res.cookie("token", "");
    res.render("register",{ error_key:req.flash("msg")});
})
app.post("/register",async (req,res)=>{
    const {username,email,password} = req.body;
    const existingUser = await userModel.findOne({email: email});
    if(existingUser)
    {
        req.flash("msg","User already registered");
        res.redirect("/register");
    }
    else{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword= await bcrypt.hash(password,salt);
    const newUser = await userModel.create({
        username: username,
        email:email,
        password:hashedPassword,
        authType:"local",
    })
    await newUser.save();
    const token = jwt.sign({
        id: newUser._id
    },"secret");

    res.cookie("token",token);
    res.redirect("/profile/"+username);
    // res.redirect("/profile/");
}
});


const authenticateUser = (req,res,next) => {
    const token = req.cookies.token;
    if(!token)
    {
        res.redirect("/login");
    }
    else{
        const decoded = jwt.verify(token,"secret");
        if(!decoded)
        {
            res.redirect("/login");
        }
        else{
            req.user = decoded;
            next();
        }    
    }
}


app.get("/login", (req, res) => {
    res.cookie("token","")
    res.render("login",
        {
            error_key:req.flash("msg")
        });
});
app.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    const existingUser = await userModel.findOne({email: email});
    if(!existingUser)
    {
        req.flash("msg","Invalid email or password");
        res.redirect("/login");
    }
    else{
        const validPassword =await bcrypt.compare(password, existingUser.password);
        if(!validPassword)
        {
            req.flash("msg","Invalid email or password");
            res.redirect("/login");
        }
        else{
            const token = jwt.sign({
                id: existingUser._id
            },"secret");
            res.cookie("token",token);
            res.redirect("/profile/" +existingUser.username);
        }
    }
});

app.get("/logout",(req,res)=>{
    res.cookie("token","");
    res.redirect("/");
})


app.get("/profile/:username",authenticateUser,async(req,res)=>{
    // console.log(req.user);
    const existingUser = await userModel.findOne({_id:req.user.id});
    if(!existingUser)
        res.redirect("/login")
    const username = existingUser.username;
    const notes= await notesModel.find({userId:req.user.id});
    res.render("profile",{username,notes});
    // res.send("profile of " + req.params.username);
});


app.get("/addNote",authenticateUser,async(req, res) => {
    const user = await userModel.findOne({_id:req.user.id});
    const username = user.username
    res.render("addNote",{username});
})

app.post("/addNote",authenticateUser, async (req, res) => {
    const {title,content}= req.body;
    const user = await userModel.findOne({_id:req.user.id});
   // console.log(user);
    const userid= req.user.id;
    const newNote = await notesModel.create({
        title: title,
        content: content,
        userId: userid
    }) 
    await newNote.save();
    res.redirect("./profile/"+user.username);
});

app.get("/deleteNote/:noteId",authenticateUser, async (req, res) => {
    await notesModel.findOneAndDelete({_id: req.params.noteId});
    const user = await userModel.findOne({_id: req.user.id});
    //console.log(user);
    res.redirect("/profile/"+user.username);
});


app.get("/editNote/:noteId", authenticateUser,async(req, res) =>{
    const noteId = req.params.noteId;
    const notes = await notesModel.findOne({_id: noteId});
    const user = await userModel.findOne({_id:req.user.id});
    res.render('editNote', {notes,user});
})

app.post("/editNote/:noteId", authenticateUser,async(req, res) =>{
    const {title,content} = req.body;
    await notesModel.findOneAndUpdate({_id:req.params.noteId},{title:title,content:content},{new:true});
    const user = await userModel.findOne({_id: req.user.id});
    res.redirect("/profile/"+user.username);
})

app.get("/showNote/:noteId",authenticateUser,async(req,res) => {
    const user = await userModel.findOne({_id: req.user.id});
    const notes  = await notesModel.findOne({_id: req.params.noteId});
    res.render("showNote",{user,notes});
});

module.exports = app;