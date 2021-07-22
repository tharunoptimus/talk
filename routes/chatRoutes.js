const express = require("express");
const app = express();
const router = express.Router();

app.use(express.urlencoded({extended: true}));
app.use(express.json())

router.get("/", (req, res, next) => {

    var payload = {
        pageTitle: "Chat"
    }
    res.status(200).render("chat", payload);
})


module.exports = router; 