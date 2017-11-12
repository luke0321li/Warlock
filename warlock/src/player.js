class Player extends Moving_Object {
    constructor(game) {
        super(game, 9999, Vec.of(1, 1.7, 1), Vec.of(0, 1.8, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), 0, 0, 0, 5);
        this.type = "player";
        this.weapon = "Fire_Bolt";
        this.is_firing = false;
        this.is_damaged = false;
        this.damage_counter = 0;
        this.max_health = 9999;
    }

    take_damage(num) {
        super.take_damage(num);
        this.is_damaged = true;
        this.damage_counter = 5;
    }
    
    draw(graphics_state) {
        let player_matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        let color = this.game.rand_1;
        if (this.is_damaged)
            color = this.game.damaged;
        this.game.shapes.box.draw(graphics_state, player_matrix.times(Mat4.scale([1, 1.7, 1])), color);
    }
    
    move(dt) {
        super.move(dt);
        this.damage_counter -= 1;
        if (!this.damage_counter)
            this.is_damaged = false;
        if (this.is_firing)
        {
            
        }
    }
}