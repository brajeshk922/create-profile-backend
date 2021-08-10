const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

require('../db/conn');
const User = require('../model/userSchema');

router.get('/', (req, res) => {
    // res.cookie("test","fdjfjfs");
    res.send("hello from router file");
})

//USING ASYNC AWAIT
router.post('/register', async (req, res) => {

    const { name, email, phone, work, password, cpassword } = req.body;

    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(400).json("plz filled properly");
    }

    try {
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(422).json({ error: 'email already exist' });
        }
        else if (password != cpassword) {
            return res.status(422).json({ error: 'password are not matching' });
        }
        else {
            const user = new User({ name, email, phone, work, password, cpassword });

            //  yha pe hashing use hoga like a middleware with the help of bcrypt
            await user.save();
            res.status(201).json({ message: "user registered successfully" });
        }
    }
    catch (error) {
        console.log(error);
    }
})


router.post('/signin', async (req, res) => {
    // console.log(req.body);
    // res.json("awesome");
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "plz filled the details" });
        }

        const userLogin = await User.findOne({ email: email });

        if (userLogin) {
            const isMatch = await bcrypt.compare(password.toString(), userLogin.password);

            const token = await userLogin.generateAuthToken();
            console.log(token);

            // res.cookie("jwtoken", token, {
            //     expires: new Date(Date.now() + 258920000),  
            //     httpOnly: true
            // })

            if (!isMatch) {
                res.status(400).json({ error: "invalid credentials" });
            } else {
                res.json({ message: "user signin  successfully" });
            }
        } else {
            res.status(400).json({ error: "invalid credential" });
        }

    } catch (error) {
        console.log(error);
    }
})

// about us ka page
router.get('/about', authenticate, (req, res) => {
    console.log("hello world about");
    res.send(req.rootUser);
});

// get user data for contact us and home page
router.get('/getdata', authenticate, (req, res) => {
    console.log('getdata api');
    res.send(req.rootUser);
})

// contact form ka data send to database
router.post('/contact', authenticate, async (req, res) => {
    try {

        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            console.log('error in contact form');
            return res.json({ error: "plz filled the contact form " });
        }

        const userContact = await User.findOne({ _id: req.userID });

        if (userContact) {
            const userMessage = await userContact.addMessage(name, email, phone, message);

            await userContact.save();

            res.status(201).json({ message: "user contact successfulllly" });
        }
    } catch (error) {
        console.log(error);
    }
})

// logout ka page
router.get('/logout', (req, res) => {
    res.clearCookie('jwtoken', { path: '/' });
    res.status(200).send("User logout");
});
// insert data USING PROMISE
// router.post('/register',(req,res)=>{

//     const { name, email, phone, work, password, cpassword } = req.body;
//     if( !name || !email || !phone || !work || !password || !cpassword){
//         return res.status(400).json("plz filled properly");
//     }

//     User.findOne( {email: email})
//     .then((userExist)=>{
//         if(userExist){
//             return res.status(422).json({error: 'email already exist'});
//         }

//         const user = new User({name, email, phone, work, password, cpassword});
//         // below code is exteded form of above
//         // const user = new User({name:name, email:email, phone:phone, work:work, password:password, cpassword:cpassword});

//         user.save().then(()=>{
//             res.status(201).json({message: "user registered successfully"});
//         }).catch((error)=> res.status(500).json({error: "failed to registered"}));
//     }).catch(error => {console.log(error)});
//     // console.log(req.body);
//     // res.json({message: req.body});
//     // res.send("registered successfully");
// })
module.exports = router;