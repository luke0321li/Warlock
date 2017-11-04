class Trapezoid extends Shape {
    constructor() {
        super();
        this.positions.push(...Vec.cast([-1, -1.5, 0], [1, -1.5, 0], [-1, 1, 0], [1, 1, 0]));
        this.normals.push(...Vec.cast([0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0, 0], [1, 0], [0, 1], [1, 1]));
        this.indices.push(0, 1, 2, 1, 3, 2);
    }
}

class Trapezoid_Prism extends Shape {
    constructor() {
        super();
        let top_transform = Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0)).times(Mat4.translation([0, 1, 0]));
        let bot_trasnform = Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0)).times(Mat4.translation([0, -1, 0])).times(Mat4.scale([1.5, 1.5, 1]));
        Square.prototype.insert_transformed_copy_into(this, [], top_transform);
        Square.prototype.insert_transformed_copy_into(this, [], bot_transform);
        
        

    }
}