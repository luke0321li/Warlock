class Demo_Scene extends Scene_Component // A demo scene
{
    constructor(context) {
        super(context);
        var shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4)
        };

        this.submit_shapes(context, shapes);

        Object.assign(context.globals.graphics_state, {
            camera_transform: Mat4.translation([0, 0, -25]),
            projection_transform: Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 1000)
        });
        
        let box_pos = [];
        let size = [];
        
        Object.assign(this, {
            box_pos: box_pos, 
            size: size, 
            origin: Mat4.identity(), 
            Phong_Model: context.get_instance(Phong_Model),
        });

        Object.assign(this, {
            test: this.Phong_Model.material(Color.of(.8, .7, .6, 1), 1, 1, .2, 40),
            test_2: this.Phong_Model.material(Color.of(.43, .42, .66, 1), 1, 1, .2, 40),
            rand_1: this.Phong_Model.material(Color.of(randNumBetween(0, .5), randNumBetween(0, .5), randNumBetween(0, .5), 1), 1, 1, 1, 40),
            moving: [0, 0, 0]
        });
        
        for (let i = 0; i < 20; i++)
        {
            this.box_pos[i] = Mat4.translation([randNumBetween(-10, 10), randNumBetween(-10, 10), randNumBetween(-10, 10)]);
            this.size[i] = [randNumBetween(1, 4), randNumBetween(1, 4), randNumBetween(1, 4)];
        }
        
        /* context.globals.movement_target_is_a_camera = false;
        let ref = this;
        context.globals.movement_controls_target = this.origin; */
        
        this.key_triggered_button("Move forward", "Enter", function(){
                this.moving[2] = 1;
        }, undefined, function(){ this.moving[2] = 0;}); 
        
        this.key_triggered_button("Move backward", "Q", function(){
                this.moving[2] = -1;
        }, undefined, function(){ this.moving[2] = 0;}); 
    }

    display(graphics_state) {
        
        let t = graphics_state.animation_time / 1000;
        
        graphics_state.lights = [
            new Light(Vec.of(30, 30, 34, 1), Color.of(1, 1, 1, 1), 100000), // Lights for Phong_Shader to use*/
            new Light(Vec.of(10, 20, 10, 0), Color.of(0.5, 0.5, 0.5, 1), 10)
        ];
        
        this.shapes.box.draw(graphics_state, Mat4.scale([10, .1, 10]), this.test_2);
        this.origin = this.origin.times(Mat4.translation([0, 0, this.moving[2]]));
        let model_transform = this.origin.times(Mat4.translation([0, 5, 0]));
        
        for (let i = 0; i < 20; i++)
        {
            let pos = model_transform.times(this.box_pos[i]);
            this.shapes.box.draw(graphics_state, pos.times(Mat4.scale(this.size[i])), this.rand_1);
        }
    }

}
