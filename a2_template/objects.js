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

    kill() {
        this.hp = 0;
    }

    is_alive() {
        return (this.hp > 0);
    }

    draw(graphics_state) {}
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
    constructor(game, init_pos, height, init_angle) {
        super(game, Vec.of(2.5, height, 2.5), init_pos, init_angle);
    }

    draw(graphics_state) {
        this.game.shapes.box.draw(graphics_state, this.matrix.times(Mat4.scale(this.collision_box)), this.game.arena_grey);
    }
}

class Moving_Object extends Game_Object {
    constructor(game, hp, collision_box, init_pos, init_a, init_v, init_alpha, init_omega, init_angle, v_cap) {
        super(game, hp, collision_box, init_pos, init_angle, "moving");
        this.a = init_a;
        this.v = init_v;
        this.alpha = init_alpha;
        this.omega = init_omega;
        this.v_cap = v_cap;
        this.last_free_loc = init_pos;
    }

    move(dt) {
        this.omega = this.omega + (this.alpha * (dt));
        this.angle = this.angle + (this.omega * (dt));
        this.v = this.v.plus(this.a.times(dt));
        if (this.v.norm() >= this.v_cap)
            this.v = this.v.normalized().times(this.v_cap);
        let r_1 = Vec.of(Math.cos(this.angle), 0, Math.sin(this.angle));
        let r_2 = Vec.of(-1 * Math.sin(this.angle), 0, Math.cos(this.angle));
        let v_alter = Vec.of(this.v.dot(r_1), this.v[1], this.v.dot(r_2));

        // Collision check
        let old_pos = this.pos;
        this.pos = this.pos.plus(v_alter.times(dt));
        let sides = [-1, 1];
        for (var i in this.game.object_list) {
            if (this.game.object_list[i].type == "idle" && this.collide_with(this.game.object_list[i])) {
                this.pos = this.last_free_loc;
                return;
            }
        }
        this.last_free_loc = this.pos;
        this.a = Vec.of(0, 0, 0);
    }

    collide_with(game_object) {
        if (this === game_object)
            return false;
        let other_pos = game_object.pos;
        let cosine = Math.cos(-1 * game_object.angle);
        let sine = Math.sin(-1 * game_object.angle);
        let cur_pos = [this.pos[0] * cosine + this.pos[2] * sine, this.pos[1], -1 * this.pos[0] * sine + this.pos[2] * cosine];
        other_pos = [other_pos[0] * cosine + other_pos[2] * sine, other_pos[1], -1 * other_pos[0] * sine + other_pos[2] * cosine];
        let other_box = game_object.collision_box;
        let collide = true;
        for (let i = 0; i < 3; i++)
            collide &= (Math.abs(cur_pos[i] - other_pos[i]) < (this.collision_box[i] + other_box[i]));
        return collide;
    }
}

class Projectile extends Moving_Object {
    constructor(game, source, speed, minus_hp) {
        super(game, 20, Vec.of(1, 1, 1), source.pos, Vec.of(0, 0, 0), Vec.of(0, 0, -1 * speed), 0, 0, source.angle, speed);
        this.minus_hp = minus_hp;
    }

    move(dt) {
        this.omega = this.omega + (this.alpha * (dt));
        this.angle = this.angle + (this.omega * (dt));
        this.v = this.v.plus(this.a.times(dt));
        if (this.v.norm() >= this.v_cap)
            this.v = this.v.normalized().times(this.v_cap);
        let r_1 = Vec.of(Math.cos(this.angle), 0, Math.sin(this.angle));
        let r_2 = Vec.of(-1 * Math.sin(this.angle), 0, Math.cos(this.angle));
        let v_alter = Vec.of(this.v.dot(r_1), this.v[1], this.v.dot(r_2));

        // Collision check
        this.pos = this.pos.plus(v_alter.times(dt));
        let sides = [-1, 1];
        for (var i in this.game.object_list) {
            if (this.game.object_list[i].type != "player" && this.collide_with(this.game.object_list[i])) {
                this.hp = 0;
                return;
            }
        }
        this.a = Vec.of(0, 0, 0)
        this.hp -= this.minus_hp;
    }
}

class Fire_Bolt extends Projectile {
    constructor(game, source) {
        super(game, source, 10, 1);
        let fluctuation = rand_num(-1, 1);
        let cosine = Math.cos(source.angle);
        let sine = Math.sin(source.angle);
        this.pos = this.pos.plus(Vec.of(fluctuation * cosine, 0, -1 * fluctuation * sine));
    }

    draw(graphics_state) {
        let mat = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, mat.times(Mat4.scale([.2, .2, .2])), this.game.rand_1);
    }
}

class Player extends Moving_Object {
    constructor(game) {
        super(game, 100, Vec.of(1, 1.7, 1), Vec.of(0, 2.1, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), 0, 0, 0, 5);
        this.type = "player"
    }

    draw(graphics_state) {
        let player_matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, player_matrix.times(Mat4.scale([1, 1.7, 1])), this.game.rand_1);
    }
}
