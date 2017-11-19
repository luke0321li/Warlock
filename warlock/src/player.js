class Player extends Moving_Object {
    constructor(game) {
        super(game, 200, Vec.of(1.5, 2, 1.5), Vec.of(0, 2.1, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), 0, 0, 0, 5);
        Object.assign(this, {
            type: "player",
            weapon: "Fire_Bolt",
            is_firing: false,
            fire_counter: 0,
            buffs: {},
            is_damaged: false,
            damage_counter: 0,
            max_health: 200,
        })
    }

    take_damage(num) {
        if (this.buffs["Shield"] > 0)
            num -= 9;
        super.take_damage(num);
        this.is_damaged = true;
        this.damage_counter = 7;
    }

    draw_buffs(graphics_state, location) {
        if (this.weapon == "Nuke") {
            let orbit_loc = Mat4.translation(Vec.of(2, 0, 0));
            let transform = location.times(Mat4.rotation(this.buffs["Nuke"] / 50, Vec.of(0, 1, 0)))
            let scale = Mat4.scale(Vec.of(0.3, 0.3, 0.3));
            this.game.shapes.box.draw(graphics_state, transform.times(orbit_loc).times(scale), this.game.bright);
            this.game.shapes.box.draw(graphics_state, transform.times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0))).times(orbit_loc).times(scale), this.game.bright);
        }
        
        if (this.buffs["Shield"] > 0) {
            let color = this.game.shield_idle;
            if (this.is_damaged)
                color = this.game.shield_active;
            let orbit_loc = Mat4.translation(Vec.of(1.75, 1, 0));
            let transform = location.times(Mat4.rotation(this.buffs["Shield"] / 50, Vec.of(0, 1, 0)));
            let rotate = Mat4.rotation(Math.PI / 2, Vec.of(0, 1, 0))
            this.game.shapes.shield.draw(graphics_state, transform.times(orbit_loc).times(rotate).times(Mat4.scale(Vec.of(1, 1, 0.3))), color);
        }
    }

    draw_body(graphics_state, body_color, arm_color, head_color) {
        let player_matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        player_matrix = player_matrix.times(Mat4.translation(Vec.of(0, -1, 0)));
        // Body
        this.game.shapes.box.draw(graphics_state, player_matrix, body_color);
        // Buffs, if any
        this.draw_buffs(graphics_state, player_matrix);
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
            } else if (this.v.norm() > 0) {
                arm_hinge = arm_hinge.times(Mat4.rotation(Math.sin(this.animate_counter * 0.02 * Math.PI) * sides[i], Vec.of(1, 0, 0)));
                this.animate_counter += this.game.dt * 5;
                if (this.animate_counter == 99)
                    this.animate_counter = 0;
            } else
                this.animate_counter = 0;
            this.game.shapes.box.draw(graphics_state, player_matrix.times(shoulder_loc).times(arm_hinge).times(arm_displacement).times(arm_scale), arm_color);
        }
        // Head
        player_matrix = player_matrix.times(Mat4.translation(Vec.of(0, 2, 0)));
        this.game.shapes.box.draw(graphics_state, player_matrix, head_color);
        return player_matrix;
    }

    draw(graphics_state) {
        let body_color = this.game.mage;
        let arm_color = this.game.mage;
        let head_color = this.game.arena_black;
        let hat_color = this.game.mage;
        if (this.is_damaged) {
            body_color = this.game.damaged;
            arm_color = this.game.damaged;
            head_color = this.game.damaged;
            hat_color = this.game.damaged;
        }

        let player_matrix = this.draw_body(graphics_state, body_color, arm_color, head_color);

        // Eyes
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
        for (let i in this.buffs)
            this.buffs[i] -= dt * 10;
        if (this.damage_counter <= 0)
            this.is_damaged = false;
        if (this.buffs["Nuke"] <= 0)
            this.weapon = "Fire_Bolt";
        this.fire();
    }
    
    on_death() {
        this.create_particles(8, 0.5, this.game.mage);
    }
}
