class Game extends Scene_Component // Main game engine
{
    constructor(context) {
        super(context);
        var shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4)
        };

        this.submit_shapes(context, shapes);

        // Set initial camera angle
        Object.assign(context.globals.graphics_state, {
            camera_transform: Mat4.identity(),
            projection_transform: Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 1000)
        });

        this.object_list = [];
        this.wall_list = [];
        Object.assign(this, {
            player: new Player(this),
            origin: Mat4.identity(),
            Phong_Model: context.get_instance(Phong_Model),
            // camera_angle: Mat4.rotation(0, Vec.of(1, 0, 0)),
            // camera_location: Mat4.translation([-5, -5, -20])
            camera_angle: Mat4.rotation(Math.PI / 3, Vec.of(1, 0, 0)),
            camera_location: Mat4.translation([0, -80, -30])
        });

        Object.assign(this, {
            test: this.Phong_Model.material(Color.of(.8, .7, .6, 1), 1, 1, .2, 40),
            arena_grey: this.Phong_Model.material(Color.of(.33, .33, .33, 1), 1, 1, .2, 40),
            rand_1: this.Phong_Model.material(Color.of(rand_num(0, .5), rand_num(0, .5), rand_num(0, .5), 1), 1, 1, .2, 40)
        });
        
        this.arena = new Arena(10, 7);
        this.make_buttons();
        // this.wall_list.push(new Wall(this, 0, -32, 30, 2));
    }

    make_buttons() // Set up the control keys
    {
        this.key_triggered_button("Move forward", "I", function () {
            this.player.velocity[2] = -1;
        }, undefined, function () {
            this.player.velocity[2] = 0;
        });

        this.key_triggered_button("Move backward", "K", function () {
            this.player.velocity[2] = 1;
        }, undefined, function () {
            this.player.velocity[2] = 0;
        });

        this.key_triggered_button("Move left", "J", function () {
            this.player.velocity[0] = -1;
        }, undefined, function () {
            this.player.velocity[0] = 0;
        });

        this.key_triggered_button("Move right", "L", function () {
            this.player.velocity[0] = 1;
        }, undefined, function () {
            this.player.velocity[0] = 0;
        });
    }

    // create_arena()
    // {

    // }
    
    collision_check() {
        if (this.player.pos[0] + 2 >= 30) {
            this.player.pos[0] = 27.9;
            // this.player.velocity = Vec.of(0, 0, 0);
        }

        if (this.player.pos[0] - 2 <= -30) {
            this.player.pos[0] = -27.9;
            // this.player.velocity = Vec.of(0, 0, 0);
        }

        if (this.player.pos[2] + 2 >= 30) {
            this.player.pos[2] = 27.9;
            // this.player.velocity = Vec.of(0, 0, 0);
        }

        if (this.player.pos[2] - 2 <= -30) {
            this.player.pos[2] = -27.9;
            // this.player.velocity = Vec.of(0, 0, 0);
        }
    }

    update_camera(graphics_state) // Let the camera follow the player!
    {
        let camera_pos = Mat4.translation([this.player.pos[0] * -1 + this.player.velocity[0] * -0.5, 0, this.player.pos[2] * -1 + this.player.velocity[2] * -0.5]).times(this.camera_location);
        graphics_state.camera_transform = this.camera_angle.times(camera_pos);
    }

    draw_arena(graphics_state) // Draw the arena!
    {
        /* this.shapes.box.draw(graphics_state, Mat4.scale([30, .1, 30]), this.arena_grey); // Draw initial room
        for (var i in this.wall_list) {
            this.shapes.box.draw(graphics_state, Mat4.translation(this.wall_list[i].pos).times(Mat4.scale(this.wall_list[i].collision_box)), this.arena_grey);
        } */
        for (var i in this.arena.rooms)
        {
            let pos = Mat4.translation(this.arena.rooms[i].center);
            let size = Mat4.scale(this.arena.rooms[i].size);
            this.shapes.box.draw(graphics_state, pos.times(size), this.arena_grey);
        }
    }

    draw_player(graphics_state) {
        this.player.pos = add_lists(this.player.pos, this.player.velocity.times(0.5));
        let player_matrix = Mat4.translation(this.player.pos)
        this.shapes.box.draw(graphics_state, player_matrix.times(Mat4.scale([2, 2, 2])), this.rand_1);
    }

    display(graphics_state) // Draw everything in the game!
    {
        let t = graphics_state.animation_time / 1000;
        graphics_state.lights = [
            new Light(Vec.of(30, 30, 34, 1), Color.of(1, 1, 1, 1), 100000), // Lights for Phong_Shader to use*/
            new Light(Vec.of(10, 20, 10, 0), Color.of(0.5, 0.5, 0.5, 1), 10)
        ];

        this.draw_arena(graphics_state);
        // this.collision_check();
        this.update_camera(graphics_state);
        this.draw_player(graphics_state);
    }
}
