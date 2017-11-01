class Game_Object // Base class for player, mobs, items and projectiles etc.
{
    constructor(game, hp, collision_box, init_pos, type) {
        // game.object_list.push(this);
        this.game = game;
        this.hp = hp;
        this.collision_box = collision_box;
        this.pos = Vec.of(init_pos[0], init_pos[1], init_pos[2]);
        this.type = type;
    }

    kill() {
        this.hp = 0;
    }

    is_alive() {
        return (this.hp > 0);
    }
    
    draw(graphics_state) {}
}

class Moving_Object extends Game_Object {
    constructor(game, hp, collision_box, init_pos, init_a, init_v, init_alpha, init_omega, init_angle, v_cap)
    {
        super(game, hp, collision_box, init_pos, "moving");
        this.a = init_a;
        this.v = init_v;
        this.alpha = init_alpha;
        this.omega = init_omega;
        this.angle = init_angle;
        this.v_cap = v_cap;
    }
    
    move(dt)
    {
        this.omega = this.omega + (this.alpha * (dt));
        this.angle = this.angle + (this.omega * (dt));
        this.v = this.v.plus(this.a.times(dt));
        if (this.v.norm() >= this.v_cap)
            this.v = this.v.normalized().times(this.v_cap);
        let r_1 = Vec.of(Math.cos(this.angle), 0, Math.sin(this.angle));
        let r_2 = Vec.of(-1 * Math.sin(this.angle), 0, Math.cos(this.angle));
        let v_alter = Vec.of(this.v.dot(r_1), this.v[1], this.v.dot(r_2));
        this.pos = this.pos.plus(v_alter.times(dt));
    }
}

class Projectile extends Moving_Object {
     constructor(game, source, speed, minus_hp) {
        super(game, 20, Vec.of(1, 1, 1), source.pos, Vec.of(0, 0, 0), Vec.of(0, 0, -1 * speed), 0, 0, source.angle, speed);
        this.minus_hp = minus_hp;
    }
    
    move(dt)
    {
        super.move(dt);
        this.hp -= this.minus_hp;
    }
}

class Fire_bolt extends Projectile {
    constructor(game, source) {
        super(game, source, 10, 1)
    }

    draw(graphics_state) {
        let mat = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, mat.times(Mat4.scale([.2, .2, .2])), this.game.rand_1);
    }
}

class Player extends Moving_Object {
    constructor(game) {
        super(game, 100, Vec.of(2, 2, 2), Vec.of(0, 2.1, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), 0, 0, 0, 5);
    }
    
    draw(graphics_state) {
        let player_matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, player_matrix.times(Mat4.scale([1, 1.7, 1])), this.game.rand_1);
    }
}

