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

router.post("/new", (req, res, next) => {

    let user = {
        _id: randomize('Aa0', 10),
        name: renderName(req.body.name)
    }

    let chatid = req.body.chatid;
    chatid = chatid.replace(/[^a-zA-Z0-9]/g, "");

    let url = `/chat/${chatid}`

    req.session.user = user;
    return res.redirect(url);
    

})

function renderName(string) {
    console.log(string)
    if(string.length < 20 && /^[a-zA-Z0-9 ]+$/.test(string)) {
        console.log("String after checking: ",string)
        return string;
    }
    return "Anonymous";
}


module.exports = router; 