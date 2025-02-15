const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server)
io.on('connection', socket=>{
   // all socket events here
});


server.prependListener("request", (req, res) => {
res.setHeader("Access-Control-Allow-Origin", "*");
});

app.use(cors({
  origin: "*"
}));

// Set headers middleware
app.use((res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

app.use(router);

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
  
    // Check if the 'user' object and the 'room' property exist
    if (user && user.room) {
      io.to(user.room).emit('message', { user: user.name, text: message });
    } else {
      // Handle the error or log a message indicating that the user or room is not found.
      console.log('User or room not found');
    }
  
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
  });
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));