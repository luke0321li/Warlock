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
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            'pillar_3': new Pillar_Shape(3),
            'pillar_4': new Pillar_Shape(4),
            'crate': new Crate_Shape(),
            'aggro': new Lightning()
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
            test: this.Phong_Model.material(Color.of(.8, .7, .6, 1), 1, 1, .2, 40),
            arena_grey: this.Phong_Model.material(Color.of(.335, .335, .347, 1), 1, 1, .2, 40),
            arena_dark: this.Phong_Model.material(Color.of(.208, .208, .208, 1), 1, 1, .2, 40),
            brown: this.Phong_Model.material(Color.of(0.45, 0.33, 0.25, 1), 1, 1, .2, 40),
            goblin_green: this.Phong_Model.material(Color.of(0.33, 0.45, 0.25, 1), 1, 1, .2, 40),
            aggro_red: this.Phong_Model.material(Color.of(0.65, 0.3, 0.3, 0.9), 1, 1, .2, 40),
            rand_1: this.Phong_Model.material(Color.of(rand_num(.2, .9), rand_num(.2, .9), rand_num(.2, .9), 1), 1, 1, 1, 40),
            damaged: this.Phong_Model.material(Color.of(0.75, 0.4, 0.4, 1), 1, 1, .2, 40)
        });

        this.mob_count = 0;
        this.map_size = 15;
        this.arena = new Arena(this, 15, 15);
        this.make_buttons();
        this.state = "play";
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
            this.object_list.push(new Fire_Bolt(this, this.player));
        }, undefined, function () {});

        this.key_triggered_button("View map", "M", function () {
            if (this.view_mode == "Aerial") {
                this.camera_angle = Mat4.rotation(.1, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -4, -8]);
                this.view_mode = "Default";
            } else {
                this.camera_angle = Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -300, 0]);
                this.view_mode = "Aerial";
            }
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
        let camera_pos = this.camera_location.times(Mat4.rotation(this.player.angle * -1, Vec.of(0, 1, 0))).times(Mat4.translation(this.player.pos.times(-1)));
        graphics_state.camera_transform = this.camera_angle.times(camera_pos);
    }

    draw_player(graphics_state) {
        this.player.draw(graphics_state);
    }

    draw_hp_bar(graphics_state) {
        if (this.view_mode == "Default") {
            let hp = this.player.hp * 3.5 / 100
            let matrix = Mat4.translation(this.player.pos).times(Mat4.rotation(this.player.angle, Vec.of(0, 1, 0)));
            matrix = matrix.times(Mat4.translation(Vec.of(0, 6.5, -1)));
            this.shapes.box.draw(graphics_state, matrix.times(Mat4.scale(Vec.of(hp, 0.1, 0.1))), this.rand_1);
        }
    }

    display(graphics_state) // Draw everything in the game!
    {
        if (this.state == "main") // Start another playthrough
        {
            if (this.player.is_alive())
                this.map_size += 4;
            this.new_map();
            this.state = "play";
        } 
        
        else if (this.state == "play") // Currently in playthrough
        {
            let t = graphics_state.animation_time / 1000;
            graphics_state.lights = [
            new Light(Vec.of(this.player.pos[0], 100, this.player.pos[2], 1), Color.of(1, 1, 1, 1), 100000), // Lights for Phong_Shader to use*/
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
                    if (pos_vec.norm() <= 200) // To save energy, only draw and animate objects within a certain radius of the player
                    {
                        if (type != "player" && type != "idle" && type != "destructable" && this.view_mode != "Aerial")
                            this.object_list[i].move(0.15);
                        if (pos_vec.norm() <= 100) {
                            let player_front = rotate_vec([0, 0, -1], this.player.angle);
                            if (this.view_mode == "Aerial" || pos_vec.normalized().dot(player_front) >= -0.5 || this.object_list[i].constructor.name == "Room_Base") {
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

            if (!this.player.is_alive() || !this.mob_count)
                this.state = "main";
        }

    }
}