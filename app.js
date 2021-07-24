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


app.use("/home", homeRoute);
app.use("/chat", chatRoute);

app.get("/", (req, res, next) => {
    res.status(200).render("root");
});

let usersOnline = [];

io.on("connection", (socket) => {

    socket.on("setup", userData => { 
        socket.join(userData._id); 
        socket.emit("connected");
    })

    socket.on("join room", (room, user) => {
        socket.join(room);
        socket.in(room).emit("new user", user)
    });

    socket.on("typing", room => socket.in(room).emit("typing"));
    socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    
    
    socket.on("new message", (newMessage, room, user, randomMessageNumber) => {
        let message = newMessage;
        socket.in(room).emit("new message", message, user, randomMessageNumber);
    });

    socket.on("people", (room) => {
        let number = io.sockets.adapter.rooms.get(room)
        numClients = number ? number.size : 0;
        console.log(numClients)
        socket.in(room).emit("number of people", numClients)
    })

    socket.on("leave room", (room, user) => {
        socket.in(room).emit("friend left", user);
    })

});


app.get('*', function(req, res){
    res.status(200).render("error");
});