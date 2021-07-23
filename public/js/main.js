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
    }
    else {
        $(".chatDiv").remove();
    }
});

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

function sendMessage (value) {
    let messageId = generateMessageId(20);
    sendMessageToPeople(value, messageId);
    $("#messageTextarea").val("");
    receivedMessage(value, user, messageId);
    lastMessageSentBy = "";
    sendStoppedTyping();
}

function receivedMessage (message, friend, id) {
    console.log(friend)
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

function createChatHtml (value, username, ours) {
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

    return html = `${details}
                    <li class='message ${oursOrTheirs}'>
                        <div class='messageContainer'>
                            <span data-date='${date}' class='messageBody'>${value}</span>
                        </div>
                    </li>`;
    
}

function getCurrentDateAndTime () {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;
    let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
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