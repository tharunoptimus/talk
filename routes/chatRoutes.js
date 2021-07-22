const express = require("express");
const app = express();
const router = express.Router();
const randomize = require('randomatic');

app.use(express.urlencoded({extended: true}));
app.use(express.json())


router.get("/:chatid", (req, res, next) => {

    let randomUserId = randomize('Aa0', 10);
    let user = {
        _id: randomUserId,
        name: "John Doe"
    }

    var payload = {
        pageTitle: "Chat",
        user: JSON.stringify(user),
        chatid: JSON.stringify(req.params.chatid)
    }
    res.status(200).render("chat", payload);
})


module.exports = router; 