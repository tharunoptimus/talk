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
    // if(isRegistered) {
    //     $(".chatDiv").show();
    // }
    // else {
    //     $(".registerDiv").show();
    // }
});

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
    sendMessageToPeople(value);
    $("#messageTextarea").val("");
    addToHtml(value)
    sendStoppedTyping();
}

function receivedMessage (message, name) {
    console.log("New Message from: ", name);
    console.log(message)
}

function addToHtml (value) {
    let html =  `<div class='message ours'>${value}</div>`;
    $(".chatMessages").append(html);
}