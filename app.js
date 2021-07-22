const express = require("express")
const app = express()
const port = process.env.PORT || 3003;
const path = require('path')
const session = require("express-session")

const server = app.listen(port, () => console.log("Server Listening on " + port));
const io = require("socket.io")(server, { pingTimeOut: 60000 })

app.set("view engine", "pug");
app.set("views", "views");

app.use(session({
    secret: "bbq chips",
    resave: true,
    saveUninitialized: false
}))

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));

// Routes
const homeRoute = require("./routes/homeRoutes");
const chatRoute = require("./routes/chatRoutes");


app.use("/", homeRoute);
app.use("/home", homeRoute);
app.use("/chat", chatRoute);

io.on("connection", (socket) => {

    socket.on("setup", userData => { socket.join(userData._id); socket.emit("connected"); })

    socket.on("join room", room => {
        socket.join(room);
        console.log("New Used Joined")
    });
    socket.on("typing", room => socket.in(room).emit("typing"));
    socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    socket.on("notification received", room => socket.in(room).emit("notification received"));
    
    
    socket.on("new message", newMessage => {
        var chat = newMessage.chat;

        if(!chat.users) return console.log("Chat.users is not defined");
        if((newMessage.content).substring(0, 4) == "<div") {
            var lastObject = (newMessage.content).indexOf('<i class="far fa-external-link-square-alt') - 1;
            var firstObject = (newMessage.content).indexOf('">') + 2;
            newMessage.content = (newMessage.content).substring(firstObject, lastObject);
        }

        chat.users.forEach(user => {
            if(user._id == newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        })
    });

    socket.on("message deleted", (room, id) => socket.in(room).emit("message deleted", id));
    

})