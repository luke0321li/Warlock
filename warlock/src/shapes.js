class Trapezoid extends Shape {
    constructor(top, bot, height) {
        super();
        let t = top / 2;
        let b = bot / 2;
        let h = height / 2;
        this.positions.push(...Vec.cast([-1 * b, -1 * h, 0], [b, -1 * h, 0], [-1 * t, h, 0], [t, h, 0]));
        this.normals.push(...Vec.cast([0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0, 0], [1, 0], [0, 1], [1, 1]));
        this.indices.push(0, 1, 2, 1, 3, 2);
    }
}

class Hexagon extends Shape {
    constructor() {
        super();
        let transform = Mat4.scale(Vec.of(1, Math.sqrt(3), 1)).times(Mat4.rotation(Math.PI / 4, Vec.of(0, 0, 1)));
        for (var i = 0; i < 6; i++) {
            transform = Mat4.rotation(Math.PI / 3, Vec.of(0, 0, 1)).times(transform);
            Triangle.prototype.insert_transformed_copy_into(this, [], transform);
        }
    }
}

class Pyramid extends Shape {
    constructor() {
        super();
        Square.prototype.insert_transformed_copy_into(this, [], Mat4.translation(Vec.of(0, -0.5, 0)).times(Mat4.rotation(Math.PI / 2, Vec.of(-1, 0, 0))));
        let transform = Mat4.scale(Vec.of(Math.sqrt(2), 2, 1)).times(Mat4.rotation(-3 * Math.PI / 4, Vec.of(0, 0, 1)));
        transform = Mat4.rotation(-1 * Math.PI / 4, Vec.of(1, 0, 0)).times(Mat4.translation(Vec.of(0, Math.sqrt(2) / 2, 0)).times(transform));
        let move_out = Mat4.translation(Vec.of(0, 0, 0.5));
        for (var i = 0; i < 4; i++) {
            Triangle.prototype.insert_transformed_copy_into(this, [],Mat4.rotation(Math.PI / 2 * i, Vec.of(0, 1, 0)).times(move_out).times(transform));
        }
        
    }
}

class Trapezoid_Prism extends Shape {
    constructor(top, bot, height) {
        super();
        let t = top / 2;
        let b = bot / 2;
        let h = height / 2;
        let top_transform = Mat4.translation([0, h, 0]).times(Mat4.rotation(-1 * Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([t, t, 1]));
        let bot_transform = Mat4.translation([0, -1 * h, 0]).times(Mat4.rotation(-1 * Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([b, b, 1]));
        Square.prototype.insert_transformed_copy_into(this, [], top_transform);
        Square.prototype.insert_transformed_copy_into(this, [], bot_transform);

        let theta = Math.atan((b - t) / height);
        let l = Math.sqrt(Math.pow(height, 2) + Math.pow(b - t, 2));
        let tilt = Mat4.rotation(-1 * theta, Vec.of(1, 0, 0));
        let move_out = Mat4.translation([0, 0, (t + b) / 2]);
        for (var i = 0; i < 4; i++) {
            let transform = Mat4.rotation(Math.PI / 2 * i, Vec.of(0, 1, 0)).times(move_out.times(tilt));
            Trapezoid.prototype.insert_transformed_copy_into(this, [top, bot, l], transform);
        }
    }
}

class Wizard_Hat extends Shape {
    constructor() {
        super();
        Trapezoid_Prism.prototype.insert_transformed_copy_into(this, [1.6, 3, 0.4], Mat4.translation(Vec.of(0, -0.2, 0)));
        //let top_transform = Mat4.translation(Vec.of(0, 1, 0)).times(Mat4.scale(Vec.of(0.8, 2, 0.8)));
        //Pyramid.prototype.insert_transformed_copy_into(this, [], top_transform);
        Trapezoid_Prism.prototype.insert_transformed_copy_into(this, [1.0, 1.6, 0.4], Mat4.translation(Vec.of(0, 0.2, 0)));
        Pyramid.prototype.insert_transformed_copy_into(this, [], Mat4.translation(Vec.of(0, 0.7, 0)).times(Mat4.scale(Vec.of(0.8, 2, 0.8))));
    }
}

class Crate_Shape extends Shape {
    constructor() {
        super();
        Cube.prototype.insert_transformed_copy_into(this, [], Mat4.scale(Vec.of(0.8, 0.8, 0.8)));
        let sides = [-1, 1];
        for (let i in sides) {
            let left_trans = Mat4.translation(Vec.of(-0.9, sides[i] * 0.9, 0));
            let right_trans = Mat4.translation(Vec.of(0.9, sides[i] * 0.9, 0));
            let top_trans = Mat4.translation(Vec.of(0, sides[i] * 0.9, -0.9));
            let bot_trans = Mat4.translation(Vec.of(0, sides[i] * 0.9, 0.9));

            let left_scale = Mat4.scale(Vec.of(0.1, 0.1, 1));
            let top_scale = Mat4.scale(Vec.of(0.8, 0.1, 0.1));


            Cube.prototype.insert_transformed_copy_into(this, [], left_trans.times(left_scale));
            Cube.prototype.insert_transformed_copy_into(this, [], right_trans.times(left_scale));
            Cube.prototype.insert_transformed_copy_into(this, [], top_trans.times(top_scale));
            Cube.prototype.insert_transformed_copy_into(this, [], bot_trans.times(top_scale));

        }

        let side_trans = Mat4.translation(Vec.of(0.9, 0, 0.9));
        for (let i = 0; i < 4; i++) {
            let side_pos = Mat4.rotation(Math.PI / 2 * i, Vec.of(0, 1, 0)).times(side_trans);
            Cube.prototype.insert_transformed_copy_into(this, [], side_pos.times(Mat4.scale(Vec.of(0.1, 0.8, 0.1))));
        }

    }
}

class Pillar_Shape extends Shape {
    constructor(sections) {
        super();
        let move_up = Mat4.translation(Vec.of(0, 1.4, 0));
        let small_section = Mat4.scale([0.8, 0.4, 0.8]);
        let large_section = Mat4.scale([1, 1, 1]);
        let cur_pos = Mat4.identity();
        for (var i = 0; i < sections; i++) {
            Cube.prototype.insert_transformed_copy_into(this, [], cur_pos.times(large_section));
            cur_pos = cur_pos.times(move_up);
            Cube.prototype.insert_transformed_copy_into(this, [], cur_pos.times(small_section));
            cur_pos = cur_pos.times(move_up);
        }
        Trapezoid_Prism.prototype.insert_transformed_copy_into(this, [2.4, 1.6, 1], cur_pos.times(Mat4.translation(Vec.of(0, -0.9, 0))));
    }
}

class Lightning extends Shape {
    constructor() {
        super();
        this.positions.push(...Vec.cast([-1, -1, 0], [-2, 1, 0], [2, 2, 0], [1, 1, 0], [2, -1, 0], [-2, -2, 0]));
        for (var i = 0; i < 6; i++)
            this.normals.push([0, 0, 1]);
        this.texture_coords.push(...Vec.cast([0, 0], [1, 0], [0, 1], [0, 0], [1, 0], [0, 1]));
        this.indices.push(0, 1, 2, 3, 4, 5);
    }

}

class Goblet_Shape extends Shape {
    constructor() {
        super();
        let init_pos = Mat4.translation(Vec.of(0, -1, 0));
        Trapezoid_Prism.prototype.insert_transformed_copy_into(this, [1, 1.2, 1], init_pos);
        Cube.prototype.insert_transformed_copy_into(this, [], init_pos.times(Mat4.translation(Vec.of(0, 1, 0))).times(Mat4.scale(Vec.of(0.5, 0.5, 0.5))));
        Trapezoid_Prism.prototype.insert_transformed_copy_into(this, [2, 1, 1], init_pos.times(Mat4.translation(Vec.of(0, 2, 0))));
    }
}
