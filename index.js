"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const users_1 = require("./src/users");
const rooms_1 = require("./src/rooms");
const hostname = "0.0.0.0";
const PORT = 3000;
const router = require('./router');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(router);
app.use(cors);
// Remove any Rooms that are open but inactive for 24 hours
const inactivityLimit = 86400000;
const refreshRate = 60000;
let room_to_last_interaction = new Map();
setInterval(() => {
    let now = Date.now();
    room_to_last_interaction.forEach((t, room) => {
        if (now - t > inactivityLimit) {
            io.to(room).emit('inactivity', {});
        }
    });
}, refreshRate);
io.on('connection', (socket) => {
    // Provide socket id to user.
    socket.on('get_id', ({}, callback) => {
        socket.emit('socket_id', { id: socket.id });
    });
    // Create new room and send back the generated room code.
    // Need to remove user from previous room if they are in one.
    socket.on('create', (callback) => {
        const room = (0, rooms_1.createRoom)(socket.id);
        if (room === '') {
            return callback();
        }
        if ((0, users_1.getUser)(socket.id) !== null) {
            const old_user = (0, users_1.removeUser)(socket.id);
            let old_data = (0, rooms_1.getRoomData)(old_user.room);
            old_data.users = (0, users_1.getUsersInRoom)(old_user.room).map((ele) => { return ele.id; });
            if (old_data.users.length === 0) {
                (0, rooms_1.removeRoom)(old_data.room);
            }
            else if (old_user.id === old_data.head) {
                const new_host = old_data.users[0];
                old_data.head = new_host;
                (0, rooms_1.updateRoomData)(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            }
            else {
                (0, rooms_1.updateRoomData)(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            }
        }
        room_to_last_interaction.set(room, Date.now());
        const user = (0, users_1.addUser)(socket.id, room);
        socket.join(room);
        let data = (0, rooms_1.getRoomData)(room);
        data.users = (0, users_1.getUsersInRoom)(room).map((ele) => { return ele.id; });
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
    // Add user to room if it exists.
    // Need to remove user from previous room if they are in one.
    socket.on('join', ({ room }, callback) => {
        room = room.toLowerCase();
        if (!(0, rooms_1.roomExists)(room)) {
            callback();
        }
        if ((0, users_1.getUser)(socket.id) !== null) {
            const old_user = (0, users_1.removeUser)(socket.id);
            let old_data = (0, rooms_1.getRoomData)(old_user.room);
            old_data.users = (0, users_1.getUsersInRoom)(old_user.room).map((ele) => { return ele.id; });
            if (old_data.users.length === 0) {
                (0, rooms_1.removeRoom)(old_data.room);
            }
            else if (old_user.id === old_data.head) {
                const new_host = old_data.users[0];
                old_data.head = new_host;
                (0, rooms_1.updateRoomData)(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            }
            else {
                (0, rooms_1.updateRoomData)(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            }
        }
        room_to_last_interaction.set(room, Date.now());
        const user = (0, users_1.addUser)(socket.id, room);
        socket.join(room);
        let data = (0, rooms_1.getRoomData)(room);
        data.users = (0, users_1.getUsersInRoom)(room).map((ele) => { return ele.id; });
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
    // Start all watches in the room.
    socket.on('start', ({ room, startTime }, callback) => {
        room = room.toLowerCase();
        if (!(0, rooms_1.roomExists)(room)) {
            callback();
        }
        let data = (0, rooms_1.getRoomData)(room);
        if (socket.id !== data.head) {
            return callback();
        }
        room_to_last_interaction.set(room, Date.now());
        data.running = true;
        data.startTime = startTime;
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
    // Stop all watches in the room and reset them.
    socket.on('reset', ({ room }, callback) => {
        room = room.toLowerCase();
        if (!(0, rooms_1.roomExists)(room)) {
            callback();
        }
        let data = (0, rooms_1.getRoomData)(room);
        if (socket.id != data.head) {
            return callback();
        }
        room_to_last_interaction.set(room, Date.now());
        data.running = false;
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
    // Remove user from room. 
    // If user is the only user in the room, remove room.
    // If user is head timer, assign a new head timer.
    socket.on('disconnect', () => {
        if ((0, users_1.getUser)(socket.id) === null) {
            return;
        }
        let user = (0, users_1.removeUser)(socket.id);
        const room = user.room;
        let data = (0, rooms_1.getRoomData)(room);
        data.users = (0, users_1.getUsersInRoom)(room).map((ele) => { return ele.id; });
        if (data.users.length == 0) {
            (0, rooms_1.removeRoom)(room);
        }
        else if (user.id === data.head) {
            const new_host = data.users[0];
            data.head = new_host;
            (0, rooms_1.updateRoomData)(room, data);
            io.to(room).emit('roomData', data);
        }
        else {
            (0, rooms_1.updateRoomData)(room, data);
            io.to(room).emit('roomData', data);
        }
    });
});
app.use(router);
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
