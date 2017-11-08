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
            'ball': new Subdivision_Sphere(4)
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
            camera_location: Mat4.translation([0, -200, 0]),
            view_mode: "Aerial"
        });

        Object.assign(this, {
            test: this.Phong_Model.material(Color.of(.8, .7, .6, 1), 1, 1, .2, 40),
            arena_grey: this.Phong_Model.material(Color.of(.335, .335, .347, 1), 1, 1, .2, 40),
            arena_dark: this.Phong_Model.material(Color.of(.208, .208, .208, 1), 1, 1, .2, 40),
            rand_1: this.Phong_Model.material(Color.of(rand_num(.2, .9), rand_num(.2, .9), rand_num(.2, .9), 1), 1, 1, 1, 40)
        });

        this.arena = new Arena(this, 15, 10, 20, .1);
        this.make_buttons();
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

        this.key_triggered_button("Toggle aerial view", "K", function () {
            if (this.view_mode == "Aerial") {
                this.camera_angle = Mat4.rotation(.1, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -4, -6]);
                this.view_mode = "Default";
            } else {
                this.camera_angle = Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -200, 0]);
                this.view_mode = "Aerial";
            }
        });
    }

    update_camera(graphics_state) // Let the camera follow the player!
    {
        let camera_pos = this.camera_location.times(Mat4.rotation(this.player.angle * -1, Vec.of(0, 1, 0))).times(Mat4.translation(this.player.pos.times(-1)));
        graphics_state.camera_transform = this.camera_angle.times(camera_pos);
    }

    draw_player(graphics_state) {
        this.player.draw(graphics_state);
    }

    display(graphics_state) // Draw everything in the game!
    {
        let t = graphics_state.animation_time / 1000;
        graphics_state.lights = [
            new Light(Vec.of(20, 100, 20, 1), Color.of(1, 1, 1, 1), 100000), // Lights for Phong_Shader to use*/
            // new Light(this.player.pos.plus(Vec.of(0, 5, 0)).to4(1), Color.of(2, 4, 2, 1), 1000000),
            // new Light(Vec.of(-10, -20, -14, 0), Color.of(1, 1, 3, 1), 100)
        ];

        this.player.move(0.15);
        this.update_camera(graphics_state);
        this.draw_player(graphics_state);
        
        for (var i in this.object_list) {
            if (this.object_list[i].is_alive()) {
                if (this.object_list[i].type != "player")
                    this.object_list[i].move(0.15);
                this.object_list[i].draw(graphics_state);
            } 
        }
        
        for (var i in this.object_list) {
            if (!this.object_list[i].is_alive()) {
                this.object_list.splice(i, 1);
            } 
        }
        
    }
}
