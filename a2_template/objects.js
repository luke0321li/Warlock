class Game_Object // Base class for player, mobs, items and projectiles etc.
{
    constructor(game, hp, collision_box, init_pos) {
        game.object_list.push(this);
        this.hp = hp;
        this.collision_box = collision_box;
        this.pos = Vec.of(init_pos[0], init_pos[1], init_pos[2]);
        this.velocity = Vec.of(0, 0, 0);
    }

    kill() {
        this.hp = 0;
    }

    is_alive() {
        return (this.hp != 0);
    }
}

class Player extends Game_Object {
    constructor(game) {
        super(game, 100, [2, 2, 2], [0, 2.1, 0]);
    }
}

class Wall extends Game_Object {
    constructor(game, x, z, length, width) {
        super(game, 99999, [length, 5, width], [x, 5, z]);
    }
}

// Doors: [top, bot, left, right]
class Arena {
    constructor(num_rooms, map_size) {
        // this.rooms = [new Room(0, 0, 30, 30, [1, 0, 0, 0])];
        this.max_rooms = num_rooms;
        this.map_size = map_size;
        this.map = new Array(map_size);
        for (let i = 0; i < map_size, i++)
            this.map[i] = new Array(map_size);
        this.rooms = [];
        this.create_map();
        this.make_rooms();
    }
    
    create_map()
    {
        let init
    }
    
    /* create_room(prev_room) {
        if (this.rooms.length + 1 <= this.max_rooms)
            this.rooms.push(prev_room);
        else
            return;
        
        if (prev_room.doors[0])
        {
            let new_doors = [rand_int(0, 2), 1, rand_int(0, 2), rand_int(0, 2)];
            let new_room = new Square_Room(prev_room.center[0], prev_room.center[2] - 2 * 30, new_doors);
            this.create_room(new_room);
        }
        
        if (prev_room.doors[1])
        {
            let new_doors = [1, rand_int(0, 2), rand_int(0, 2), rand_int(0, 2)];
            let new_room = new Square_Room(prev_room.center[0], prev_room.center[2] + 2 * 30, new_doors);
            this.create_room(new_room);
        }
        
        if (prev_room.doors[2])
        {
            let new_doors = [rand_int(0, 2), rand_int(0, 2), rand_int(0, 2), 1];
            let new_room = new Square_Room(prev_room.center[0] - 2 * 30, prev_room.center[2], new_doors);
            this.create_room(new_room);

        }
        
        if (prev_room.doors[3])
        {
            let new_doors = [rand_int(0, 2), rand_int(0, 2), 1, rand_int(0, 2)];
            let new_room = new Square_Room(prev_room.center[0] + 2 * 30, prev_room.center[2], new_doors);
            this.create_room(new_room);
        }
        
    }*/
    
}

class Room {
    constructor(x, z, length, width, doors) {
        this.center = [x, 0, z]
        this.size = [length, .1, width]
        this.vertexes = [[x + length, .1, z + width], [x - length, .1, z + width], [x - length, .1, z - width], [x + length, .1, z - width]];
        this.doors = doors;
    }
}

class Square_Room extends Room {
    constructor(x, z, doors) {
        super(x, z, 30, 30, doors);
    }
}

class Horizontal_Rect_Room extends Room {
    constructor(x, z, doors) {
        super(x, z, 60, 30, doors);
    }
}

class Vertical_Rect_Room extends Room {
    constructor(x, z, doors) {
        super(x, z, 30, 60, doors);
    }
}