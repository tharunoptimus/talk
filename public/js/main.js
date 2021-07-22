var connect = false;

var socket = io(window.location.origin);
socket.emit("setup", user);


socket.on("connected", () => {
    connected = true;
    console.log("Established web socket successfully")
    socket.emit("join room", chatId)
});

function sendTyping() {
    socket.emit("typing", chatId);
}

function sendStoppedTyping() {
    socket.emit("stop typing", chatId);
}

function sendMessage(message) {
    socket.emit("new message", message, chatId, user);
}

socket.on("typing", () => {
    console.log("Someone is typing")
})

socket.on("stop typing", () => {
    console.log("Someone stopped typing")
})

socket.on("new message", (message, name) => {
    console.log("New Message from: ", name);
    console.log(message)
})


// socket.on("message received", (newMessage) => messageReceived(newMessage));

// socket.on("notification received", () => {
//     $.get("/api/notifications/latest", (notificationData) => {
//         showNotificationPopup(notificationData)
//         refreshNotificationsBadge();
//     })
// })

// function emitNotification(userId) {
//     if(userId == userLoggedIn._id) return;

//     socket.emit("notification received", userId);
// }

console.log(chatId)
console.log(user)