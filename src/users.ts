interface User {
    id: string,
    room: string
}

var users: User[] = [];

const addUser = (id: string, room: string): User => {

    if(getUser(id)) {
        removeUser(id);
    }

    const user: User = { id: id, room: room.toLowerCase() };
    users.push(user);

    return user;
};

const removeUser = (id: string): User => {
    const index = users.findIndex((user) => user.id === id);
    
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
    return { id: '', room: '' };
};

const getUser = (id: string): User => {
    let user = users.find((user) => user.id === id);
    return user === undefined ? { id: '', room: '' } : user;
};

const getUsersInRoom = (room: string): User[] => {
    return users.filter((user) => user.room === room.toLowerCase());
};

export { User, addUser, removeUser, getUser, getUsersInRoom };