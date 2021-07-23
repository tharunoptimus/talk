var cropper;

$(document).ready(function () {
    (function () {
        var cssFa = document.createElement("link");
        cssFa.href =
            "https://kit-pro.fontawesome.com/releases/v5.12.1/css/pro.min.css";
        cssFa.rel = "stylesheet";
        cssFa.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(cssFa);
    
        var cssMain = document.createElement("link");
        cssMain.href = "/css/main.css";
        cssMain.rel = "stylesheet";
        cssMain.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(cssMain);
    })();

    if(isRegistered) {
       $(".registerDivContainer").remove();
       establishConnection();
       welcomeToTalk();
    }
    else {
        $(".chatDiv").remove();
    }
});

setTimeout(function () {
    setChatRoomName();
}
, 1000);

function setChatRoomName() {
    let html = `Room: ${chatId}`
    $("#chatName").html(html)
}

let lastMessageSentBy = "";

// on keypress on the messageTextarea textarea do something
$(document).on("keypress", "#messageTextarea", function (e) {
    sendTyping();
    var value = $("#messageTextarea").val().trim();
    if(value != "") {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage(value);
        }
    }
})

$(document).on("click", ".sendMessageButton", function (e) {
    var value = $("#messageTextarea").val().trim();
    if(value != "") {
        sendMessage(value);
    }
    return;
})

$(".sendVideoCallRequestButton").click(() => {
    videoCallRequestSent();
    return false;
})

$(document).on("click", "#leave", () => {
    leaveRoom();
})

$("#sendImageInput").change(function() {

	if(this.files && this.files[0]) {
		var reader = new FileReader();
		reader.onload = (e) => {
			var image = document.getElementById("imagePreview");
			image.src = e.target.result;

			if(cropper !== undefined) {
				cropper.destroy();
			}

			cropper = new Cropper(image, {
				background: false
			});

		}
		reader.readAsDataURL(this.files[0]);
	}
})

$("#confirmSendImageButton").click(()=> {
	var canvas = cropper.getCroppedCanvas();

	if(canvas == null) {
		return alert("Could not upload the image. Make sure it is an image file.");
	}

	let imageDataSrc = canvas.toDataURL('image/png');
    let html = `<i class="fad fa-image"></i><img src='${imageDataSrc}' alt='Send image' class='sentPngImage'>`;
    sendMessage(html)
    $("#sendImageModal").modal('hide');

})

$(document).on("click", ".message", function (e) {
    var message = $(this).find(".datetime");
    if(message.css("display") == "flex") {
        message.css("display", "none");
    }
    else {
        message.css("display", "flex");
    }
});

// onclicking the span element with id invite do something
$(document).on("click", "#invite", function (e) {
    shareRoomLink();
});



function sendMessage (value) {
    let messageId = generateMessageId(20);
    sendMessageToPeople(value, messageId);
    $("#messageTextarea").val("");
    receivedMessage(value, user, messageId);
    lastMessageSentBy = "";
    sendStoppedTyping();
}

function receivedMessage (message, friend, id) {
    if(friend.name != user.name) {
        let html = createChatHtml(message, friend.name, false, id)
        $(".chatMessages").append(html);
    }
    else if(friend.name == user.name) {
        let html = createChatHtml(message, friend.name, true, id)
        $(".chatMessages").append(html);
    }
    scrollToBottom();
    
}

function createChatHtml (value, username, ours, id) {
    let details = "";
    let oursOrTheirs = "theirs";
    let date = getCurrentDateAndTime();

    if(ours) {
        oursOrTheirs = "ours";
    }

    if(!ours) {
        if(lastMessageSentBy != username) {
            lastMessageSentBy = username;
            details = `<li class='message theirs'>
                            <div class='friendName'>
                                ${username}
                            </div>
                        </li>`
        }
    }

    let requiredMessage = replaceURLs(value);

    if((value).substring(0,33) == '<i class="fal fa-video-plus"></i>') {
        var link = (value).substring(34, (value).length);
        requiredMessage = createJitsiMeetPostHtml(link);
    }

    if((value).substring(0,28) == '<i class="fad fa-image"></i>') {

        let imageDataSrc = (value).substring(38, (value).length);
        imageDataSrc = imageDataSrc.substring(0, imageDataSrc.length - 39);

        requiredMessage = `<div class='sentImageContainer'>
                            <img src ='${imageDataSrc}' alt='Send image' class='sendPngImage'>
                        </div>`
    }


    return html = `${details}
                    <li class='message unselectable ${oursOrTheirs}' data-id='${id}'>
                        <div class='messageContainer'>
                            <span class='messageBody'>${requiredMessage}</span>
                            <span class='datetime'>${date}</span>
                        </div>
                        
                    </li>`;
    
}

function getCurrentDateAndTime () {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function scrollToBottom () {
    let container = $(".chatMessages");
    let scrollHeight = container[0].scrollHeight;

    container.animate({ scrollTop: scrollHeight }, "slow" )
}

function generateMessageId(length) {
	let text = "";
	let char_list =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < length; i++) {
		text += char_list.charAt(Math.floor(Math.random() * char_list.length));
	}
	return text;
}

function showTypingIndicator () {
    // find whether the div with class .typingIndicator is already shown
    if($(".typingIndicator").is(":visible")) {
        return;
    }
    else {
        if($(".typingIndicator").show())
        setTimeout(function () {
            $(".typingIndicator").hide();
        }
        , 3000);
    }

}

function welcomeToTalk() {
    let html = `<span class='notification'>Successfully joined the room!</span>`;
    showStatus(html)
}

function newUserJoined (user) {
    let html = `<span class='notification'>${user.name} Joined!</span>`;
    showStatus(html);
}

function userLeft(user) {
    let html = `<span class='notification'>${user.name} Left!</span>`;
    showStatus(html);
}

function hideTypingIndicator () {
    $(".typingIndicator").hide();
}

function showStatus(html) {

    let element = $(html);
    element.prependTo(".statusBar");

    setTimeout(function () {
        element.fadeOut(400);
    }
    , 3000);
}

function replaceURLs(message) {
	if (!message) return;

    message = htmlEntities(message);

	var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
	return message.replace(urlRegex, function (url) {
		var hyperlink = url;
		if (!hyperlink.match("^https?://")) {
			hyperlink = "http://" + hyperlink;
		}
		return (
			'<a class=\'postLink\' href="' +
			hyperlink +
			'" target="_blank" rel="noopener noreferrer">' +
			url +
			" <i class='far fa-external-link-square-alt urlLink'></i> </a>"
		);
	});
}

function videoCallRequestSent() {

    var href = createJitsiMeetLinkUrl();
    var iTag = '<i class="fal fa-video-plus"></i>';
    var content = mix(iTag, href);
    sendMessage(content);
    socket.emit("stop typing", chatId);
    typing = false;
    window.open(href, '_blank');

}

function setClipboard(value) {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

function createJitsiMeetLinkUrl(users) {
    var linkUrl = chatId;
    return getJitsiMeetLink(linkUrl);
}

function getJitsiMeetLink(linkUrl) {
    return "https://meet.jit.si/" + linkUrl;
}

function createJitsiMeetPostHtml(link) {

    return `<div style='border: 3px solid transparent; display: flex; flex-direction: column; align-items:center'>
                <p style='font-size: 1rem;font-weight: 500;'>You're invited to a Jitsi Meet!</p>
                <a target='_blank' style='text-decoration: underline' href="${link}">${link.substring(8, link.length)} <i class="far fa-external-link-square-alt urlLink"></i></a>
                <button style="outline: none;max-width: 7rem;color: #000;border-radius: 1rem;margin: 1rem;padding: 0.5rem;box-shadow: 0 6px 6px rgba(10,16,20,.15), 0 0 52px rgba(10,16,20,.12);border: 1px solid transparent;" onclick="setClipboard('${link}')">
                    <i class="fal fa-copy"></i> Copy Link
                </button>
            </div>
            <a style="outline: none;" data-placement="right" tabindex="0" role="button" data-toggle="popover" data-trigger="focus" title="Warning:" data-content="You're about to access a page which is not maintained by this platform. This platform will be held responsible under no circumstances. Proceed with caution."><i style='box-shadow: 0 6px 6px rgba(10,16,20,.15), 0 0 52px rgba(10,16,20,.12);margin: 0.5rem' class="far fa-exclamation-triangle"></i></a>`
}

function mix(iTag, link) {
    return iTag + " " + link;
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/~/g, '&tilde;');
}

$(document).on("click", ".sentPngImage", (event) => {
    var imageURL = $(event.target).attr("src");
    $("#viewSentImageModal").modal("show");
    $("#imageView").attr("src", imageURL);
});

// console.log when the li is double clicked
$(document).on("dblclick", ".message", function(event) {
    idToDelete = $(this).data("id");
    $("#deleteSentMessageModal").modal("show");
    var html = $(this).find('span.messageBody').html();
    $("#deleteSentMessageModal .modal-body").html("");
    $("#deleteSentMessageModal .modal-body").append(html);
})

function shareRoomLink() {
	if (navigator.share) {
		navigator
			.share({
				title: "Talk - Disposable Chat Room",
				text: "Join the Talk room!",
				url: window.location.href,
			})
			.catch((error) => alert("Unable to Generate Link. Copy the URL and share it!"));
	}
}