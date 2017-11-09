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

class Trapezoid_Prism extends Shape {
    constructor(top, bot, height) {
        super();
        let t = top / 2; 
        let b = bot / 2;
        let h = height / 2;
        let top_transform = Mat4.translation([0, h, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([t, t, 1]));
        let bot_transform = Mat4.translation([0, -1 * h, 0]).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.scale([b, b, 1]));
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
