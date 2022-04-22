const express = require('express');
const socketio = require('socket.io');
const http = require('http');

import { User, addUser, removeUser, getUser, getUsersInRoom } from './src/users';
import { roomData, createRoom, removeRoom, getRoomData, updateRoomData, roomExists } from './src/rooms';
import { Socket } from 'socket.io';

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const inactivityLimit = 3600000;
const refreshRate = 60000;
let room_to_last_interaction: Map<string,number> = new Map();

setInterval(() => {
    let now = Date.now();
    room_to_last_interaction.forEach((t, room) => {
        if(now - t > inactivityLimit) {
            io.to(room).emit('inactivity', {});
        }
    });
}, refreshRate);

io.on('connection', (socket: Socket) => {

    socket.on('get_id', ({}, callback) => {
        socket.emit('socket_id', {id: socket.id})
    });

    socket.on('create', (callback) => {
        const room: string = createRoom(socket.id);
        if(room === '') {
            return callback();
        }

        if(getUser(socket.id) !== null) {
            const old_user: User = removeUser(socket.id);
            let old_data: roomData = getRoomData(old_user.room);
            old_data.users = getUsersInRoom(old_user.room).map((ele) => { return ele.id });

            if(old_data.users.length === 0) {
                removeRoom(old_data.room);
            } else if(old_user.id === old_data.head) {
                const new_host = old_data.users[0];
                old_data.head = new_host;
                updateRoomData(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            } else {
                updateRoomData(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            }
        }

        room_to_last_interaction.set(room, Date.now());

        const user: User = addUser(socket.id, room);
        socket.join(room);
        let data: roomData = getRoomData(room);
        data.users = getUsersInRoom(room).map((ele) => { return ele.id });
        updateRoomData(room, data);
        io.to(room).emit('roomData', data);
    });

    socket.on('join', ({ room }, callback) => {
        room = room.toLowerCase();

        if(!roomExists(room)) {
            callback();
        }

        if(getUser(socket.id) !== null) {
            const old_user: User = removeUser(socket.id);
            let old_data: roomData = getRoomData(old_user.room);
            old_data.users = getUsersInRoom(old_user.room).map((ele) => { return ele.id });

            if(old_data.users.length === 0) {
                removeRoom(old_data.room);
            } else if(old_user.id === old_data.head) {
                const new_host = old_data.users[0];
                old_data.head = new_host;
                updateRoomData(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            } else {
                updateRoomData(old_data.room, old_data);
                io.to(old_data.room).emit('roomData', old_data);
            }
        }

        room_to_last_interaction.set(room, Date.now());

        const user: User = addUser(socket.id, room);
        socket.join(room);
        let data: roomData = getRoomData(room);
        data.users = getUsersInRoom(room).map((ele) => { return ele.id });
        updateRoomData(room, data);
        io.to(room).emit('roomData', data);
    });

    socket.on('start', ({ room, startTime }, callback) => {
        room = room.toLowerCase();
        
        if(!roomExists(room)) {
            callback();
        }

        let data: roomData = getRoomData(room);
        if(socket.id !== data.head) {
            return callback();
        }

        room_to_last_interaction.set(room, Date.now());

        data.running = true;
        data.startTime = startTime;
        updateRoomData(room, data);
        io.to(room).emit('roomData', data);
    });
    
    socket.on('reset', ({ room }, callback) => {
        room = room.toLowerCase();

        if(!roomExists(room)) {
            callback();
        }

        let data: roomData = getRoomData(room);
        if(socket.id != data.head) {
            return callback();
        }

        room_to_last_interaction.set(room, Date.now());

        data.running = false;
        updateRoomData(room, data);
        io.to(room).emit('roomData', data);
    });

    // Remove user from room. if user is only room user, remove room. If user is master, set new master.
    socket.on('disconnect', () => {
        if(getUser(socket.id) === null){
            return;
        }

        let user: User = removeUser(socket.id);
        const room: string = user.room;
        let data: roomData = getRoomData(room);
        data.users = getUsersInRoom(room).map((ele) => { return ele.id });

        if(data.users.length == 0) {
            removeRoom(room);
        } else if(user.id === data.head) {
            const new_host: string = data.users[0];
            data.head = new_host;
            updateRoomData(room, data);
            io.to(room).emit('roomData', data);
        } else {
            updateRoomData(room, data);
            io.to(room).emit('roomData', data);
        }
    });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));


