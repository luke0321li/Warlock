/* var wall_width = 1;
var wall_height = 5;
var door_width = 4;
var room_thickness = .1;
var room_size = 20; */

class Game extends Scene_Component // Main game engine
{
    constructor(context) {
        super(context);
        var shapes = {
            'banner': new Square(),
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            'pillar_3': new Pillar_Shape(3),
            'pillar_4': new Pillar_Shape(4),
            'crate': new Crate_Shape(),
            'urn': new Urn_Shape(),
            'goblet': new Goblet_Shape(),
            'aggro': new Lightning(),
            'wizard_hat': new Wizard_Hat(),
            'heart': new Heart(),
            'shield': new Shield(),
        };

        this.submit_shapes(context, shapes);

        Object.assign(context.globals.graphics_state, {
            camera_transform: Mat4.identity(),
            projection_transform: Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 1000)
        });

        this.object_list = [];
        Object.assign(this, {
            player: new Player(this),
            origin: Mat4.identity(),
            Phong_Model: context.get_instance(Phong_Model),
            view_mode: "Default"
        });

        Object.assign(this, {
            test: this.Phong_Model.material(Color.of(0.8, 0.7, 0.6, 1), 1, 1, 0.2, 40),
            arena_grey: this.Phong_Model.material(Color.of(0.3, 0.3, 0.3, 1), 1, 1, .2, 40),
            arena_deep_grey: this.Phong_Model.material(Color.of(0.28, 0.28, 0.28, 1), 1, 1, .2, 40),
            arena_deeper_grey: this.Phong_Model.material(Color.of(0.25, 0.25, 0.25, 1), 1, 1, .2, 40),
            arena_dark: this.Phong_Model.material(Color.of(0.29, 0.29, 0.29, 1), 0.7, 0.7, 0.2, 40),
            arena_black: this.Phong_Model.material(Color.of(0.23, 0.23, 0.23, 1), 0.7, 0.7, 0.2, 40),
            goblet_black: this.Phong_Model.material(Color.of(0, 0, 0, 1), 1, 0, 0, 40, context.get_instance("assets/urn_texture.png")),
            mage: this.Phong_Model.material(Color.of(0.3187, 0.4, 0.5802, 1), 1, 1, 0.2, 40),
            // mage_hat: this.Phong_Model.material(Color.of(0, 0, 0, 1), 1, 0, 0, 40, context.get_instance("assets/hat_texture.png")),
            brown: this.Phong_Model.material(Color.of(0.45, 0.33, 0.25, 1), 1, 1, 0.2, 40),
            bright: this.Phong_Model.material(Color.of(0.7, 0.7, 0.1, 1), 1, 1, 0.2, 40),
            goblin_green: this.Phong_Model.material(Color.of(0.33, 0.45, 0.25, 1), 1, 1, 0.2, 40),
            goblin_glow: this.Phong_Model.material(Color.of(0.65, 0.5, 0.35, 1), 1, 1, 0.2, 40),
            ogre_green: this.Phong_Model.material(Color.of(0.40, 0.46, 0.20, 1), 1, 1, 0.2, 40),
            grey: this.Phong_Model.material(Color.of(0.47, 0.47, 0.47, 1), 1, 1, 0.2, 40),
            ghost_grey: this.Phong_Model.material(Color.of(0.4, 0.4, 0.4, 0.6), 1, 1, 0.2, 40),
            pale_blue: this.Phong_Model.material(Color.of(0.35, 0.35, 0.7, 1), 1, 1, 0.2, 40),
            dark_brown: this.Phong_Model.material(Color.of(0.28, 0.20, 0.12, 1), 1, 1, 0.2, 40),
            urn_brown: this.Phong_Model.material(Color.of(0.48, 0.37, 0.3, 1), 1, 1, 0.2, 40),
            aggro_red: this.Phong_Model.material(Color.of(0.75, 0.3, 0.3, 0.9), 1, 1, 0.2, 40),
            heart_red: this.Phong_Model.material(Color.of(0.72, 0.4, 0.4, 0.95), 1, 1, 0.2, 40),
            rand_1: this.Phong_Model.material(Color.of(rand_num(0.2, 0.9), rand_num(0.2, 0.9), rand_num(0.2, 0.9), 1), 1, 1, 0.2, 40),
            shield_blue: this.Phong_Model.material(Color.of(0.5, 0.5, 0.7, 1), 1, 1, 0.2, 40),
            shield_idle: this.Phong_Model.material(Color.of(0.5, 0.5, 0.7, 0.9), 1, 1, 0.2, 40),
            shield_active: this.Phong_Model.material(Color.of(0.8, 0.8, 0.9, 0.9), 1, 1, 0.2, 40),
            damaged: this.Phong_Model.material(Color.of(0.75, 0.4, 0.4, 1), 1, 1, .2, 40),
            white: this.Phong_Model.material(Color.of(0.9, 0.9, 0.9, 1), 1, 1, 0.2, 40),
            start_banner: this.Phong_Model.material(Color.of(0, 0, 0, 1), 1, 0, 0, 40, context.get_instance("assets/Startup.png")),
            dead_banner: this.Phong_Model.material(Color.of(0, 0, 0, 1), 1, 0, 0, 40, context.get_instance("assets/Endgame.png")),
            next_banner: this.Phong_Model.material(Color.of(0, 0, 0, 1), 1, 0, 0, 40, context.get_instance("assets/Nextlevel.png"))
        });

        this.level = 0;
        this.mob_count = 0;
        this.map_size = 9;
        this.arena = new Arena(this, this.map_size, this.map_size);
        this.make_buttons();
        this.state = "start";
        this.dt = 0;
        this.wait_counter = 250;
    }

    make_buttons() // Set up the control keys
    {
        this.key_triggered_button("Move forward", "W", function () {
            this.player.v[2] = -2;
        }, undefined, function () {
            this.player.v[2] = 0;
        });

        this.key_triggered_button("Move backward", "S", function () {
            this.player.v[2] = 2;
        }, undefined, function () {
            this.player.v[2] = 0;
        });

        this.key_triggered_button("Move left", "A", function () {
            this.player.v[0] = -2;
        }, undefined, function () {
            this.player.v[0] = 0;
        });

        this.key_triggered_button("Move right", "D", function () {
            this.player.v[0] = 2;
        }, undefined, function () {
            this.player.v[0] = 0;
        });

        this.key_triggered_button("Turn left", "Q", function () {
            this.player.alpha = 1;
        }, undefined, function () {
            this.player.alpha = 0;
            this.player.omega = 0;
        });

        this.key_triggered_button("Turn right", "E", function () {
            this.player.alpha = -1;
        }, undefined, function () {
            this.player.alpha = 0;
            this.player.omega = 0;
        });

        this.key_triggered_button("Pew pew", "J", function () {
            this.player.is_firing = true;
        }, undefined, function () {
            this.player.is_firing = false;
        });

        this.key_triggered_button("View map", "M", function () {
            if (this.view_mode == "Aerial") {
                this.view_mode = "Default";
            } else if (this.state == "play") {
                this.view_mode = "Aerial";
            }
        });

        this.key_triggered_button("Retry", "F", function () {
            if (this.state == "play")
                this.player.hp = 0;
            this.state = "main";
        }, undefined, function () {});

        this.live_string(() => {
            if (this.dt)
                return "FPS:" + Math.round(1000 / (this.dt * 100));
            else return 0;
        });
    }

    new_map() {
        this.object_list = [];
        this.player = new Player(this);
        this.mob_count = 0;
        this.arena = new Arena(this, this.map_size, this.map_size);
    }

    update_camera(graphics_state) // Let the camera follow the player!
    {
        let eye = this.player.pos.plus(rotate_vec(Vec.of(0, 6.8, 16), this.player.angle));
        let lookat = this.player.pos.plus(rotate_vec(Vec.of(0, 3.94, 1), this.player.angle));
        let up = Vec.of(0, 1, 0);

        if (this.view_mode == "Aerial") {
            eye = this.player.pos.plus(Vec.of(0, 450, 0));
            lookat = this.player.pos.plus(Vec.of(0, 0, 0));
            up = Vec.of(0, 0, -1);
        }
        graphics_state.camera_transform = Mat4.look_at(eye, lookat, up);
    }

    draw_player(graphics_state) {
        this.player.draw(graphics_state);
    }

    draw_hp_bar(graphics_state) {
        if (this.view_mode == "Default") {
            let hp = this.player.hp * 5 / this.player.max_health;
            let matrix = Mat4.translation(this.player.pos).times(Mat4.rotation(this.player.angle, Vec.of(0, 1, 0)));
            matrix = matrix.times(Mat4.translation(Vec.of(0, 9, -1)));
            this.shapes.box.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(hp, 0.2, 0.2))), this.mage);
            let sides = [-1, 1];
            let x = hp + (5 - hp) / 2;
            let side_scale = Mat4.scale(Vec.of((5 - hp) / 2, 0.2, 0.2));
            for (var i in sides) {
                this.shapes.box.draw(graphics_state, matrix.times(Mat4.translation(Vec.of(x * sides[i], 0, 0))).times(side_scale), this.white);
            }
        }
    }

    draw_end_panel(graphics_state) {
        this.update_camera(graphics_state);
        let matrix = Mat4.translation(this.player.pos).times(Mat4.rotation(this.player.angle, Vec.of(0, 1, 0)));
        matrix = matrix.times(Mat4.translation(Vec.of(0, 4, 0))).times(Mat4.rotation(-0.2, Vec.of(1, 0, 0)));
        let color = this.dead_banner;
        if (this.state == "win")
            color = this.next_banner;
        else if (this.state == "start")
            color = this.start_banner;
        this.shapes.banner.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(5, 5, 0))), color);
    }

    display(graphics_state) // Draw everything in the game!
    {
        graphics_state.lights = [
            new Light(Vec.of(this.player.pos[0], 12, this.player.pos[2], 1), Color.of(.3, .3, .3, 1), 1000), // Lights for Phong_Shader to use*/
        ];

        if (this.state == "main") // Start another playthrough
        {
            if (this.player.is_alive()) {
                this.map_size += 4;
                this.level += 1;
            }
            this.new_map();
            this.state = "play";
            this.wait_counter = 250;
        } else if (this.state == "dead" || this.state == "win" || this.state == "start")
            this.draw_end_panel(graphics_state);

        else if (this.state == "play") // Currently in playthrough
        {
            this.dt = graphics_state.animation_delta_time * 0.01;

            // The player moves first
            if (this.view_mode != "Aerial" && this.player.is_alive()) {
                this.player.move(this.dt);
            }

            // Move the camera to follow the player
            this.update_camera(graphics_state);

            //Draw the player and HP bar 
            if (this.player.is_alive()) {
                this.draw_player(graphics_state);
                this.draw_hp_bar(graphics_state);
            }

            // Let every object take its turn to move and get drawn
            for (var i in this.object_list) {
                if (this.object_list[i].is_alive()) {
                    let pos_vec = this.object_list[i].pos.minus(this.player.pos);
                    let type = this.object_list[i].type;
                    if (pos_vec.norm() <= 300 || this.view_mode == "Aerial") // To save energy, only draw and animate objects within a certain radius of the player
                    {
                        // Move objects
                        if (type != "player" && type != "idle" && type != "destructable" && this.view_mode != "Aerial")
                            this.object_list[i].move(this.dt);
                        if (this.view_mode == "Aerial")
                            this.object_list[i].draw(graphics_state);
                        else if (pos_vec.norm() <= 150) {
                            let player_direction = rotate_vec([0, 0, -1], this.player.angle);
                            // For non-mob objects, only draw if they are in front of the player
                            if (pos_vec.normalized().dot(player_direction) >= -0.5 || this.object_list[i].constructor.name == "Room_Base" || this.object_list[i].type == "mob") {
                                this.object_list[i].draw(graphics_state);
                            }
                        }
                    }
                }
            }
            
            // Remove dead objects
            for (var i in this.object_list) {
                if (!this.object_list[i].is_alive()) {
                    this.object_list[i].on_death();
                    this.object_list.splice(i, 1);
                }
            }

            if (!this.player.is_alive()) {
                if (this.wait_counter == 250)
                    this.player.on_death();
                this.wait_counter -= this.dt * 10;
                if (this.wait_counter <= 0)
                    this.state = "dead";
            } else if (!this.mob_count)
                this.state = "win";
        }

    }
}
