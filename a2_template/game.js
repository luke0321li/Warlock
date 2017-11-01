var wall_width = 1;
var wall_height = 5;
var door_width = 4;
var room_thickness = .1;
var room_size = 20;

/* var wall_width = 0.5;
var wall_height = 2.5;
var door_width = 2;
var room_thickness = 0.025;
var room_size = 7.5; */

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
            projection_transform: Mat4.perspective(Math.PI / 4, context.width / context.height, room_thickness, 1000)
        });

        this.object_list = [];
        Object.assign(this, {
            player: new Player(this),
            origin: Mat4.identity(),
            Phong_Model: context.get_instance(Phong_Model),
            camera_angle: Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0)),
            camera_location: Mat4.translation([0, -200, -10]),
            view_mode: "Aerial"
        });

        Object.assign(this, {
            test: this.Phong_Model.material(Color.of(.8, .7, .6, 1), 1, 1, .2, 40),
            arena_grey: this.Phong_Model.material(Color.of(.335, .335, .347, 1), 1, 1, .2, 40),
            rand_1: this.Phong_Model.material(Color.of(rand_num(.4, .7), rand_num(.4, .7), rand_num(.4, .7), 1), 1, 1, 1, 40)
        });

        this.arena = new Arena(15, 10, room_size, room_thickness);
        this.make_buttons();
    }

    make_buttons() // Set up the control keys
    {
        this.key_triggered_button("Move forward", "W", function () {
            this.player.a[2] = -1;
        }, undefined, function () {
            this.player.a[2] = 0;
            this.player.v[2] = 0;
        });

        this.key_triggered_button("Move backward", "S", function () {
            this.player.a[2] = 1;
        }, undefined, function () {
            this.player.a[2] = 0;
            this.player.v[2] = 0;
        });

        this.key_triggered_button("Move left", "A", function () {
            this.player.a[0] = -1;
        }, undefined, function () {
            this.player.a[0] = 0;
            this.player.v[0]= 0;
        });

        this.key_triggered_button("Move right", "D", function () {
            this.player.a[0] = 1;
        }, undefined, function () {
            this.player.a[0] = 0;
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
            this.object_list.push(new Fire_bolt(this, this.player));
        }, undefined, function () {}
        );

        this.key_triggered_button("Toggle aerial view", "K", function () {
            if (this.view_mode == "Aerial") {
                this.camera_angle = Mat4.rotation(.1, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -4, -6]);
                this.view_mode = "Default";
            } else {
                this.camera_angle = Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0));
                this.camera_location = Mat4.translation([0, -200, -10]);
                this.view_mode = "Aerial";
            }
        });
    }

    collision_check() {
        if (this.player.pos[0] + 2 >= room_size) {
            this.player.pos[0] = 27.9;
        }

        if (this.player.pos[0] - 2 <= -room_size) {
            this.player.pos[0] = -27.9;
        }

        if (this.player.pos[2] + 2 >= room_size) {
            this.player.pos[2] = 27.9;
        }

        if (this.player.pos[2] - 2 <= -room_size) {
            this.player.pos[2] = -27.9;
        }
    }

    update_camera(graphics_state) // Let the camera follow the player!
    {
        let camera_pos = this.camera_location.times(Mat4.rotation(this.player.angle * -1, Vec.of(0, 1, 0))).times(Mat4.translation(this.player.pos.times(-1)));
        graphics_state.camera_transform = this.camera_angle.times(camera_pos);
    }

    draw_arena(graphics_state) // Draw the arena!
    {

        let top_wall_trans = Mat4.translation([0, wall_height + room_thickness, -1 * (room_size - wall_width)]);
        let left_wall_trans = Mat4.translation([-1 * (room_size - wall_width), wall_height + room_thickness, 0]);
        let top_wall_scale = Mat4.scale([room_size, wall_height, wall_width]);
        let left_wall_scale = Mat4.scale([wall_width, wall_height, room_size - 2 * wall_width]);

        for (var i in this.arena.rooms) {
            let pos = Mat4.translation(this.arena.rooms[i].center);
            let size = Mat4.scale(this.arena.rooms[i].size);
            // Draw floor
            this.shapes.box.draw(graphics_state, pos.times(size), this.arena_grey);

            // Draw ceiling
            // if (this.view_mode == "Default")
               // this.shapes.box.draw(graphics_state, pos.times(Mat4.translation([0, wall_height * 2, 0])).times(size), this.arena_grey);


            let rotate = Mat4.rotation(Math.PI, Vec.of(0, 1, 0));

            // Draw walls
            if (this.arena.rooms[i].doors[0])
                this.draw_doored_wall(graphics_state, pos, 0);
            else
                this.shapes.box.draw(graphics_state, pos.times(top_wall_trans).times(top_wall_scale), this.arena_grey);

            if (this.arena.rooms[i].doors[1])
                this.draw_doored_wall(graphics_state, pos, 1);
            else
                this.shapes.box.draw(graphics_state, pos.times(rotate).times(top_wall_trans).times(top_wall_scale), this.arena_grey);

            if (this.arena.rooms[i].doors[2])
                this.draw_doored_wall(graphics_state, pos, 2);
            else
                this.shapes.box.draw(graphics_state, pos.times(left_wall_trans).times(left_wall_scale), this.arena_grey);

            if (this.arena.rooms[i].doors[3])
                this.draw_doored_wall(graphics_state, pos, 3);
            else
                this.shapes.box.draw(graphics_state, pos.times(rotate).times(left_wall_trans).times(left_wall_scale), this.arena_grey);
            
        }
    }

    draw_doored_wall(graphics_state, room_pos, direction) {
        let top_x = -1 * (door_width + (room_size - door_width) / 2);
        let top_z = -1 * (room_size - wall_width);
        let left_x = -1 * (room_size - wall_width);
        let left_z = -1 * (door_width + (room_size - 2 * wall_width - door_width) / 2);
        let top_left_trans = Mat4.translation([top_x, wall_height + room_thickness, top_z]);
        let top_right_trans = Mat4.translation([-1 * top_x, wall_height + room_thickness, top_z]);
        let left_top_trans = Mat4.translation([left_x, wall_height + room_thickness, left_z]);
        let left_bot_trans = Mat4.translation([left_x, wall_height + room_thickness, -1 * left_z]);

        let rotate = Mat4.rotation(Math.PI, Vec.of(0, 1, 0));
        let top_scale = Mat4.scale([(room_size - door_width) / 2, wall_height, wall_width]);
        let left_scale = Mat4.scale([wall_width, wall_height, (room_size - 2 * wall_width - door_width) / 2]);

        switch (direction) {
            case 0:
                this.shapes.box.draw(graphics_state, room_pos.times(top_left_trans).times(top_scale), this.arena_grey);
                this.shapes.box.draw(graphics_state, room_pos.times(top_right_trans).times(top_scale), this.arena_grey);
                break;
            case 1:
                this.shapes.box.draw(graphics_state, room_pos.times(rotate).times(top_left_trans).times(top_scale), this.arena_grey);
                this.shapes.box.draw(graphics_state, room_pos.times(rotate).times(top_right_trans).times(top_scale), this.arena_grey);
                break;
            case 2:
                this.shapes.box.draw(graphics_state, room_pos.times(left_top_trans).times(left_scale), this.arena_grey);
                this.shapes.box.draw(graphics_state, room_pos.times(left_bot_trans).times(left_scale), this.arena_grey);
                break;
            case 3:
                this.shapes.box.draw(graphics_state, room_pos.times(rotate).times(left_top_trans).times(left_scale), this.arena_grey);
                this.shapes.box.draw(graphics_state, room_pos.times(rotate).times(left_bot_trans).times(left_scale), this.arena_grey);
                break;
        }
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

        this.draw_arena(graphics_state);
        for (var i in this.object_list) {
            if (this.object_list[i].is_alive()) {
                this.object_list[i].move(0.15);
                this.object_list[i].draw(graphics_state);
            }
        }
        // this.collision_check();
        this.player.move(0.15);
        this.update_camera(graphics_state);
        this.draw_player(graphics_state);
    }
}