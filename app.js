var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var fs = require("fs");
server.listen(process.env.PORT || 3000);

app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");	
});

var rooms = {};

io.sockets.on('connection', function (socket) {

	socket.on('error', (error) => {
    	console.log('error: ', error);
  	});

    console.log("Có người connect rồi nè: " + socket.id);

    socket.on('newMessage', data => {
        message = JSON.parse(data);
        console.log(message);
        io.sockets.emit('receiveMessage', message);
    });

    socket.on('stopConnect', roomID => {
        if(rooms[roomID]) {
            var i = rooms[roomID].indexOf(socket);
            rooms[roomID].splice(i, 1);
        }
        
    });

    socket.on('newConnector', roomID => {
        if(rooms[roomID]) {
            if(rooms[roomID].length == 2) {
                rooms[roomID].splice(0, rooms[roomID].length);
            }
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
    });

    socket.on('sendVideoCall', roomID => {
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if(otherUser) {
            rooms[roomID].splice(0, rooms[roomID].length);
            console.log(rooms[roomID])
            io.to(otherUser).emit('receiveVideoCall', roomID);
        }
    })

    socket.on('cancelVideoCall', roomID => {
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if(otherUser) {
            console.log('cancelVideoCall' + otherUser);
            rooms[roomID].splice(0, rooms[roomID].length);
            io.to(otherUser).emit('cancelVideoCall', roomID);
        }
    })

    socket.on('rejectVideoCall', roomID => {
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        rooms[roomID].splice(0, rooms[roomID].length);
        if(otherUser) {
            io.to(otherUser).emit('rejectVideoCall', roomID);
        }
    })

    socket.on('acceptVideoCall', roomID => {
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if(otherUser) {
            io.to(otherUser).emit('acceptVideoCall', roomID);
        }
    })
        
    
  });