class Destructable extends Game_Object {
    constructor(game, hp, collision_box, init_pos, init_angle) {
        super(game, hp, collision_box, init_pos, init_angle, "destructable");
        this.matrix = Mat4.translation(this.pos).times(Mat4.rotation(init_angle, Vec.of(0, 1, 0)));
    }
}

class Crate extends Destructable {
    constructor(game, init_pos, size, init_angle) {
        super(game, 35, Vec.of(1, 1, 1).times(size), init_pos, init_angle);
        this.size = size;
    }

    draw(graphics_state) {
        this.game.shapes.crate.draw(graphics_state, this.matrix.times(Mat4.scale(Vec.of(1, 1, 1).times(this.size))), this.game.brown);
    }

    on_death() {
        this.create_particles(3, this.size * 0.5, this.game.brown);
        if (!rand_int(0, 4))
            this.game.object_list.push(new Salve(this.game, this.pos.plus(Vec.of(0, 0.5, 0))));
    }
}

class Urn extends Destructable {
    constructor(game, init_pos, size, init_angle) {
        super(game, 35, Vec.of(1, 2.5, 1).times(size), init_pos, init_angle);
        this.size = size;
        this.color = this.game.urn_brown;
        if (!rand_int(0, 3))
            this.color = this.game.grey;
    }

    draw(graphics_state) {
        this.game.shapes.urn.draw(graphics_state, this.matrix.times(Mat4.scale(Vec.of(1, 1, 1).times(this.size))), this.color);
    }

    on_death() {
        this.create_particles(4, this.size * 0.35, this.color);
        if (!rand_int(0, 4))
            this.game.object_list.push(new Salve(this.game, this.pos.plus(Vec.of(0, 0.5, 0))));
    }
}

class Goblet extends Destructable {
    constructor(game, init_pos) {
        super(game, 80, Vec.of(1, 3, 1), init_pos, 0);
    }

    draw(graphics_state) {
        this.game.shapes.goblet.draw(graphics_state, this.matrix, this.game.arena_black);
        this.animate_counter += this.game.dt * 5;
        let time = 0.04 * Math.PI / 2 * this.animate_counter;
        let transform = this.matrix.times(Mat4.translation(Vec.of(0, 2.5 + 0.3 * Math.sin(time), 0)));
        let p_1 = transform.times(Mat4.rotation(time, Vec.of(0, 1, 1))).times(Mat4.translation(Vec.of(0.6, 0, 0)));
        let p_2 = transform.times(Mat4.rotation(time, Vec.of(1, 0, 1))).times(Mat4.translation(Vec.of(-0.9, 0, 0)));
        let p_3 = transform.times(Mat4.rotation(time, Vec.of(1, 1, 0))).times(Mat4.translation(Vec.of(0.5, 0, 0)))
        if (this.animate_counter == 99)
            this.animate_counter = 0;
        this.game.shapes.box.draw(graphics_state, transform.times(Mat4.scale(Vec.of(0.3, 0.3, 0.3))), this.game.bright);
        this.game.shapes.box.draw(graphics_state, p_1.times(Mat4.scale(Vec.of(0.15, 0.15, 0.15))), this.game.bright);
        this.game.shapes.box.draw(graphics_state, p_2.times(Mat4.scale(Vec.of(0.15, 0.15, 0.15))), this.game.bright);
        this.game.shapes.box.draw(graphics_state, p_3.times(Mat4.scale(Vec.of(0.15, 0.15, 0.15))), this.game.bright);
    }

    on_death() {
        this.create_particles(5, 0.5, this.game.arena_dark);
        this.create_particles(7, 0.3, this.game.bright);
        this.game.player.weapon = "Nuke";
        this.game.player.nuke_counter = 750;
    }
}
