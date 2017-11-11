// States: "roaming", "aggro", "rest", "turn"

class Mob extends Moving_Object {
    constructor(game, hp, collision_box, init_pos, roam_speed, aggro_speed, vision, attack_dmg, attack_rate, difficulty) {
        super(game, hp, collision_box, init_pos, Vec.of(0, 0, 0), Vec.of(roam_speed, 0, 0), 0, 0, rand_num(0, Math.PI * 2), aggro_speed);
        Object.assign(this, {
            type: "mob",
            roam_speed: roam_speed,
            vision: vision,
            distance_counter: 0,
            attempted_distance: rand_num(1, 10),
            rest_counter: 0,
            state: "roaming",
            attack_dmg: attack_dmg,
            attack_rate: attack_rate,
            attack_counter: attack_rate,
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
                if (this.distance_counter >= this.attempted_distance) {
                    this.distance_counter = 0;
                    this.angle = rand_num(0, Math.PI * 2);
                    this.attempted_distance = rand_num(1, 10);
                    this.rest_counter = rand_int(30, 55);
                    this.state = "rest";
                }
            } else // Blocked
                this.state = "turning";
            if (player_pos.norm() <= this.vision)
                this.state = "aggro";
        } else if (this.state == "aggro") // Runs at player and attacks 
        {
            if (player_pos.norm() < 2) {
                if (!this.attack_counter) {
                    this.game.player.take_damage(this.attack_dmg)
                    this.attack_counter = this.attack_rate;
                } else
                    this.attack_counter -= 1;
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
            this.rest_counter -= 1;
            if (!this.rest_counter)
                this.state = "roaming";
            if (player_pos.norm() <= this.vision)
                this.state = "aggro";
        } else if (this.state == "turning") // Blocked, try to turn away
        {
            this.angle += Math.PI / 2;
            this.distance_counter = 0;
            this.attempted_distance = 3;
            this.state = "roaming";
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
}

class Goblin extends Mob {
    constructor(game, init_pos) {
        super(game, 50, Vec.of(0.8, 1.5, 0.8), init_pos, 2, 5, 35, 10, 35, 1);
    }

    draw(graphics_state) {
        super.draw(graphics_state);
        let matrix = Mat4.translation(this.pos).times(Mat4.rotation(this.angle, Vec.of(0, 1, 0))).times(Mat4.scale(this.collision_box));
        this.game.shapes.box.draw(graphics_state, matrix, this.game.goblin_green);
    }
    
    on_death () {
        this.create_particles(4, 0.8, this.game.goblin_green);
        this.game.mob_count -= 1;
    }
}
