const express = require("express")
const keypair = require("keypair")
const faker = require("faker")
const app = express()
const router = express.Router()
const randomize = require("randomatic")
const cryptoString = require("crypto-string")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router.get("/keys", (_, res) => {
	let pair = keypair([64])
	res.status(200).send(pair)
})

router.get("/:chatid", (req, res, next) => {
	let payload = {
		pageTitle: "Chat",
		chatid: JSON.stringify(req.params.chatid),
	}

	if (req.session.user === undefined) {
		let randomUserId = cryptoString(10)
		let user = {
			_id: randomUserId,
		}
		payload.registered = false
		payload.user = JSON.stringify(user)
	} else {
		payload.registered = true
		payload.user = JSON.stringify(req.session.user)
	}

	res.status(200).render("chat", payload)
})

router.post("/create", (req, res, next) => {
	let room = renderRoom(req.body.room)

	let url = `/chat/${room}`
	return res.redirect(url)
})

router.post("/new", (req, res, next) => {
	let user = {
		_id: randomize("Aa0", 10),
		name: renderName(req.body.name),
	}

	let chatid = req.body.chatid
	chatid = chatid.replace(/[^a-zA-Z0-9]/g, "")

	let url = `/chat/${chatid}`

	req.session.user = user
	return res.redirect(url)
})

function renderRoom(string) {
	if (string.length < 10 && /^[a-zA-Z0-9 ]+$/.test(string)) {
		return string.replace(/\s/g, "")
	}
	return cryptoString(10)
}

function renderName(string) {
	if (string.length < 20 && /^[a-zA-Z0-9 ]+$/.test(string)) {
		return string
	}
	return faker.name.findName()
}

module.exports = router
