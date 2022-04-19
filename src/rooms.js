"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomExists = exports.updateRoomData = exports.getRoomData = exports.removeRoom = exports.createRoom = void 0;
var room_to_data = new Map();
const makeRoomId = (length) => {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
const createRoom = (socket_id) => {
    var code = '';
    do {
        code = makeRoomId(4);
    } while (roomExists(code));
    code = code.toLowerCase();
    if (roomExists(code)) {
        return '';
    }
    let data = { room: code, head: socket_id, users: [], running: false, startTime: -1 };
    room_to_data.set(code, data);
    return code;
};
exports.createRoom = createRoom;
const removeRoom = (room) => {
    room = room.toLowerCase();
    let data = room_to_data.get(room);
    if (data !== undefined) {
        room_to_data.delete(room);
        return data;
    }
    return { room: '', head: '', users: [], running: false, startTime: -1 };
};
exports.removeRoom = removeRoom;
const updateRoomData = (room, data) => {
    if (room_to_data.has(room)) {
        room_to_data.set(room, data);
        return true;
    }
    return false;
};
exports.updateRoomData = updateRoomData;
const getRoomData = (room) => {
    room = room.toLowerCase();
    let data = room_to_data.get(room);
    return data === undefined ? { room: '', head: '', users: [], running: false, startTime: -1 } : data;
};
exports.getRoomData = getRoomData;
const roomExists = (room) => {
    return room_to_data.has(room);
};
exports.roomExists = roomExists;
