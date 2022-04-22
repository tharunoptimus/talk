let cropper
let selectedChatId = ""
let list

$(document).ready(async function () {
	;(function () {
		var cssFa = document.createElement("link")
		cssFa.href =
			"https://kit-pro.fontawesome.com/releases/v5.12.1/css/pro.min.css"
		cssFa.rel = "stylesheet"
		cssFa.type = "text/css"
		cssFa.defer = ""
		document.getElementsByTagName("head")[0].appendChild(cssFa)

		var cssMain = document.createElement("link")
		cssMain.href = "/css/main.css"
		cssMain.rel = "stylesheet"
		cssMain.type = "text/css"
		document.getElementsByTagName("head")[0].appendChild(cssMain)
	})()

	if (!window.navigator.onLine) {
		document.querySelector(".noInternetBanner").style.display = "block"
		document.querySelector("#messageTextarea").disabled = true
	}

	if (isRegistered) {
		$(".registerDivContainer").remove()
		establishConnection()
		welcomeToTalk()
		loadList()
		await displayFromIndexedDB()
	} else {
		$(".chatDiv").remove()
	}
})

window.addEventListener("online", () => window.location.reload())

setTimeout(function () {
	setChatRoomName()
}, 1000)

function setChatRoomName() {
	let html = `Room: ${chatId}`
	$("#chatName").html(html)
}

let lastMessageSentBy = ""

// on keypress on the messageTextarea textarea do something
$(document).on("keydown", "#messageTextarea", function (e) {
	sendTyping()
	var value = $("#messageTextarea").val().trim()
	if (value != "") {
		if (e.keyCode == 13 && !e.shiftKey) {
			e.preventDefault()
			sendMessage(value)
		}
	} else if (e.keyCode === 8 && value == "") {
		userPressedEscapeKey()
	}
})

document.onkeydown = function (evt) {
	evt = evt || window.event
	var isEscape = false
	if ("key" in evt) {
		isEscape = evt.key === "Escape" || evt.key === "Esc"
	} else {
		isEscape = evt.keyCode === 27
	}
	if (isEscape) {
		userPressedEscapeKey()
	}
}

$(document).on("click", ".sendMessageButton", function (e) {
	var value = $("#messageTextarea").val().trim()
	if (value != "") {
		sendMessage(value)
	}
	return
})

$(".sendVideoCallRequestButton").click(() => {
	videoCallRequestSent()
	return false
})

$(document).on("click", "#leave", () => {
	indexedDB.deleteDatabase(chatId)
	leaveRoom()
})

$("#sendImageInput").change(function () {
	if (this.files && this.files[0]) {
		var reader = new FileReader()
		reader.onload = (e) => {
			var image = document.getElementById("imagePreview")
			image.src = e.target.result

			if (cropper !== undefined) {
				cropper.destroy()
			}

			cropper = new Cropper(image, {
				background: false,
			})
		}
		reader.readAsDataURL(this.files[0])
	}
})

$("#confirmSendImageButton").click(() => {
	var canvas = cropper.getCroppedCanvas()

	if (canvas == null) {
		return alert(
			"Could not upload the image. Make sure it is an image file."
		)
	}

	let imageDataSrc = canvas.toDataURL("image/png")
	let html = `<i class="fad fa-image"></i><img src='${imageDataSrc}' alt='Send image' class='sentPngImage'>`
	sendMessage(html)
	$("#sendImageModal").modal("hide")
})

$(document).on("click", "#invite", function (e) {
	shareRoomLink()
})

$(document).on("click", ".showToRepliedChat", (event) => {
	let messageId = event.target.attributes.messageId.value
	let messageLiElement = $("li[data-id=" + messageId + "]")

	let container = $(".chatMessages")

	let heightToScroll =
		container.scrollTop() +
		messageLiElement.position().top -
		container.height() / 2 +
		messageLiElement.height() / 2
	container.animate({ scrollTop: heightToScroll }, "slow")

	let messageBodyElement = messageLiElement.find(".messageBody")

	// Transitions
	messageBodyElement.addClass("selectedChatToReply")
	messageLiElement.addClass("selectedChatToReplyLiElement")
	setTimeout(() => {
		messageBodyElement.removeClass("selectedChatToReply")
		messageLiElement.removeClass("selectedChatToReplyLiElement")
	}, 1000)
})

async function userGenerationForm() {
	let showGenerationMessageParagraphTag = document.querySelector(
		".registerDiv .registrationFieldContainer p"
	)
	showGenerationMessageParagraphTag.style.display = "block"

	let response = await fetch("/chat/keys")
	let keys = await response.json()

	let public = keys.public
	let private = keys.private

	console.log(`Your Keys: ${keys}`)

	let data = {
		username : user._id,
		private,
		public,
		timestamp: getCurrentDateAndTime()
	}

	await addKeyToIDB(data)
	submitForm()
}

async function addKeyToIDB(data) {
	await localforage.setItem("keys", data)
}

function submitForm() {
	let username = document.getElementById("userName")
	let chatIdInput = document.getElementById("chatIdInput")

	let form = document.createElement("form")
	form.setAttribute("method", "POST")
	form.setAttribute("action", "/chat/new")

	let input = document.createElement("input")
	input.setAttribute("type", "hidden")
	input.setAttribute("name", "name")
	input.setAttribute("value", username.value)

	let input2 = document.createElement("input")
	input2.setAttribute("type", "hidden")
	input2.setAttribute("name", "chatid")
	input2.setAttribute("value", chatIdInput.value)

	form.appendChild(input)
	form.appendChild(input2)

	document.body.appendChild(form)
	form.submit()
}

function sendMessage(value) {
	if (toxModel.predict(value)) {
		return alert(
			"You might have used a toxic word in you message! Please refrain from using such words."
		)
	}

	if (selectedChatId != "") {
		value += `~id~${selectedChatId}`
	}

	let messageId = generateMessageId(20)
	sendMessageToPeople(value, messageId)

	$("#messageTextarea").val("")
	receivedMessage(value, user, messageId)

	lastMessageSentBy = ""

	sendStoppedTyping()
	if (selectedChatId != "") {
		readyToSend()
	}
	$("#messageTextarea").attr("placeholder", "Type a message...")
}

function receivedMessage(message, friend, id) {
	if (friend._id != user._id) {
		let html = createChatHtml(message, friend.name, false, id)
		$(".chatMessages").append(html)
	} else if (friend._id == user._id) {
		let html = createChatHtml(message, friend.name, true, id)
		$(".chatMessages").append(html)
	}
	scrollToBottom()

	if (!visibilityFunction()) playSound()

	addToIndexedDB(message, friend, id)
}

function loadMessages(message, friend, id, date) {
	let html = ""
	if (friend._id != user._id) {
		html = createChatHtml(message, friend.name, false, id, date)
	} else if (friend._id == user._id) {
		html = createChatHtml(message, friend.name, true, id, date)
	}
	$(".chatMessages").append(html)
}

let visibilityFunction = (() => {
	let stateKey,
		eventKey,
		keys = {
			hidden: "visibilitychange",
			webkitHidden: "webkitvisibilitychange",
			mozHidden: "mozvisibilitychange",
			msHidden: "msvisibilitychange",
		}
	for (stateKey in keys) {
		if (stateKey in document) {
			eventKey = keys[stateKey]
			break
		}
	}
	return function (c) {
		if (c) document.addEventListener(eventKey, c)
		return !document[stateKey]
	}
})()

let notificationSound = new Audio("/sounds/notification.mp3")

// function to play sound if the user is not in this tab
function playSound() {
	notificationSound.play()
}

function createChatHtml(value, username, ours, id, date) {
	let details = ""
	let oursOrTheirs = "theirs"
	date = date != undefined ? date : getCurrentDateAndTime()
	let appendedString = "~id~"
	let buttonElement = ""

	if (ours) {
		oursOrTheirs = "ours"
	}

	if (!ours) {
		if (lastMessageSentBy != username) {
			lastMessageSentBy = username
			details = `<li class='message theirs'>
                            <div class='friendName'>
                                ${username}
                            </div>
                        </li>`
		}
	}

	let requiredMessage = replaceURLs(value)

	if (value.substring(0, 33) == '<i class="fal fa-video-plus"></i>') {
		var link = value.substring(34, value.length)
		requiredMessage = createJitsiMeetPostHtml(link)
	}

	if (value.substring(0, 28) == '<i class="fad fa-image"></i>') {
		let imageDataSrc = value.substring(38, value.length)
		imageDataSrc = imageDataSrc.substring(0, imageDataSrc.length - 39)

		requiredMessage = `<div class='sentImageContainer'>
        <img src ='${imageDataSrc}' alt='Send image' class='sendPngImage'>
        </div>`
	}

	let index = requiredMessage.indexOf(appendedString)
	if (index != -1) {
		let starting = value.indexOf(appendedString) + 4
		let repliedId = value.substring(starting, value.length)
		value = value.substring(0, starting - 4)
		requiredMessage = replaceURLs(value)
		buttonElement = `<button 
                            title='Click to see the message which this was replied to.' 
                            class='showToRepliedChat' 
                            style='
                                outline: none;
                                background-color: transparent;
                                border: 0;' 
                            data-id='${repliedId}'
                            messageid='${repliedId}'
                        >
                            <i class="fal fa-comment-dots" style="pointer-events: none;"></i>
                        </button>`
	}

	return (html = `${details}
                    <li class='message unselectable ${oursOrTheirs}' data-id='${id}' title='Double click to reply'>
                        <div class='messageContainer'>
                            <span class='messageBody'>${requiredMessage} ${buttonElement}</span>
                            <span class='datetime'>${date}</span>
                        </div>
                        
                    </li>`)
}

function getCurrentDateAndTime() {
	let date = new Date()
	let hours = date.getHours()
	let minutes = date.getMinutes()
	let ampm = hours >= 12 ? "pm" : "am"
	hours = hours % 12
	hours = hours ? hours : 12 // the hour '0' should be '12'
	minutes = minutes < 10 ? "0" + minutes : minutes
	let strTime = hours + ":" + minutes + " " + ampm
	return strTime
}

function scrollToBottom() {
	let container = $(".chatMessages")
	let scrollHeight = container[0].scrollHeight

	container.animate({ scrollTop: scrollHeight }, "slow")
}

function generateMessageId(length) {
	let text = ""
	let char_list =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for (let i = 0; i < length; i++) {
		text += char_list.charAt(Math.floor(Math.random() * char_list.length))
	}
	return text
}

function showTypingIndicator() {
	// find whether the div with class .typingIndicator is already shown
	if ($(".typingIndicator").is(":visible")) {
		return
	} else {
		if ($(".typingIndicator").show())
			setTimeout(function () {
				$(".typingIndicator").hide()
			}, 3000)
	}
}

function welcomeToTalk() {
	let html = `<span class='notification'>Successfully joined the room!</span>`
	showStatus(html)
}

function newUserJoined(user) {
	let html = `<span class='notification'>${user.name} Joined!</span>`
	showStatus(html)
}

function userLeft(user) {
	let html = `<span class='notification'>${user.name} Left!</span>`
	showStatus(html)
	indexedDB.deleteDatabase(chatId)
}

function hideTypingIndicator() {
	$(".typingIndicator").hide()
}

function showStatus(html) {
	let element = $(html)
	element.prependTo(".statusBar")

	setTimeout(function () {
		element.fadeOut(400)
	}, 3000)
}

function replaceURLs(message) {
	if (!message) return

	message = htmlEntities(message)

	var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g
	return message.replace(urlRegex, function (url) {
		var hyperlink = url
		if (!hyperlink.match("^https?://")) {
			hyperlink = "http://" + hyperlink
		}
		return (
			"<a class='postLink' href=\"" +
			hyperlink +
			'" target="_blank" rel="noopener noreferrer">' +
			url +
			" <i class='far fa-external-link-square-alt urlLink'></i> </a>"
		)
	})
}

function videoCallRequestSent() {
	var href = createJitsiMeetLinkUrl()
	var iTag = '<i class="fal fa-video-plus"></i>'
	var content = mix(iTag, href)
	sendMessage(content)
	socket.emit("stop typing", chatId)
	typing = false
	window.open(href, "_blank")
}

function setClipboard(value) {
	var tempInput = document.createElement("input")
	tempInput.style = "position: absolute; left: -1000px; top: -1000px"
	tempInput.value = value
	document.body.appendChild(tempInput)
	tempInput.select()
	document.execCommand("copy")
	document.body.removeChild(tempInput)
}

function createJitsiMeetLinkUrl(users) {
	var linkUrl = chatId
	return getJitsiMeetLink(linkUrl)
}

function getJitsiMeetLink(linkUrl) {
	return "https://meet.jit.si/" + linkUrl
}

function createJitsiMeetPostHtml(link) {
	return `<div style='border: 3px solid transparent; display: flex; flex-direction: column; align-items:center'>
                <p style='font-size: 1rem;font-weight: 500;'>You're invited to a Jitsi Meet!</p>
                <a target='_blank' style='text-decoration: underline' href="${link}">${link.substring(
		8,
		link.length
	)} <i class="far fa-external-link-square-alt urlLink"></i></a>
                <button style="outline: none;max-width: 7rem;color: #000;border-radius: 1rem;margin: 1rem;padding: 0.5rem;box-shadow: 0 6px 6px rgba(10,16,20,.15), 0 0 52px rgba(10,16,20,.12);border: 1px solid transparent;" onclick="setClipboard('${link}')">
                    <i class="fal fa-copy"></i> Copy Link
                </button>
            </div>`
}

function mix(iTag, link) {
	return iTag + " " + link
}

function htmlEntities(str) {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

$(document).on("click", ".sentPngImage", (event) => {
	var imageURL = $(event.target).attr("src")
	$("#viewSentImageModal").modal("show")
	$("#imageView").attr("src", imageURL)
})

function shareRoomLink() {
	if (navigator.share) {
		navigator
			.share({
				title: "Talk - Disposable Chat Room",
				text: "Join the Talk room!",
				url: window.location.href,
			})
			.catch((error) =>
				alert("Unable to Generate Link. Copy the URL and share it!")
			)
	}
}

function userPressedEscapeKey() {
	readyToSend()
	$("#messageTextarea").attr("placeholder", "Type a message...")
}

function readyToReply() {
	$("#sendChatButton").removeClass("fa-paper-plane")
	$("#sendChatButton").addClass("fa-reply")

	$("#messageTextarea").attr(
		"placeholder",
		"Send a reply...Press Esc or Bckspace to cancel"
	)
	var messageLiElement = $("li[data-id=" + selectedChatId + "]")

	$("#messageTextarea").css("background-color", "#f0932b1a")

	var messageBodyElement = messageLiElement.find(".messageBody")
	messageBodyElement.addClass("selectedChatToReply")
}

function readyToSend() {
	$("#sendChatButton").removeClass("fa-reply")
	$("#sendChatButton").addClass("fa-paper-plane")

	if (selectedChatId == null || selectedChatId == "") return

	var messageLiElement = $("li[data-id=" + selectedChatId + "]")
	messageLiElement.attr("title", "Double click to reply")
	messageLiElement.removeClass("selectedChatToReplyLiElement")

	$("#messageTextarea").css("background-color", "#0000000d")

	var messageBodyElement = messageLiElement.find(".messageBody")
	messageBodyElement.removeClass("selectedChatToReply")
	selectedChatId = ""
}

async function loadList() {
	let stuff = await fetch("../js/stuff.json")
	let response = await stuff.json()
	list = response
}

let toxModel = {
	predict: (string) => {
		let elements = string.split(" ")
		for (let i = 0; i < elements.length; i++) {
			let element = elements[i]
			if (list.includes(element.toLowerCase())) {
				return true
			}
		}

		return false
	},
}

async function addToIndexedDB(message, friend, id) {
	let data = { message, friend, id }
	let history = await localforage.getItem(chatId)
	if (history == null) history = []
	history.push(data)
	return await localforage.setItem(chatId, history)
}

async function getDataFromIDB() {
	let history = await localforage.getItem(chatId)
	if (history == null) history = []
	console.log(history)
	return history
}

async function displayFromIndexedDB() {
	let data = await getDataFromIDB()
	data.forEach((element) => {
		let friend = element.friend
		let message = element.message
		let id = element.id
		let timestamp = element.timestamp
		loadMessages(message, friend, id, timestamp)
		scrollToBottom()
	})
}

function getMessageEncoding() {
	const messageBox = document.querySelector(".aes-ctr #message")
	let message = messageBox.value
	let enc = new TextEncoder()
	return enc.encode(message)
}

function encryptMessage(key) {
	let encoded = getMessageEncoding()
	// counter will be needed for decryption
	counter = window.crypto.getRandomValues(new Uint8Array(16))
	return window.crypto.subtle.encrypt(
		{
			name: "AES-CTR",
			counter,
			length: 64,
		},
		key,
		encoded
	)
}

function decryptMessage(key, ciphertext) {
	return window.crypto.subtle.decrypt(
		{
			name: "AES-CTR",
			counter,
			length: 64,
		},
		key,
		ciphertext
	)
}

// on double clicking the li element with classname "message" get the data-id of the element
$(document).on("dblclick", ".message", function (event) {
	if (selectedChatId != "") return
	selectedChatId = $(this).attr("data-id")
	var messageLiElement = $("li[data-id=" + selectedChatId + "]")
	messageLiElement.attr(
		"title",
		"Replying to this message. Press Backspace or Esc to cancel."
	)
	messageLiElement.addClass("selectedChatToReplyLiElement")
	$("#messageTextarea").focus()
	readyToReply()
})

$(document).on("click", ".message", function (e) {
	if ($(e.target).is("button")) return
	var message = $(this).find(".datetime")
	if (message.css("display") == "flex") {
		message.css("display", "none")
	} else {
		message.css("display", "flex")
	}
})
