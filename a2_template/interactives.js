// Definitions for base classes of moving objects

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

    attempt_move(dt) {
        if (this.pos[1] > (0.11 + this.collision_box[1]))
            this.a = this.a.plus(Vec.of(0, -0.5, 0));
        this.omega = this.omega + (this.alpha * (dt));
        this.angle = this.angle + (this.omega * (dt));
        this.v = this.v.plus(this.a.times(dt));
        if (this.v.norm() >= this.v_cap)
            this.v = this.v.normalized().times(this.v_cap);
        let r_1 = Vec.of(Math.cos(this.angle), 0, Math.sin(this.angle));
        let r_2 = Vec.of(-1 * Math.sin(this.angle), 0, Math.cos(this.angle));
        let v_new = Vec.of(this.v.dot(r_1), this.v[1], this.v.dot(r_2));
        this.a = Vec.of(0, 0, 0);
        return v_new;
    }

    move(dt) {
        let v_new = this.attempt_move(dt);
        let old_pos = this.pos;
        this.pos = this.pos.plus(v_new.times(dt));
        if (this.pos[1] < (0.1 + this.collision_box[1])) {
            this.pos[1] = 0.1 + this.collision_box[1];
        }
        let sides = [-1, 1];
        for (var i in this.game.object_list) {
            if (this.game.object_list[i].type != "projectile" && this.collide_with(this.game.object_list[i])) {
                this.pos = this.last_free_loc;
                return false;
            }
        }
        this.last_free_loc = this.pos;
        return true;
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
    constructor(game, source, collision_box, init_v, damage, diminish, num_particles, particle_size) {
        super(game, 20, collision_box, source.pos, Vec.of(0, 0, 0), init_v, 0, 0, source.angle, 999);
        this.damage = damage;
        this.diminish = diminish;
        this.type = "projectile";
        this.num_particles = num_particles;
        this.particle_size = particle_size;
    }

    move(dt) {
        let v_new = this.attempt_move(dt);
        // Collision check, projectile deals damage and diminishes after hitting non-player objects
        this.pos = this.pos.plus(v_new.times(dt));
        if (this.pos[1] < (0.1 + this.collision_box[1])) {
            this.hp = 0;
            this.create_particles();
            this.on_hit();
            return false;
        }
        let sides = [-1, 1];
        for (var i in this.game.object_list) {
            if ((this.game.object_list[i].type == "mob" || this.game.object_list[i].type == "idle") && this.collide_with(this.game.object_list[i])) {
                this.hp = 0;
                if (this.game.object_list[i].type == "mob") {
                    this.game.object_list[i].hp -= this.damage;
                }
                this.create_particles();
                this.on_hit();
                return false;
            }
        }
        this.a = Vec.of(0, 0, 0)
        this.hp -= this.diminish;
        return true;
    }

    create_particles() {
        if (this.num_particles) {
            for (var i = 0; i < this.num_particles; i++)
                this.game.object_list.push(new Particle(this.game, this, this.particle_size));
        }
    }
    
    draw(graphics_state) {
        let mat = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, mat.times(Mat4.scale(this.collision_box)), this.game.rand_1);
    }
    
    on_hit() {}
}

class Particle extends Projectile {
    constructor(game, source, size) {
        super(game, source, Vec.of(size, size, size), Vec.of(rand_num(-3, 3), rand_num(-3, 3), rand_num(-5, 5)), 0, 2, 0, 0);
        this.angle += Math.PI / 2; // Bounces off;
        this.size = size;
    }
}

class Fire_Bolt extends Projectile {
    constructor(game, source) {
        super(game, source, Vec.of(0.4, 0.4, 0.4), Vec.of(0, 1, -10), 10, 0.5, 7, 0.3);
        let fluctuation = rand_num(-1, 1);
        let cosine = Math.cos(source.angle);
        let sine = Math.sin(source.angle);
        this.pos = this.pos.plus(Vec.of(fluctuation * cosine, 0, -1 * fluctuation * sine));
    }
}

class Nuke extends Projectile {
    constructor(game, source) {
        super(game, source, Vec.of(0.7, 0.7, 0.7), Vec.of(0, 2, -3), 25, 0.25, 15, .3);
    }
}

class Player extends Moving_Object {
    constructor(game) {
        super(game, 100, Vec.of(1, 1.7, 1), Vec.of(0, 1.8, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), 0, 0, 0, 5);
        this.type = "player";
    }

    draw(graphics_state) {
        let player_matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, player_matrix.times(Mat4.scale([1, 1.7, 1])), this.game.rand_1);
    }
}

class Mob extends Moving_Object {
    constructor(game, init_pos) {
        super(game, 50, Vec.of(0.8, 1.5, 0.8), init_pos, Vec.of(0, 0, 0), Vec.of(1, 0, 0), 0, 0, rand_num(0, Math.PI * 2), 3);
        this.type = "mob";
        this.distance_counter = 0;
        this.attempted_distance = rand_num(1, 10);
    }

    move(dt) {
        let old_pos = this.pos;
        if (super.move(dt)) {
            this.distance_counter += this.pos.minus(old_pos).norm();
            if (this.distance_counter >= this.attempted_distance) {
                this.angle = rand_num(0, Math.PI * 2);
                this.attempted_distance = rand_num(1, 10);
                this.distance_counter = 0;
            }
        } else {
            this.angle += Math.PI / 2;
            return false;
        }

        return true;
    }

    draw(graphics_state) {
        let mob_matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, mob_matrix.times(Mat4.scale(this.collision_box)), this.game.test);
    }

}
