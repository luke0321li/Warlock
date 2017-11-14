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
            'goblet': new Goblet_Shape(),
            'aggro': new Lightning(),
            'wizard_hat': new Wizard_Hat(),
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
            camera_angle: Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0)),
            camera_location: Mat4.translation([0, -300, 0]),
            view_mode: "Aerial"
        });

        Object.assign(this, {
            test: this.Phong_Model.material(Color.of(0.8, 0.7, 0.6, 1), 1, 1, 0.2, 40),
            arena_grey: this.Phong_Model.material(Color.of(0.3, 0.3, 0.3, 1), 1, 1, 0.2, 40),
            arena_dark: this.Phong_Model.material(Color.of(0.29, 0.29, 0.29, 1), 0.7, 0.7, 0.2, 40),
            arena_black: this.Phong_Model.material(Color.of(0.23, 0.23, 0.23, 1), 0.7, 0.7, 0.2, 40),
            brown: this.Phong_Model.material(Color.of(0.45, 0.33, 0.25, 1), 1, 1, 0.2, 40),
            bright: this.Phong_Model.material(Color.of(0.7, 0.7, 0.1, 1), 1, 1, 0.2, 40),
            goblin_green: this.Phong_Model.material(Color.of(0.33, 0.45, 0.25, 1), 1, 1, 0.2, 40),
            ogre_green: this.Phong_Model.material(Color.of(0.40, 0.46, 0.20, 1), 1, 1, 0.2, 40),
            draugr_grey: this.Phong_Model.material(Color.of(0.4, 0.4, 0.4, 1), 1, 1, 0.2, 40),
            ghost_grey: this.Phong_Model.material(Color.of(0.4, 0.4, 0.4, 0.6), 1, 1, 0.2, 40),
            aggro_red: this.Phong_Model.material(Color.of(0.75, 0.3, 0.3, 0.9), 1, 1, 0.2, 40),
            rand_1: this.Phong_Model.material(Color.of(rand_num(0.2, 0.9), rand_num(0.2, 0.9), rand_num(0.2, 0.9), 1), 1, 1, 0.2, 40),
            damaged: this.Phong_Model.material(Color.of(0.75, 0.4, 0.4, 1), 1, 1, .2, 40),
            white: this.Phong_Model.material(Color.of(0.9, 0.9, 0.9, 1), 1, 1, 0.2, 40),
            dead_banner: this.Phong_Model.material(Color.of(0, 0, 0, 1), 1, 0, 0, 40, context.get_instance("assets/Endgame.png")),
            next_banner: this.Phong_Model.material(Color.of(0, 0, 0, 1), 1, 0, 0, 40, context.get_instance("assets/Nextlevel.png"))
        });

        this.level = 1;
        this.mob_count = 0;
        this.map_size = 10;
        this.arena = new Arena(this, this.map_size, this.map_size);
        this.make_buttons();
        this.state = "play";
        console.log(this.rand_1.color);
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
            this.player.alpha = 2;
        }, undefined, function () {
            this.player.alpha = 0;
            this.player.omega = 0;
        });

        this.key_triggered_button("Turn right", "E", function () {
            this.player.alpha = -2;
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
                this.camera_angle = Mat4.rotation(.1, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -6.5, -15]);
                this.view_mode = "Default";
            } else {
                this.camera_angle = Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -300, 0]);
                this.view_mode = "Aerial";
            }
        });

        this.key_triggered_button("Retry", "F", function () {
            if (this.state == "play")
                this.player.hp = 0;
            this.state = "main";
        }, undefined, function () {});
    }

    new_map() {
        this.object_list = [];
        this.player = new Player(this);
        this.mob_count = 0;
        this.arena = new Arena(this, this.map_size, this.map_size);
    }

    update_camera(graphics_state) // Let the camera follow the player!
    {
        let camera_pos = this.camera_location.times(Mat4.rotation(this.player.angle * -1, Vec.of(0, 1, 0))).times(Mat4.translation(this.player.pos.times(-1)));
        graphics_state.camera_transform = this.camera_angle.times(camera_pos);
    }

    draw_player(graphics_state) {
        this.player.draw(graphics_state);
    }

    draw_hp_bar(graphics_state) {
        if (this.view_mode == "Default") {
            let hp = this.player.hp * 5 / this.player.max_health;
            let matrix = Mat4.translation(this.player.pos).times(Mat4.rotation(this.player.angle, Vec.of(0, 1, 0)));
            matrix = matrix.times(Mat4.translation(Vec.of(0, 10.8, -1)));
            this.shapes.box.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(hp, 0.2, 0.2))), this.rand_1);
            this.shapes.box.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(5, 0.2, 0.2))), this.white);

        }
    }

    draw_end_panel(graphics_state) {
        let matrix = Mat4.translation(this.player.pos).times(Mat4.rotation(this.player.angle, Vec.of(0, 1, 0)));
        matrix = matrix.times(Mat4.translation(Vec.of(0, 5, 0))).times(Mat4.rotation(-0.08, Vec.of(1, 0, 0)));
        if (this.state == "dead")
            this.shapes.banner.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(5, 5, 0))), this.dead_banner);
        else if (this.state == "win")
            this.shapes.banner.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(5, 5, 0))), this.next_banner);            
    }

    display(graphics_state) // Draw everything in the game!
    {
        if (this.state == "main") // Start another playthrough
        {
            if (this.player.is_alive())
            {
                this.map_size += 4;
                this.level += 1;
            }
            this.new_map();
            this.state = "play";
        }

        else if (this.state == "dead" || this.state == "win")
            this.draw_end_panel(graphics_state);

        else if (this.state == "play") // Currently in playthrough
        {
            graphics_state.lights = [
            new Light(Vec.of(this.player.pos[0], 12, this.player.pos[2], 1), Color.of(.3, .3, .3, 1), 1000), // Lights for Phong_Shader to use*/
        ];

            // The player moves first
            if (this.view_mode != "Aerial") {
                this.player.move(0.15);
            }
            this.update_camera(graphics_state);
            this.draw_player(graphics_state);
            this.draw_hp_bar(graphics_state);

            // Let every object take its turn to move
            for (var i in this.object_list) {
                if (this.object_list[i].is_alive()) {
                    let pos_vec = this.object_list[i].pos.minus(this.player.pos);
                    let type = this.object_list[i].type;
                    if (pos_vec.norm() <= 350) // To save energy, only draw and animate objects within a certain radius of the player
                    {
                        if (type != "player" && type != "idle" && type != "destructable" && this.view_mode != "Aerial")
                            this.object_list[i].move(graphics_state.animation_delta_time * 0.01);
                        if (this.view_mode == "Aerial")
                            this.object_list[i].draw(graphics_state);
                        else if (pos_vec.norm() <= 100) {
                            let player_front = rotate_vec([0, 0, -1], this.player.angle);
                            if (pos_vec.normalized().dot(player_front) >= -0.5 || this.object_list[i].constructor.name == "Room_Base") {
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

            if (!this.player.is_alive())
                this.state = "dead";
            
            else if (!this.mob_count)
                this.state = "win";
        }

    }
}
