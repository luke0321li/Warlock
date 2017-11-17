class Player extends Moving_Object {
    constructor(game) {
        super(game, 200, Vec.of(1.5, 2, 1.5), Vec.of(0, 2.1, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), 0, 0, 0, 5);
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
        this.damage_counter = 7;
    }
    
    draw_body(graphics_state, body_color, arm_color, head_color)
    {
        let player_matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        let color = this.game.mage;
        if (this.is_damaged)
            color = this.game.damaged;
        player_matrix = player_matrix.times(Mat4.translation(Vec.of(0, -1, 0)));
        // Body
        this.game.shapes.box.draw(graphics_state, player_matrix, body_color);
        // Arms
        let sides = [-1, 1];
        let arm_scale = Mat4.scale(Vec.of(0.2, 0.7, 0.4));
        let arm_displacement = Mat4.translation(Vec.of(0, -0.7, 0));
        let shoulder_loc = Mat4.translation(Vec.of(0, 0.4, 0));
        // Arms swing when walking and attacking
        for (var i in sides) {
            let arm_hinge = Mat4.translation(Vec.of(1.2 * sides[i], 0, 0));
            if (this.fire_counter >= 0 && sides[i] == 1) {
                if (this.is_firing)
                    arm_hinge = arm_hinge.times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0)));
                else 
                    arm_hinge = arm_hinge.times(Mat4.rotation(this.fire_counter * 0.5 / 15 * Math.PI, Vec.of(1, 0, 0)));
            }
            
            else if (this.v.norm() > 0) {
                arm_hinge = arm_hinge.times(Mat4.rotation(Math.sin(this.animate_counter * 0.02 * Math.PI) * sides[i], Vec.of(1, 0, 0)));
                this.animate_counter += this.game.dt * 5;
                if (this.animate_counter == 99)
                    this.animate_counter = 0;
            }
            
            else
                this.animate_counter = 0;
            this.game.shapes.box.draw(graphics_state, player_matrix.times(shoulder_loc).times(arm_hinge).times(arm_displacement).times(arm_scale), arm_color);
        }
        // Head
        player_matrix = player_matrix.times(Mat4.translation(Vec.of(0, 2, 0)));
        this.game.shapes.box.draw(graphics_state, player_matrix, head_color);
        return player_matrix;
    }
    
    draw(graphics_state) {
        // Wizard Eyes
        let body_color = this.game.mage;
        let arm_color = this.game.mage;
        let head_color = this.game.arena_dark;
        let hat_color = this.game.mage;
        if (this.is_damaged) {
            body_color = this.game.damaged;
            arm_color = this.game.damaged;
            head_color = this.game.damaged;
            hat_color = this.game.damaged;
        }
        let player_matrix = this.draw_body(graphics_state, body_color, arm_color, head_color);
        let eye_transform = Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0)).times(Mat4.scale(Vec.of(0.2, 0.01, 0.2)));
        let sides = [-1, 1];
        for (var i in sides) {
            this.game.shapes.box.draw(graphics_state, player_matrix.times(Mat4.translation(Vec.of(0.5 * sides[i], 0, -1.125))).times(eye_transform), this.game.bright);
        }
        player_matrix = player_matrix.times(Mat4.translation(Vec.of(0, 1.2, 0)));
        this.game.shapes.wizard_hat.draw(graphics_state, player_matrix, hat_color); // Hat

    }

    fire() {
        if (this.is_firing && this.fire_counter < 0) {
            if (this.weapon == "Fire_Bolt")
                this.game.object_list.push(new Fire_Bolt(this.game, this));
            else if (this.weapon == "Nuke") {
                this.game.object_list.push(new Nuke(this.game, this));
            }
            this.fire_counter = 15;
        }
    }

    move(dt) {
        super.move(dt);
        this.damage_counter -= dt * 10;
        this.fire_counter -= dt * 10;
        this.nuke_counter -= dt * 10;
        if (this.damage_counter <= 0)
            this.is_damaged = false;
        if (this.nuke_counter <= 0)
            this.weapon = "Fire_Bolt";
        this.fire();
    }
}
