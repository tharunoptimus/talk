const express = require("express");
const app = express();
const router = express.Router();
const randomize = require('randomatic');

app.use(express.urlencoded({extended: true}));
app.use(express.json())

router.get("/", (req, res, next) => {
    let randomUserId = randomize('Aa0', 10);
    let user = {
        _id: randomUserId,
        name: "John Doe"
    }

    req.session.user = user;
    let payload = {
        randomUserId: JSON.stringify(randomUserId),
        pageTitle: "Home",
        user: JSON.stringify(user)
    }

    
    res.status(200).render("home", payload);
})


module.exports = router; 