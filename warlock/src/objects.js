class Game_Object // Base class for player, mobs, items and projectiles etc.
{
    constructor(game, hp, collision_box, init_pos, init_angle, type) {
        Object.assign(this, {
            game: game,
            hp: hp,
            collision_box: collision_box,
            pos: Vec.of(init_pos[0], init_pos[1], init_pos[2]),
            angle: init_angle,
            type: type
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
        this.hp -= num;
    }
    
    move(dt) {}
    draw(graphics_state) {}
    on_death() {} // Do something when it is dead
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

class Room_Base extends Idle_Object {
    constructor(game, init_pos) {
        super(game, Vec.of(0, 0, 0), init_pos, 0);
    }

    draw(graphics_state) {
        this.game.shapes.box.draw(graphics_state, this.matrix.times(Mat4.scale(Vec.of(20, .1, 20))), this.game.arena_dark);
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
