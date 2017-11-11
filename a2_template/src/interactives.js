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
    }
}
