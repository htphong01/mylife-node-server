const { Server } = require("socket.io");

const io = new Server({
    cors: { origin: '*' }
});

const rooms = {

};

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    const { roomId, username } = data;
    if(rooms[roomId]) {
      if(!rooms[roomId].users.includes(username)) {
        rooms[roomId].users.push(username);
        socket.join(roomId);
        socket.emit('oldUser',  rooms[roomId].users[0]);
        socket.to(roomId).emit('newUser', username);
      } else {
        socket.join(roomId);
      }
    } else {
      const room = {
        id: roomId,
        users: [username]
      }
      rooms[roomId] = room;
      socket.join(roomId);
    }
  });

  socket.on('newMessage', data => {
    const { roomId } = data;
    socket.to(roomId).emit('newMessage', data);
  })
});

io.listen(3000);