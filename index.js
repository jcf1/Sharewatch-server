"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const users_1 = require("./src/users");
const rooms_1 = require("./src/rooms");
const PORT = process.env.PORT || 5000;
const router = require('./router');
const { constants } = require('buffer');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
io.on('connection', (socket) => {
    socket.on('get_id', ({}, callback) => {
        socket.emit('socket_id', { id: socket.id });
    });
    socket.on('create', (callback) => {
        const room = (0, rooms_1.createRoom)(socket.id);
        if (room === '') {
            return callback('No Rooms Available.');
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
        const user = (0, users_1.addUser)(socket.id, room);
        socket.join(room);
        let data = (0, rooms_1.getRoomData)(room);
        data.users = (0, users_1.getUsersInRoom)(room).map((ele) => { return ele.id; });
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
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
        const user = (0, users_1.addUser)(socket.id, room);
        socket.join(room);
        let data = (0, rooms_1.getRoomData)(room);
        data.users = (0, users_1.getUsersInRoom)(room).map((ele) => { return ele.id; });
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
    socket.on('start', ({ room, startTime }, callback) => {
        room = room.toLowerCase();
        if (!(0, rooms_1.roomExists)(room)) {
            callback();
        }
        let data = (0, rooms_1.getRoomData)(room);
        if (socket.id !== data.head) {
            return callback();
        }
        data.running = true;
        data.startTime = startTime;
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
    socket.on('reset', ({ room }, callback) => {
        room = room.toLowerCase();
        if (!(0, rooms_1.roomExists)(room)) {
            callback();
        }
        let data = (0, rooms_1.getRoomData)(room);
        if (socket.id != data.head) {
            return callback();
        }
        data.running = false;
        (0, rooms_1.updateRoomData)(room, data);
        io.to(room).emit('roomData', data);
    });
    // Remove user from room. if user is only room user, remove room. If user is master, set new master.
    // TODO: Host Migration and remove room
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
