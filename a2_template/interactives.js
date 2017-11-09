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
        this.game.shapes.box.draw(graphics_state, this.matrix.times(Mat4.scale(Vec.of(0.8, 0.8, 0.8).times(this.size))), this.game.brown);
        let sides = [-1, 1];
        for (let i in sides) {
            let left_trans = this.matrix.times(Mat4.translation(Vec.of(-0.9, sides[i] * 0.9, 0).times(this.size)));
            let right_trans = this.matrix.times(Mat4.translation(Vec.of(0.9, sides[i] * 0.9, 0).times(this.size)));
            let top_trans = this.matrix.times(Mat4.translation(Vec.of(0, sides[i] * 0.9, -0.9).times(this.size)));
            let bot_trans = this.matrix.times(Mat4.translation(Vec.of(0, sides[i] * 0.9, 0.9).times(this.size)));
            
            let left_scale = Mat4.scale(Vec.of(0.1, 0.1, 1).times(this.size));
            let top_scale = Mat4.scale(Vec.of(0.8, 0.1, 0.1).times(this.size));
            this.game.shapes.box.draw(graphics_state, left_trans.times(left_scale), this.game.brown);
            this.game.shapes.box.draw(graphics_state, right_trans.times(left_scale), this.game.brown);
            this.game.shapes.box.draw(graphics_state, top_trans.times(top_scale), this.game.brown);
            this.game.shapes.box.draw(graphics_state, bot_trans.times(top_scale), this.game.brown);
        }
        
        let side_trans = Mat4.translation(Vec.of(0.9, 0, 0.9).times(this.size));
        for (let i = 0; i < 4; i++) {
            let side_pos = this.matrix.times(Mat4.rotation(Math.PI / 2 * i, Vec.of(0, 1, 0))).times(side_trans);
            this.game.shapes.box.draw(graphics_state, side_pos.times(Mat4.scale(Vec.of(0.1, 0.8, 0.1).times(this.size))), this.game.brown);
        }
    }
}