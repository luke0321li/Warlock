class Arena {
    constructor(game, num_rooms, map_size) {
        Object.assign(this, {
            game: game,
            max_rooms: num_rooms,
            map_size: map_size,
            map: [],
            rooms: [],
            init_x: Math.floor(map_size / 2),
            init_z: Math.floor(map_size / 2),
            cur_rooms: 0
        })

        this.create_empty_map();
        this.create_map(this.init_x, this.init_z);

        while (this.cur_rooms < (this.max_rooms * 2 / 3)) {
            this.create_empty_map();
            this.create_map(this.init_x, this.init_z);
        }

        this.make_rooms();
        this.configure_rooms();
    }

    create_empty_map() // Create an empty tile map
    {
        this.cur_rooms = 0;
        this.map = new Array(this.map_size);
        for (let i = 0; i < this.map_size; i++) {
            this.map[i] = new Array(this.map_size);
            for (let j = 0; j < this.map_size; j++)
                this.map[i][j] = 0;
        }
    }

    create_map(x, z) // Use flood fill to recursively create rooms on the tile map
    {
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

    make_rooms() // Create room objects according to the tile map. Add doors between adjacent rooms
    {
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
                    let x = (i - this.init_x) * 20 * 2;
                    let z = (j - this.init_z) * 20 * 2;
                    this.rooms.push(new Square_Room(x, .1, z, 20, doors));
                }
            }
        }
    }

    configure_rooms() // For each room create floor, walls, and interior objects; also spawns mobs
    {
        let top_wall_trans = Vec.of(0, 5.1, -19);
        let bot_wall_trans = Vec.of(0, 5.1, 19);
        let left_wall_trans = Vec.of(-19, 5.1, 0);
        let right_wall_trans = Vec.of(19, 5.1, 0);

        for (var i in this.rooms) {
            let pos = this.rooms[i].center;
            let size = Mat4.scale(this.rooms[i].size);
            // Create floor
            this.game.object_list.push(new Room_Base(this.game, pos));

            // Create walls and boundaries if there should be any

            if (this.rooms[i].doors[0]) {
                let length = rand_num(5, 9);
                if (!rand_int(0, 3))
                    length = 2;
                let pos_1 = Vec.of(20 - length, 5.1, -19);
                let pos_2 = Vec.of(20 - length, 5.1, -21);
                this.game.object_list.push(new Wall(this.game, pos.plus(pos_1), length, 0));
                this.game.object_list.push(new Wall(this.game, pos.plus(pos_2), length, 0));

            } else
                this.game.object_list.push(new Wall(this.game, pos.plus(top_wall_trans), 20, 0));

            if (this.rooms[i].doors[1]) {
                let length = rand_num(5, 9);
                if (!rand_int(0, 3))
                    length = 2;
                let pos_1 = Vec.of(-20 + length, 5.1, 19);
                let pos_2 = Vec.of(-20 + length, 5.1, 21);
                this.game.object_list.push(new Wall(this.game, pos.plus(pos_1), length, 0));
                this.game.object_list.push(new Wall(this.game, pos.plus(pos_2), length, 0));
            } else
                this.game.object_list.push(new Wall(this.game, pos.plus(bot_wall_trans), 20, 0));

            if (this.rooms[i].doors[2]) {
                let length = rand_num(5, 7);
                if (rand_int(0, 3)) {
                    let pos_1 = Vec.of(-19, 5.1, -18 + length);
                    let pos_2 = Vec.of(-21, 5.1, -18 + length);
                    this.game.object_list.push(new Wall(this.game, pos.plus(pos_1), length, Math.PI / 2));
                    this.game.object_list.push(new Wall(this.game, pos.plus(pos_2), length, Math.PI / 2));
                }
            } else
                this.game.object_list.push(new Wall(this.game, pos.plus(left_wall_trans), 18, Math.PI / 2));

            if (this.rooms[i].doors[3]) {
                let length = rand_num(5, 7);
                if (rand_int(0, 3)) {
                    let pos_1 = Vec.of(19, 5.1, 18 - length);
                    let pos_2 = Vec.of(21, 5.1, 18 - length);
                    this.game.object_list.push(new Wall(this.game, pos.plus(pos_1), length, Math.PI / 2));
                    this.game.object_list.push(new Wall(this.game, pos.plus(pos_2), length, Math.PI / 2));
                }
            } else
                this.game.object_list.push(new Wall(this.game, pos.plus(right_wall_trans), 18, Math.PI / 2));

            // Create some environmental objects inside the room
            // Mobs
            if (this.rooms[i].center[0] || this.rooms[i].center[2]) {
                this.create_decorations(pos);
                this.spawn_mobs(pos);
            }

        }
    }

    create_decorations(pos) {
        if (!rand_int(0, 3)) {
            let num_pillars = rand_int(1, 4);
            let x = rand_num(-10, 10);
            let z = rand_num(-10, 10);
            for (var i = 0; i < num_pillars; i++) {
                this.game.object_list.push(new Pillar(this.game, pos.plus(Vec.of(x, 1.1, z)), rand_int(3, 5)));
                let new_x = x;
                let new_z = z;
                while (Vec.of(new_x, 0, new_z).minus(Vec.of(x, 0, z)).norm() <= 10) {
                    new_x = rand_num(-10, 10);
                    new_z = rand_num(-10, 10);
                }
                x = new_x;
                z = new_z;
            }
        }

        if (!rand_int(0, 4)) {
            let num_crates = rand_int(2, 5);
            let x = rand_num(-17, 17);
            let z = rand_num(-17, 17);
            for (var i = 0; i < num_crates; i++) {
                let crate_size = rand_num(0.8, 1.5);
                this.game.object_list.push(new Crate(this.game, pos.plus(Vec.of(x, crate_size + 0.1, z)), crate_size, rand_num(0, Math.PI)));

                let new_x = x;
                let new_z = z;
                while (Vec.of(new_x, 0, new_z).minus(Vec.of(x, 0, z)).norm() <= 5 || (Math.abs(new_x) < 10 && Math.abs(new_z) < 10)) {
                    new_x = rand_num(-17, 17);
                    new_z = rand_num(-17, 17);
                }
                x = new_x;
                z = new_z;
            }
        }

        if (!rand_int(0, 5)) {
            let x = rand_num(-15, 15);
            let z = rand_num(-15, 15);
            while (Math.abs(x) < 12 || Math.abs(z) < 12) {
                x = rand_num(-15, 15);
                z = rand_num(-15, 15);
            }
            this.game.object_list.push(new Goblet(this.game, pos.plus(Vec.of(x, 1.6, z))));
        }
    }

    spawn_mobs(pos) {
        if (rand_int(0, 3)) {
            let num_mobs = rand_int(1, 4);
            let x = rand_num(-10, 10);
            let z = rand_num(-10, 10);
            for (var i = 0; i < num_mobs; i++) {
                if (rand_int(0, 5))
                    this.game.object_list.push(new Goblin(this.game, pos.plus(Vec.of(x, 0, z))));
                else if (this.game.level > 1) {
                    if (!rand_int(0, 3))
                        this.game.object_list.push(new Ogre(this.game, pos.plus(Vec.of(x, 0, z))));
                    else
                        this.game.object_list.push(new Draugr(this.game, pos.plus(Vec.of(x, 0, z))));
                }
                let new_x = x;
                let new_z = z;
                while (Vec.of(new_x, 0, new_z).minus(Vec.of(x, 0, z)).norm() <= 5) {
                    new_x = rand_num(-10, 10);
                    new_z = rand_num(-10, 10);
                }
                x = new_x;
                z = new_z;
            }
        }
    }
}

// Doors: [top, bot, left, right]
class Room {
    constructor(x, z, length, thickness, width, doors) {
        this.center = Vec.of(x, 0, z);
        this.size = Vec.of(length, thickness, width);
        this.vertexes = [[x + length, thickness, z + width], [x - length, thickness, z + width], [x - length, thickness, z - width], [x + length, thickness, z - width]];
        this.doors = doors;
    }
}

class Square_Room extends Room {
    constructor(x, y, z, size, doors) {
        super(x, z, size, y, size, doors);
    }
}
