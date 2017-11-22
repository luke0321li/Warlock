class Game_Object // Base class for player, mobs, items and projectiles etc.
{
    constructor(game, hp, collision_box, init_pos, init_angle, type) {
        Object.assign(this, {
            game: game,
            hp: hp,
            collision_box: collision_box,
            pos: Vec.of(init_pos[0], init_pos[1], init_pos[2]),
            angle: init_angle,
            type: type,
            animate_counter: 0
        })
    }

    is_alive() {
        return (this.hp > 0);
    }

    create_particles(number, size, color) {
        if (number) {
            for (var i = 0; i < number; i++)
                this.game.object_list.push(new Particle(this.game, this, size, color));
        }
    }

    take_damage(num) {
        if (num > 0)
            this.hp -= num;
    }

    move(dt) {}
    draw(graphics_state) {}
    on_death() {} // Do something when it is dead
    hit_by(object) {} // Do something on collision 
}

class Idle_Object extends Game_Object {
    constructor(game, collision_box, init_pos, init_angle) {
        super(game, 99999, collision_box, init_pos, init_angle, "idle");
        this.matrix = Mat4.translation(this.pos).times(Mat4.rotation(init_angle, Vec.of(0, 1, 0)));
    }
}

class Wall extends Idle_Object {
    constructor(game, init_pos, length, init_angle) {
        super(game, Vec.of(length, 5, 1), init_pos, init_angle);
        
        // Create some random tile-like features on the wall
        this.tiles = [];
        if (length > 4 && rand_int(0, 5) > 2) {
            let num_tiles = rand_int(0, 3);
            if (length > 8)
                num_tiles = rand_int(2, 4);
            let ls = [];
            let ws = [];
            let xs = [];
            let ys = [];
            for (var i = 0; i < num_tiles; i++) {
                let tile_width = rand_num(0.8, 1.2);
                let tile_length = tile_width + rand_num(-0.2, 0.2);
                let x_bound = length - tile_length - 0.3 - 2;
                let y_bound = 5 - tile_width - 0.3;
                let overlap = true;

                let x = rand_num(-1 * x_bound, x_bound);
                let y = rand_num(-1 * y_bound, y_bound);

                // Check if new tile overlaps with existing tiles
                overlap = false;
                for (var j = 0; j < xs.length; j++) {
                    if (Math.abs(x - xs[j]) <= (ls[j] + tile_length) && Math.abs(y - ys[j]) <= (ws[j] + tile_width))
                        overlap = true;
                }
                
                if (!overlap) {
                    ls.push(tile_length);
                    ws.push(tile_width);
                    xs.push(x);
                    ys.push(y);
                    
                    let sides = [-1, 1]
                    let pick_side = rand_num(0, 3);
                    if (!pick_side)
                        sides = [-1];
                    if (pick_side == 1)
                        sides = [1];

                    for (var j in sides) {
                        let pos = init_pos.plus(Vec.of(x, y, sides[j] * 1.1));
                        if (init_angle)
                            pos = init_pos.plus(Vec.of(sides[j] * 1.1, y, x));
                        this.tiles.push(new Wall_Tile(game, pos, tile_length, tile_width, init_angle));
                    }
                }
            }
        }
    }

    draw(graphics_state) {
        let trans = this.matrix.times(Mat4.scale(this.collision_box));
        this.game.shapes.box.draw(graphics_state, trans, this.game.arena_grey);
        for (var j in this.tiles)
            this.tiles[j].draw(graphics_state);
    }
}

class Wall_Tile extends Idle_Object {
    constructor(game, init_pos, length, width, init_angle) {
        super(game, Vec.of(length, width, 0.1), init_pos, init_angle);
        this.color = game.arena_deep_grey;
        if (rand_int(0, 2))
            this.color = game.arena_deeper_grey;
    }

    draw(graphics_state) {
        this.game.shapes.box.draw(graphics_state, this.matrix.times(Mat4.scale(this.collision_box)), this.color);
    }

}

// Room elements
class Room_Base extends Idle_Object {
    constructor(game, init_pos) {
        super(game, Vec.of(0, 0, 0), init_pos, 0);
    }

    draw(graphics_state) {
        this.game.shapes.box.draw(graphics_state, this.matrix.times(Mat4.scale(Vec.of(20, .1, 20))), this.game.arena_deeper_grey);
    }
}

class Pillar extends Idle_Object {
    constructor(game, init_pos, sections) {
        super(game, Vec.of(0.8, sections * 1.4 + 1, 0.8), Vec.of(init_pos[0], sections * 1.4 + 1, init_pos[2]), 0);
        this.base_pos = init_pos;
        this.sections = sections;
    }

    draw(graphics_state) {
        if (this.sections == 3)
            this.game.shapes.pillar_3.draw(graphics_state, Mat4.translation(this.base_pos), this.game.arena_grey);
        if (this.sections == 4)
            this.game.shapes.pillar_4.draw(graphics_state, Mat4.translation(this.base_pos), this.game.arena_grey);

    }
}

// Buffs
class Salve extends Idle_Object {
    constructor(game, init_pos) {
        super(game, Vec.of(1.5, 1.5, 1.5), init_pos, 0);
    }

    draw(graphics_state) {
        this.animate_counter += this.game.dt * 5;
        let rotate = Mat4.rotation(2 * Math.PI / 100 * this.animate_counter, Vec.of(0, 1, 0));
        this.game.shapes.heart.draw(graphics_state, this.matrix.times(rotate).times(Mat4.scale(Vec.of(0.5, 0.5, 0.5))), this.game.heart_red);
        if (this.animate_counter == 99) {
            this.animate_counter = 0;
        }
    }

    hit_by(object) {
        if (object.type == "player") {
            object.hp += 35;
            object.hp = Math.min(object.hp, object.max_health);
            this.hp = 0;
        }
    }
}

class Spell_Shield extends Idle_Object {
    constructor(game, init_pos) {
        super(game, Vec.of(1.5, 1.5, 1.5), init_pos, 0);
    }

    draw(graphics_state) {
        this.animate_counter += this.game.dt * 5;
        let rotate = Mat4.rotation(2 * Math.PI / 100 * this.animate_counter, Vec.of(0, 1, 0));
        let translate = Mat4.translation(Vec.of(0, -0.5, 0));
        this.game.shapes.shield.draw(graphics_state, this.matrix.times(rotate).times(translate).times(Mat4.scale(Vec.of(0.7, 0.7, 0.7))), this.game.shield_blue);
        translate = Mat4.translation(Vec.of(0, -0.5, 0.4));
        this.game.shapes.shield.draw(graphics_state, this.matrix.times(rotate).times(translate).times(Mat4.scale(Vec.of(0.5, 0.5, 0.1))), this.game.shield_blue);

        if (this.animate_counter == 99) {
            this.animate_counter = 0;
        }
    }

    hit_by(object) {
        if (object.type == "player") {
            object.buffs["Shield"] = 1500;
            this.hp = 0;
        }
    }

}
