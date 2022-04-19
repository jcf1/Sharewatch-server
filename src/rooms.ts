interface roomData {
    room: string,
    head: string,
    users: string[],
    running: boolean,
    startTime: number,
}

var room_to_data: Map<string,roomData> = new Map();

const makeRoomId = (length: number): string => {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

const createRoom = (socket_id: string): string => {
    
    var code = '';
    do {
        code = makeRoomId(4);
    } while(roomExists(code));

    code = code.toLowerCase();
    
    if(roomExists(code)) {
        return '';
    }

    let data: roomData = { room: code, head: socket_id, users: [], running: false, startTime: -1 };
    room_to_data.set(code, data);

    return code;
};

const removeRoom = (room: string): roomData => {
    room = room.toLowerCase();
    let data = room_to_data.get(room);
    if(data !== undefined) {
        room_to_data.delete(room);
        return data;
    }
    return { room: '', head: '', users: [], running: false, startTime: -1 };
};

const updateRoomData = (room: string, data: roomData): boolean => {
    if(room_to_data.has(room)) {
        room_to_data.set(room, data);
        return true;
    }
    return false;
}

const getRoomData = (room: string): roomData => {
    room = room.toLowerCase();
    let data = room_to_data.get(room);
    return data === undefined ? { room: '', head: '', users: [], running: false, startTime: -1 } : data;
}

const roomExists = (room: string): boolean => {
    return room_to_data.has(room);
}

export { roomData, createRoom, removeRoom, getRoomData, updateRoomData, roomExists };