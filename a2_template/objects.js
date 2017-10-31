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
        super(game, 100, Vec.of(2, 2, 2), Vec.of(0, 2.1, 0));
    }
}

class Arena {
    constructor(num_rooms, map_size, room_size, room_thickness) {
        this.max_rooms = num_rooms;
        this.map_size = map_size;
        this.room_size = room_size;
        this.room_thickness = room_thickness;
        this.map = [];
        this.rooms = [];
        this.init_x = Math.floor(this.map_size / 2);
        this.init_z = this.init_x;
        this.cur_rooms = 0;

        this.create_empty_map();
        this.create_map(this.init_x, this.init_z);

        while (this.cur_rooms < (this.max_rooms * 2 / 3)) {
            this.create_empty_map();
            this.create_map(this.init_x, this.init_z);
        }

        this.make_rooms();
    }

    create_empty_map() {
        this.cur_rooms = 0;
        this.map = new Array(this.map_size);
        for (let i = 0; i < this.map_size; i++) {
            this.map[i] = new Array(this.map_size);
            for (let j = 0; j < this.map_size; j++)
                this.map[i][j] = 0;
        }
    }

    create_map(x, z) {
        if (this.cur_rooms < this.max_rooms && !this.map[x][z]) {
            var num_neighbors = 0;
            if (x + 1 < this.map_size && this.map[x + 1][z])
                num_neighbors += 1;
            if (x - 1 >= 0 && this.map[x - 1][z])
                num_neighbors += 1;
            if (z + 1 < this.map_size && this.map[x][z + 1])
                num_neighbors += 1;
            if (z - 1 >= 0 && this.map[x][z - 1])
                num_neighbors += 1;
            
            if (num_neighbors >= rand_int(2, 4))
                return;
            
            this.map[x][z] = 1;
            this.cur_rooms += 1;

            if (x + 1 < this.map_size && rand_int(0, 2))
                this.create_map(x + 1, z);
            if (x - 1 >= 0 && rand_int(0, 2))
                this.create_map(x - 1, z);
            if (z + 1 < this.map_size && rand_int(0, 2))
                this.create_map(x, z + 1);
            if (z - 1 >= 0 && rand_int(0, 2))
                this.create_map(x, z - 1);
        }
    }

    make_rooms() {
        for (let i = 0; i < this.map_size; i++) {
            for (let j = 0; j < this.map_size; j++) {
                if (this.map[i][j]) {
                    let doors = [0, 0, 0, 0];
                    if (i > 0 && this.map[i - 1][j])
                        doors[2] = 1;
                    if (i < this.map_size - 1 && this.map[i + 1][j])
                        doors[3] = 1;
                    if (j > 0 && this.map[i][j - 1])
                        doors[0] = 1;
                    if (j < this.map_size - 1 && this.map[i][j + 1])
                        doors[1] = 1;
                    let x = (i - this.init_x) * this.room_size * 2;
                    let z = (j - this.init_z) * this.room_size * 2;
                    this.rooms.push(new Square_Room(x, this.room_thickness, z, this.room_size, doors));
                }
            }
        }
    }
}

// Doors: [top, bot, left, right]
class Room {
    constructor(x, z, length, thickness, width, doors) {
        this.center = [x, 0, z]
        this.size = [length, thickness, width]
        this.vertexes = [[x + length, thickness, z + width], [x - length, thickness, z + width], [x - length, thickness, z - width], [x + length, thickness, z - width]];
        this.doors = doors;
    }
}

class Square_Room extends Room {
    constructor(x, y, z, size, doors) {
        super(x, z, size, y, size, doors);
    }
}

class Horizontal_Rect_Room extends Room {
    constructor(x, y, z, size, doors) {
        super(x, z, size * 2, y, size, doors);
    }
}

class Vertical_Rect_Room extends Room {
    constructor(x, y, z, size, doors) {
        super(x, z, size, y, size * 2, doors);
    }
}
