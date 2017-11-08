class Game_Object // Base class for player, mobs, items and projectiles etc.
{
    constructor(game, hp, collision_box, init_pos, init_angle, type) {
        this.game = game;
        this.hp = hp;
        this.collision_box = collision_box;
        this.pos = Vec.of(init_pos[0], init_pos[1], init_pos[2]);
        this.type = type;
        this.angle = init_angle;
    }

    is_alive() {
        return (this.hp > 0);
    }

    draw(graphics_state) {}
    move(dt) {}
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
        this.length = length;
    }

    draw(graphics_state) {
        let trans = this.matrix.times(Mat4.scale(this.collision_box));
        this.game.shapes.box.draw(graphics_state, trans, this.game.arena_grey);
    }
}

class Room_base extends Idle_Object {
    constructor(game, init_pos) {
        super(game, Vec.of(0, 0, 0), init_pos, 0);
    }

    draw(graphics_state) {
        this.game.shapes.box.draw(graphics_state, this.matrix.times(Mat4.scale(Vec.of(20, .1, 20))), this.game.arena_dark);
    }
}

class Pillar extends Idle_Object {
    constructor(game, init_pos, sections, init_angle) {
        super(game, Vec.of(2.5, sections * 2.5, 2.5), init_pos, init_angle);
        this.sections = sections;
    }

    draw(graphics_state) {
        // this.game.shapes.box.draw(graphics_state, this.matrix.times(Mat4.scale(this.collision_box)), this.game.arena_grey);
        let move_up = Mat4.translation(Vec.of(0, 2.5, 0));
        let small_section = Mat4.scale([1.3, 0.5, 1.3]);
        let large_section = Mat4.scale([1.5, 2, 1.5]);
        let cur_pos = this.matrix;
        for (var i = 0; i < this.sections; i++) {
            this.game.shapes.box.draw(graphics_state, cur_pos.times(large_section), this.game.arena_grey);
            cur_pos = cur_pos.times(move_up);
            this.game.shapes.box.draw(graphics_state, cur_pos.times(small_section), this.game.arena_grey);
            cur_pos = cur_pos.times(move_up);
        }
    }
}
