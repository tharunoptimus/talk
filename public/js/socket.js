if(window.location.hostname !== 'localhost') {
    if (location.protocol !== 'https:') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
}

var connect = false;
var socket = io(window.location.origin);

function establishConnection () {
    if(user.name == undefined) { user.name = "Anonymous" }
    socket.emit("setup", user);
}

function sendTyping() {
    socket.emit("typing", chatId);
}

function sendStoppedTyping() {
    socket.emit("stop typing", chatId);
}

function sendMessageToPeople(message, id) {
    socket.emit("new message", message, chatId, user, id);
}

function findPeople() {
    socket.emit("people", chatId);
}

function leaveRoom () {
    socket.emit("leave room", chatId, user)
    window.location.href = "/home";
}


socket.on("connected", () => {
    connected = true;
    console.log("Established web socket successfully")
    console.log("AXE is now Online!")
    socket.emit("join room", chatId, user)
});

socket.on("new user" , (user) => {
    newUserJoined(user);
    console.log("WebRTC is established with " + user)
})

socket.on("typing", () => {
    showTypingIndicator();
})

socket.on("stop typing", () => {
    hideTypingIndicator();
})

socket.on("new message", (message, friend, id) => {
    receivedMessage(message, friend, id)
})

socket.on("number of people", (numberOfUsers)  => {
    console.log("Request send")
})

socket.on("friend left", (user) => {
    userLeft(user);
})

