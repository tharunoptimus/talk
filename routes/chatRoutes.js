const express = require("express");
const app = express();
const router = express.Router();
const randomize = require('randomatic');

app.use(express.urlencoded({extended: true}));
app.use(express.json())


router.get("/:chatid", (req, res, next) => {

    let payload = {
        pageTitle: "Chat",
        chatid: JSON.stringify(req.params.chatid)
    }

    if(req.session.user === undefined) {
        let randomUserId = randomize('Aa0', 10);
        let user = {
            _id: randomUserId
        }
        payload.registered = false;
        payload.user = JSON.stringify(user);
    }
    else {
        payload.registered = true;
        payload.user = JSON.stringify(req.session.user);
    }

    res.status(200).render("chat", payload);
})


module.exports = router; 