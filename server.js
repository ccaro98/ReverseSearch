// Framework
const express = require("express");
const app = express();

// Dotenv
require('dotenv').config()

// Database
const db = require('./database.js')

// Handlebars | Template Engine
const exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs()); 
app.set('view engine', 'handlebars'); 

// Static Directory
app.use(express.static('public'))

// Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// FileUpload
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// Sessions
const session = require("express-session");

// Cookie Parser

// Middleware

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/search', (req, res) => {
    res.render('home')
})

app.get('/result', (req, res) => {
    res.render('result')
})

app.post('/search', (req, res) => {
    if(!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded');
    }
    let sampleFile = req.files.file;
    console.log(sampleFile)
    sampleFile.mv(`public/uploads/${sampleFile.name}`, (err) => {
        if (err) {
            return res.status(500).send(err)
        }
    })

    //ejemplo
    // let reverseAPIdata = reverseAPIcall(sampleFile);

    // res.render('result', {
    //     data: reverseAPIdata,
    // })
    res.render('result')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {

    let errors = {
        messages : [],
        username: '',
        email: ''
    };

    
    if (req.body.username == '') {

        errors.messages.push('You must enter a username')
    } else {

        errors.fName = req.body.username;
    }

    

     // Email Regex anyword+@+anyword+.+alphanumeric
     if (req.body.email == '') {

        errors.messages.push(`Email required`)
    } else {
        if (!req.body.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){

            errors.messages.push(`Email format invalid`)
        } else {
            errors.email = req.body.email;
        }
    }

    // 1 Lcase/Ucase/#/schar && 4 to 15 chars
    if (req.body.password == '' ) {

        errors.messages.push('Password Required')

    } else if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,15}$/)) {

        errors.messages.push('Password requires 4-15 Characters and 1 Lowercase/Uppercase/Number/Special Character')
    }

    if (errors.messages.length > 0) {
        res.render('register', errors)
        console.log(errors.messages)

    } else {

        db.addUser(req.body).then((data) => {
            // req.session.user = data;
            res.redirect('/')//, {users : data}) 
        }).catch((err) => {
            console.log(`Error adding user ${err}`)
            res.redirect('/register')
        })
          
    }

})

app.post('/login', (req, res) => {

    let errors = {
        messages : [],
        email: ''
    };

    if (req.body.email == '') {
        errors.messages.push(`Email required`)

    } else {
        if (!req.body.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {

            errors.messages.push(`Email format invalid`)
        } else {
            errors.email = req.body.email;
        }
    }

    if (req.body.password == '' ) {

        errors.messages.push(`Password Required`)

    } else if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,15}$/)) {

        errors.messages.push(`Password requires 4-15 Characters and 1 Lowercase / Uppercase / Number / Special Character`)
    }

    if (errors.messages.length > 0) {

        res.render('register', errors)
        console.log(errors.messages)

    } else {

        db.validateUser(req.body)
        .then((data) => {
            // Logs in a user
            // req.session.user = data[0];
            // console.log(req.session.user)

            res.render('home')
            // res.redirect("/", {
            //     // users: data[0]
            // })
            // res.redirect('/dashboard')

        }).catch((err) => {
            console.log(err)
            res.redirect("/register")
        })

    }

})








const PORT = process.env.PORT;

db.initialize()
.then(() => {
    console.log('Database accessed successfully')
    app.listen(PORT, () => {
        console.log(`Server up and listening on Port: ${PORT}!`)
    })

})
.catch((data) => {
    console.log(data)
})