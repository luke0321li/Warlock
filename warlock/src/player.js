class Player extends Moving_Object {
    constructor(game) {
        super(game, 200, Vec.of(1.5, 1.5, 1.5), Vec.of(0, 1.8, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), 0, 0, 0, 5);
        Object.assign(this, {
            type: "player",
            weapon: "Fire_Bolt",
            is_firing: false,
            fire_counter: 0,
            nuke_counter: 0,
            is_damaged: false,
            damage_counter: 0,
            max_health: 200,
        })
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
        this.game.shapes.box.draw(graphics_state, player_matrix.times(Mat4.scale(Vec.of(1, 1.5, 1))), color);
        this.game.shapes.wizard_hat.draw(graphics_state, player_matrix.times(Mat4.translation(Vec.of(0, 1.7, 0))), color);
    }

    fire() {
        if (this.is_firing && this.fire_counter < 0) {
            if (this.weapon == "Fire_Bolt")
                this.game.object_list.push(new Fire_Bolt(this.game, this));
            else if (this.weapon == "Nuke") {
                this.game.object_list.push(new Nuke(this.game, this));
            }
            this.fire_counter = 10;
        }
    }

    move(dt) {
        super.move(dt);
        this.damage_counter -= 1;
        this.fire_counter -= 1;
        this.nuke_counter -= 1;
        if (!this.damage_counter)
            this.is_damaged = false;
        if (!this.nuke_counter)
            this.weapon = "Fire_Bolt";
        this.fire();
    }
}
