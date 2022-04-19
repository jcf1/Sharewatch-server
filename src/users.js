"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersInRoom = exports.getUser = exports.removeUser = exports.addUser = void 0;
var users = [];
const addUser = (id, room) => {
    if (getUser(id)) {
        removeUser(id);
    }
    const user = { id: id, room: room.toLowerCase() };
    users.push(user);
    return user;
};
exports.addUser = addUser;
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
    return { id: '', room: '' };
};
exports.removeUser = removeUser;
const getUser = (id) => {
    let user = users.find((user) => user.id === id);
    return user === undefined ? { id: '', room: '' } : user;
};
exports.getUser = getUser;
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room.toLowerCase());
};
exports.getUsersInRoom = getUsersInRoom;
