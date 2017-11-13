// Definitions for base classes of moving objects
class Moving_Object extends Game_Object {
    constructor(game, hp, collision_box, init_pos, init_a, init_v, init_alpha, init_omega, init_angle, v_cap) {
        super(game, hp, collision_box, init_pos, init_angle, "moving");
        Object.assign(this, {
            a: init_a,
            v: init_v,
            alpha: init_alpha,
            omega: init_omega,
            v_cap: v_cap,
            last_free_loc: init_pos
        })
    }

    attempt_move(dt) // Updates velocity, angular velocity and angle; returns the new velocity using explicit euler
    {
        if (this.pos[1] > (0.11 + this.collision_box[1]))
            this.a = this.a.plus(Vec.of(0, -0.5, 0));
        this.omega = this.omega + (this.alpha * (dt));
        this.angle = this.angle + (this.omega * (dt));
        this.v = this.v.plus(this.a.times(dt));
        if (this.v.norm() >= this.v_cap)
            this.v = this.v.normalized().times(this.v_cap);
        this.a = Vec.of(0, 0, 0);
        let v_new = rotate_vec(this.v, this.angle);
        return v_new;
    }

    move(dt) // Updates position based on the result of attempt_move
    {
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

    collide_with(game_object) // Returns true if this collides with game_object
    {
        if (this === game_object)
            return false;
        let other_pos = game_object.pos;
        let cur_pos = rotate_vec(this.pos, -1 * game_object.angle);
        other_pos = rotate_vec(other_pos, -1 * game_object.angle);
        let other_box = game_object.collision_box;
        let collide = true;
        for (let i = 0; i < 3; i++)
            collide &= (Math.abs(cur_pos[i] - other_pos[i]) < (this.collision_box[i] + other_box[i]));
        return collide;
    }
}

class Projectile extends Moving_Object {
    constructor(game, source, collision_box, init_v, diminish) {
        super(game, 20, collision_box, source.pos, Vec.of(0, 0, 0), init_v, 0, 0, source.angle, 999);
        this.diminish = diminish;
        this.type = "projectile";
    }

    move(dt) {
        let v_new = this.attempt_move(dt);
        // Collision check, projectile deals damage and diminishes after hitting non-player objects
        this.pos = this.pos.plus(v_new.times(dt));
        if (this.pos[1] < (0.1 + this.collision_box[1])) {
            this.on_hit(0);
            return false;
        }
        let sides = [-1, 1];
        for (var i in this.game.object_list) {
            let type = this.game.object_list[i].type
            if ((type == "mob" || type == "idle" || type == "destructable") && this.collide_with(this.game.object_list[i])) {
                this.on_hit(this.game.object_list[i]);
                return false;
            }
        }
        this.a = Vec.of(0, 0, 0)
        this.hp -= this.diminish;
        return true;
    }

    draw(graphics_state) {
        let mat = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, mat.times(Mat4.scale(this.collision_box)), this.game.rand_1);
    }

    on_hit(target) {} // Do something when the projectile collides with another object
}

class Particle extends Projectile {
    constructor(game, source, size, color) {
        super(game, source, Vec.of(0, 0, 0), Vec.of(rand_num(-3, 3), rand_num(-3, 3), rand_num(-5, 5)), 1.5);
        this.angle += Math.PI / 2; // Bounces off;
        this.size = size;
        this.color = color;
    }

    on_hit(target) {
        this.hp = 0;
    }

    draw(graphics_state) {
        let mat = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, mat.times(Mat4.scale(Vec.of(this.size, this.size, this.size))), this.color);
    }
}

class Fire_Bolt extends Projectile {
    constructor(game, source) {
        super(game, source, Vec.of(0.4, 0.4, 0.4), Vec.of(0, 1, -10), 0.5);
        let fluctuation = rand_num(-1, 1);
        let cosine = Math.cos(source.angle);
        let sine = Math.sin(source.angle);
        this.pos = this.pos.plus(Vec.of(fluctuation * cosine, 0, -1 * fluctuation * sine));
    }

    on_hit(target) {
        this.create_particles(5, 0.25, this.game.rand_1)
        if (target) {
            if (target.type == "mob" || target.type == "destructable") {
                target.take_damage(20);
            }
        }
        this.hp = 0;
    }
}

/* class Nuke extends Projectile {
    constructor(game, source) {
        super(game, source, Vec.of(0.7, 0.7, 0.7), Vec.of(0, 2, -3), 0.25);
    }

    on_hit(target) {
        this.create_particles(12, 0.4, this.game.rand_1)
        if (target) {
            if (target.type == "mob") {
                target.hp -= 40;
            }
            this.hp = 0;
        }
    }
} */
