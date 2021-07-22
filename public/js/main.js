var connect = false;

var socket = io(window.location.origin);
socket.emit("setup", user);


socket.on("connected", () => {
    connected = true;
    console.log("Established web socket successfully")
});
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