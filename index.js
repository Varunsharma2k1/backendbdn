const express = require('express')
const app = express()
const cors = require("cors");
const { MongoClient } = require('mongodb'); 
const passport = require('passport');
require('./passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
var port = process.env.PORT || 8000;
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(
    session({
        secret: 'my.jwt',
        resave: true,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());



const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.send({ message: "loggedout" });
    } else {
        try {
            const data = jwt.verify(token, "my.jwt");
            req.name = data.name
            return next();
        } catch {
            return res.sendStatus(403);
        }
    }
}

app.get('/', function (req, res) {
    res.send("<button><a href='/auth'>Login With Google</a></button>")
})


app.get('/auth', passport.authenticate('google', {
    scope:
        ['email', 'profile']
}));

// Auth Callback
app.get('/auth/callback',
    passport.authenticate('google', {
         
        successRedirect: '/auth/callback/success',
        failureRedirect: '/auth/callback/failure'
    }));

// Success  
app.get('/auth/callback/success', (req, res) => {
    console.log(req.user)
        if (!req.user)
            res.redirect('/auth/callback/failure');
        
        var e =req.user.email
         async function main() {
        const uri = process.env.MONGODB_URL;
        const client = new MongoClient(uri);
        try {
            // Connect to the MongoDB cluster
            await client.connect();
            const db = client.db("User")
            const collection = db.collection('users')
            // Make the appropriate DB calls
            await collection.insertOne({ email: e })
            
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        }
        main().catch(console.error);
        res.redirect('http://localhost:3000');
});

// failure
app.get('/auth/callback/failure', (req, res) => {
    res.redirect('http://localhost:3000/login');
})

app.post('/filter',async function (req, res) {
    var f= req.body.Filter
    res.redirect(`/mydata?data=${f}`)
    
})
app.post('/login', async function (req, res) {
    var luser = req.body.username
    var lpass= req.body.password
    async function main() {
        const uri = process.env.MONGODB_URL;
        const client = new MongoClient(uri);
        try {
            // Connect to the MongoDB cluster
            await client.connect();
            const db = client.db("User")
            const collection = db.collection('users')
            var check = false
            // Make the appropriate DB calls
            const a = await collection.find({ email: luser }).toArray();
            console.log(a)
            if(a.length===0){
                console.log("hi")
                res.send(check)
            }
            else if(a[0].password===lpass){
                console.log("logged in")
                check=true
                res.send(check)
            }
            else{
                res.send(check)     
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    main().catch(console.error);

})
app.post('/signup', async function (req, res) {
    var suser = req.body.username
    var spass = req.body.password
    var cpass = req.body.cpassword
    var email = req.body.email
    if(cpass===spass){
        async function main() {
            const uri = process.env.MONGODB_URL;
            const client = new MongoClient(uri);
            try {
                // Connect to the MongoDB cluster
                await client.connect();
                const db = client.db("User")
                const collection = db.collection('users')
                // Make the appropriate DB calls
                await collection.insertOne({ email: email, username: suser, password: spass })
                res.sendStatus(200)
            } catch (e) {
                console.error(e);
            } finally {
                await client.close();
            }
        }

        main().catch(console.error);
    }

})
app.get('/mydata', function (req, res) {
    async function main() {
        const uri = process.env.MONGODB_URL;
        const client = new MongoClient(uri);
        try {
            // Connect to the MongoDB cluster
            await client.connect();
            const db = client.db("BDB")
            const collection = db.collection('blood')
            // Make the appropriate DB calls
            const a = await collection.find().toArray();
            res.send(a)

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    main().catch(console.error);

})


app.post('/insert', async (req, res)=>{
    const name = req.body.fullName
    const gender = req.body.gender
    const email = req.body.Email
    const contact = req.body.Contact
    const dob = req.body.Dob
    const bloodGroup = req.body.Blood
    const city = req.body.City
    context = {
        "name": name,
        "gender": gender,
        "email": email,
        "contact": contact,
        "dob": dob,
        "bloodGroup": bloodGroup,
        "city": city,
    }
    async function main() {
        const uri = process.env.MONGODB_URL;
        const client = new MongoClient(uri);
        try {
            // Connect to the MongoDB cluster
            await client.connect();
            const db = client.db("BDB")
            const collection = db.collection('blood')
            // Make the appropriate DB calls
            await collection.insertOne(context);

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    main().catch(console.error);

})

app.listen(port, function () {
    console.log('Example app listening on port ' + port + '!');
  });