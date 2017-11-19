// States: "roaming", "aggro", "rest", "turning"

class Mob extends Moving_Object {
    constructor(game, hp, collision_box, init_pos, roam_speed, aggro_speed, vision, attack_range, attack_dmg, attack_rate, difficulty) {
        super(game, hp, collision_box, Vec.of(init_pos[0], .1 + collision_box[1], init_pos[2]), Vec.of(0, 0, 0), Vec.of(roam_speed, 0, 0), 0, 0, rand_num(0, Math.PI * 2), aggro_speed);
        Object.assign(this, {
            type: "mob",
            roam_speed: roam_speed,
            vision: vision,
            distance_counter: 0,
            attempted_distance: rand_num(1, 10),
            rest_counter: 0,
            force_roam_counter: 5,
            state: "roaming",
            attack_range: attack_range,
            attack_dmg: attack_dmg,
            attack_rate: attack_rate,
            attack_counter: 0,
            difficulty: difficulty
        })
        this.game.mob_count += 1;
    }

    move(dt) {
        let player_pos = this.game.player.pos.minus(this.pos);
        this.v = Vec.of(0, 0, -1 * this.roam_speed);
        if (this.state == "roaming") // Random walk, turns to aggro state if player is in vision
        {
            let old_pos = this.pos;
            if (super.move(dt)) {
                this.distance_counter += this.pos.minus(old_pos).norm();
                this.forced_roam_counter -= 1;
                if (this.distance_counter >= this.attempted_distance) {
                    this.num_walls = 0;
                    this.distance_counter = 0;
                    this.angle = rand_num(0, Math.PI * 2);
                    this.attempted_distance = rand_num(1, 10);
                    this.rest_counter = rand_int(30, 55);
                    this.state = "rest";
                }
            } else // Blocked
                this.state = "turning";
            if (player_pos.norm() <= this.vision && this.forced_roam_counter <= 0)
                this.state = "aggro";
        } else if (this.state == "aggro") // Runs at player and attacks 
        {
            if (player_pos.norm() < this.attack_range) {
                if (this.attack_counter <= 0) {
                    this.game.player.take_damage(this.attack_dmg)
                    this.attack_counter = this.attack_rate;
                } else
                    this.attack_counter -= dt * 10;
                return true;
            }
            if (player_pos.norm() > this.vision) {
                this.state = "roaming";
                return true;
            }
            let player_pos_norm = player_pos.normalized();
            let cross = Vec.of(0, 0, -1).cross(player_pos_norm);
            let dot = Vec.of(0, 0, -1).dot(player_pos_norm);
            this.angle = Math.atan2(cross.norm(), dot);
            if (cross[1] < 0)
                this.angle *= -1;
            this.attempted_distance = player_pos.norm();
            this.a = Vec.of(0, 0, -1);
            if (!super.move(dt)) {
                this.state = "turning";
            }
        } else if (this.state == "rest") // Rest for a while
        {
            this.v = Vec.of(0, 0, 0);
            this.rest_counter -= 1;
            if (!this.rest_counter)
                this.state = "roaming";
            if (player_pos.norm() <= this.vision)
                this.state = "aggro";
        } else if (this.state == "turning") // Blocked, try to turn away
        {
            this.angle += Math.PI;
            this.distance_counter = 0;
            this.attempted_distance = 5;
            this.state = "detour";
        } else if (this.state == "detour") {
            this.v = Vec.of(0, 0, -1 * this.roam_speed);
            let old_pos = this.pos;
            let turn_again = false;
            if (super.move(dt)) {
                this.distance_counter += this.pos.minus(old_pos).norm();
                if (this.distance_counter >= this.attempted_distance)
                    turn_again = true;
            } else
                turn_again = true;
            if (turn_again) {
                let direction = 1;
                if (rand_int(0, 2))
                    direction = -1;
                this.angle += Math.PI / 2 * direction;
                this.distance_counter = 0;
                this.attempted_distance = rand_num(2, 6);
                this.state = "roaming";
                this.forced_roam_counter = 7;
            }
        }

        return true;
    }

    draw(graphics_state) {
        if (this.state == "aggro") {
            let matrix = Mat4.translation(this.pos).times(Mat4.translation([0, this.collision_box[1] + 3, 0])).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
            matrix = matrix.times(Mat4.translation(Vec.of(0, 0.5 * Math.sin(graphics_state.animation_time / 50), 0)));
            this.game.shapes.aggro.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(0.3, 0.5, 0))), this.game.aggro_red);
        }
    }

    draw_arms(graphics_state, shoulder_loc, arm_scale, color) {
        let sides = [-1, 1];
        let arm_displacement = Mat4.translation(Vec.of(0, -1 * arm_scale[1], 0));
        shoulder_loc = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0))).times(shoulder_loc);
        for (var i in sides) {
            let arm_hinge = Mat4.translation(Vec.of((this.collision_box[0] + arm_scale[0]) * sides[i], 0, 0));
            if (this.state == "aggro")
            {
                let angle = Math.PI / 4 + Math.PI / 2 * Math.sin(this.attack_counter / this.attack_rate * Math.PI);
                if (this.attack_counter <= 0)
                    angle = Math.PI / 4;
                arm_hinge = arm_hinge.times(Mat4.rotation(angle, Vec.of(1, 0, 0)));
            }
            else if (this.v.norm() > 0) {
                arm_hinge = arm_hinge.times(Mat4.rotation(Math.sin(this.animate_counter * 0.02 * Math.PI) * sides[i], Vec.of(1, 0, 0)));
                this.animate_counter += this.game.dt * 5;
                if (this.animate_counter == 99)
                    this.animate_counter = 0;
            } else
                this.animate_counter = 0;
            this.game.shapes.box.draw(graphics_state, shoulder_loc.times(arm_hinge).times(arm_displacement).times(Mat4.scale(arm_scale)), color);
        }
    }

    on_death() {
        this.game.mob_count -= 1;
    }
}

class Goblin extends Mob {
    constructor(game, init_pos) {
        super(game, 50, Vec.of(1, 2, 1), init_pos, 2, 5, 45, 3, 10, 50, 1);
    }

    draw(graphics_state) {
        super.draw(graphics_state);
        let matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        this.game.shapes.box.draw(graphics_state, matrix.times(Mat4.translation(Vec.of(0, -1, 0))), this.game.arena_dark);
        this.game.shapes.box.draw(graphics_state, matrix.times(Mat4.translation(Vec.of(0, 1, 0))), this.game.goblin_green);
        let arm_scale = Vec.of(0.2, 0.7, 0.4);
        let shoulder_loc = Mat4.translation(Vec.of(0, -0.2, 0));
        this.draw_arms(graphics_state, shoulder_loc, arm_scale, this.game.goblin_green);
        
        // Eyes
        let sides = [-1, 1];
        let eye_loc = matrix.times(Mat4.translation(Vec.of(0, 1.2, -1.01)));
        for (var i in sides) {
            this.game.shapes.box.draw(graphics_state, eye_loc.times(Mat4.translation(Vec.of(0.5 * sides[i], 0, 0))).times(Mat4.scale(Vec.of(0.2, 0.2, 0.01))), this.game.goblin_glow);
        }
    }

    on_death() {
        super.on_death();
        this.create_particles(5, 0.8, this.game.goblin_green);
    }
}

class Ogre extends Mob {
    constructor(game, init_pos) {
        super(game, 350, Vec.of(2.5, 3, 2.5), init_pos, 1, 4, 35, 5, 30, 75, 3);
    }
    
    draw(graphics_state) {
        super.draw(graphics_state);
        let matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0)));
        // Body
        this.game.shapes.box.draw(graphics_state, matrix.times(Mat4.translation(Vec.of(0, -2.25, 0))).times(Mat4.scale(Vec.of(2, 0.75, 2))), this.game.grey);
        this.game.shapes.box.draw(graphics_state, matrix.times(Mat4.translation(Vec.of(0, 0.75, 0))).times(Mat4.scale(Vec.of(2, 2.25, 2))), this.game.ogre_green);
        
        // Arms, 2 sections
        let top_scale = Vec.of(0.6, 1.2, 0.6);
        let lower_scale = Vec.of(0.8, 1.2, 0.8);
        let shoulder_loc = matrix.times(Mat4.translation(Vec.of(0, 1.7, 0)));
        let sides = [-1, 1];
        let top_displacement = Mat4.translation(Vec.of(0, -1 * top_scale[1], 0));
        let lower_displacement = Mat4.translation(Vec.of(0, -1 * lower_scale[1], 0));
        for (var i in sides) {
            let top_hinge = Mat4.translation(Vec.of((2 + top_scale[0]) * sides[i], 0, 0));
            let lower_angle = Mat4.rotation(Math.PI / 4, Vec.of(1, 0, 0));
            if (this.state == "aggro")
            {
                let angle = Math.PI / 4 + Math.PI / 2 * Math.sin(this.attack_counter / this.attack_rate * Math.PI);
                if (this.attack_counter <= 0)
                    angle = Math.PI / 4;
                top_hinge = top_hinge.times(Mat4.rotation(angle, Vec.of(1, 0, 0)));
                lower_angle = Mat4.rotation(angle, Vec.of(1, 0, 0));
            }
            else if (this.v.norm() > 0) {
                top_hinge = top_hinge.times(Mat4.rotation(Math.sin(this.animate_counter * 0.02 * Math.PI) * sides[i], Vec.of(1, 0, 0)));
                this.animate_counter += this.game.dt * 5;
                if (this.animate_counter == 99)
                    this.animate_counter = 0;
            } else
                this.animate_counter = 0;
            
            let transform = shoulder_loc.times(top_hinge).times(top_displacement);
            this.game.shapes.box.draw(graphics_state, transform.times(Mat4.scale(top_scale)), this.game.grey);
            transform = transform.times(top_displacement).times(lower_angle).times(lower_displacement);
            this.game.shapes.box.draw(graphics_state, transform.times(Mat4.scale(lower_scale)), this.game.ogre_green);
        }
        
        // Head
        let head_loc = matrix.times(Mat4.translation(Vec.of(0, 2.5, -2.5)));
        this.game.shapes.box.draw(graphics_state, head_loc.times(Mat4.scale(Vec.of(1.2, 1, 1))), this.game.ogre_green);
        let eye_loc = head_loc.times(Mat4.translation(Vec.of(0, 0, -1.01)));

        for (var i in sides) {
             this.game.shapes.box.draw(graphics_state, eye_loc.times(Mat4.translation(Vec.of(0.8 * sides[i], 0, 0))).times(Mat4.scale(Vec.of(0.2, 0.2, 0.01))), this.game.goblin_glow);
        }
        
        
    }

    on_death() {
        super.on_death();
        this.create_particles(6, 1.2, this.game.ogre_green);
    }
}

class Draugr extends Mob {
    constructor(game, init_pos) {
        super(game, 85, Vec.of(1, 1.8, 1), init_pos, 3, 6, 80, 3, 15, 40, 2);
    }

    draw(graphics_state) {
        super.draw(graphics_state);
        let matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0))).times(Mat4.scale(this.collision_box));
        this.game.shapes.box.draw(graphics_state, matrix, this.game.grey);
    }

    on_death() {
        super.on_death();
        this.create_particles(4, 0.8, this.game.grey);
        this.game.object_list.push(new Ghost(this.game, this.pos)); // Becomes a ghost when slain
    }
}

class Ghost extends Mob {
    constructor(game, init_pos) {
        super(game, 85, Vec.of(1, 1.8, 1), init_pos, 1, 2, 40, 3, 10, 45, 2);
    }

    draw(graphics_state) {
        super.draw(graphics_state);
        let matrix = Mat4.translation(this.pos.plus(Vec.of(0, 1.1, 0))).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0))).times(Mat4.scale(this.collision_box));
        this.game.shapes.box.draw(graphics_state, matrix, this.game.ghost_grey);
    }

    on_death() {
        super.on_death();
        this.create_particles(4, 0.8, this.game.ghost_grey);
    }
}
