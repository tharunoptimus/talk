const express = require("express");
const app = express();
const router = express.Router();
const randomize = require('randomatic');

app.use(express.urlencoded({extended: true}));
app.use(express.json())

router.get("/", (req, res, next) => {
    res.status(200).render("home");
})


module.exports = router; 