# A Disposable Private Messenger

## Install
`npm install` to install dependencies.

## Run
`npm start` to start the server.

## Information

### How this works?
- The server is a simple nodejs server.
- The client establishes a websocket connection to the server on creating the room. In this case, we use socket.io.
- The client will send a message to the server, and the server will send a message back to the clients connected in the room.
- All the messages is destroyed if the client disconnects.

### How this will be useful?
- This is a simple private messenger.
- It can be used to send private messages to a group of friends in a chat room.
- You can use this if you didn't want others to know your real identity.
- Send Images, replies and even send a video call invite using on board Jitsi Meet.
- Nothing is ever saved and no data is ever shared.
- No data except your messages is sent to the server.

Enjoy 🥳