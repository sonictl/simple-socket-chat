var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 2000;

http.listen(port, function () {
    console.log('listening on *:' + port);
});

app.use(express.static(path.join(__dirname, '/')));

var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('new_username', function (username) {
        console.log('Received new_username:', username);
        if (addedUser) return;
        socket.username = username;

        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        io.emit('is online', '&#x1F506 <b>' + socket.username + ' 加入.. </b>' + '<span style="color:DarkGray">当前在线: ' + numUsers + '人</span>');
    });

    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            io.emit('is online', '&#x1F319 <b>' + socket.username + ' 离开.. </b>' + '<span style="color:DarkGray">当前在线: ' + numUsers + '人</span>');
        }
    });

    socket.on('chat message', function (msg1) {
        var n = msg1.includes("<script>");
        if (n == true) {
            io.emit('chat message', '<strong>System</strong>: ' + '@' + socket.username + '\'s' + ' message is illegal! check it.');
        } else {
            io.emit('chat message', '<strong>' + socket.username + '</strong>: ' + msg1);
        }
    });
});
