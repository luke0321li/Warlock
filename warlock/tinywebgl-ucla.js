// tinywebgl_ucla.js - A file that shows how to organize a complete graphics program.  It wraps common WebGL commands, math, and web page interactions.  By Garett

class Vec extends Float32Array // Vectors of floating point numbers.  Vecs can only be created with of().  See the following examples for usage:
{
    equals(b) {
        return this.every((x, i) => x == b[i]);
    } // Example: "Vec.of( 1,0,0 ).equals( Vec.of( 1,0,0 ) )" returns true.
    plus(b) {
        return this.map((x, i) => x + b[i]);
    } // Example: "Vec.of( 1,0,0 ).plus  ( Vec.of( 1,0,0 ) )" returns the Vec [ 2,0,0 ].
    minus(b) {
        return this.map((x, i) => x - b[i]);
    } // Example: "Vec.of( 1,0,0 ).minus ( Vec.of( 1,0,0 ) )" returns the Vec [ 0,0,0 ].
    mult_pairs(b) {
        return this.map((x, i) => x * b[i]);
    } // Example: "Vec.of( 1,2,3 ).mult_pairs( Vec.of( 3,2,0 ) )" returns the Vec [ 3,4,0 ].
    scale(s) {
        this.forEach((x, i, a) => a[i] *= s);
    } // Example: "Vec.of( 1,2,3 ).scale( 2 )" overwrites the Vec with [ 2,4,6 ].
    times(s) {
        return this.map(x => s * x);
    } // Example: "Vec.of( 1,2,3 ).times( 2 )" returns the Vec [ 2,4,6 ].
    randomized(s) {
        return this.map(x => x + s * (Math.random() - .5));
    } // Returns this Vec with a random vector added, with a maximum scale of s.
    mix(b, s) {
        return this.map((x, i) => (1 - s) * x + s * b[i]);
    } // Example: "Vec.of( 0,2,4 ).mix( Vec.of( 10,10,10 ), .5 )" returns the Vec [ 5,6,7 ].
    norm() {
        return Math.sqrt(this.dot(this));
    } // Example: "Vec.of( 1,2,3 ).norm()" returns the square root of 15.
    normalized() {
        return this.times(1 / this.norm());
    } // Example: "Vec.of( 4,4,4 ).normalized()" returns the Vec [ sqrt(3), sqrt(3), sqrt(3) ]
    normalize() {
        this.scale(1 / this.norm());
    } // Example: "Vec.of( 4,4,4 ).normalize()" overwrites the Vec with [ sqrt(3), sqrt(3), sqrt(3) ].
    dot(b) // Example: "Vec.of( 1,2,3 ).dot( Vec.of( 1,2,3 ) )" returns 15. 
    {
        if (this.length == 3) return this[0] * b[0] + this[1] * b[1] + this[2] * b[2]; // Optimized to do the arithmatic manually for array lengths less than 4.
        if (this.length == 4) return this[0] * b[0] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3];
        if (this.length > 4) return this.reduce((acc, x, i) => {
            return acc + x * b[i];
        }, 0);
        return this[0] * b[0] + this[1] * b[1]; // Assume length 2 otherwise.
    } // Using cast() saves having to type Vec.of so many times:
    static cast(...args) {
        return args.map(x => Vec.from(x));
    } // Convert a list of Array literals into a list of Vecs.  Usage: "Vec.cast( [-1,-1,0], [1,-1,0], [-1,1,0] )"
    to3() {
        return Vec.of(this[0], this[1], this[2]);
    } // Use only on 4x1 Vecs to truncate them.  Example: "Vec.of( 1,2,3,4 ).to3()" returns the Vec [ 1,2,3 ].
    to4(isPoint) {
        return Vec.of(this[0], this[1], this[2], +isPoint);
    } // Use only on 3x1 Vecs to homogenize them.  Example: "Vec.of( 1,2,3 ).to4( true or false )" returns the Vec [ 1,2,3, 1 or 0 ].
    cross(b) // Use only on 3x1 Vecs.  Example: "Vec.of( 1,0,0 ).cross( Vec.of( 0,1,0 ) )" returns the Vec [ 0,0,1 ].      
    {
        return Vec.of(this[1] * b[2] - this[2] * b[1], this[2] * b[0] - this[0] * b[2], this[0] * b[1] - this[1] * b[0]);
    }
}

class Mat extends Array // M by N matrices of floats, for matrix and vector math.
{
    constructor(...args) {
        super(0);
        this.push(...args);
    } // Pass in rows (which can be arrays).  
    set_identity(m, n) {
        this.length = 0;
        for (let i = 0; i < m; i++) {
            this.push(new Array(n).fill(0));
            if (i < n) this[i][i] = 1;
        }
    } // Returns an m by n identity matrix.
    sub_block(start, end) {
        return Mat.from(this.slice(start[0], end[0]).map(r => r.slice(start[1], end[1])));
    } // Both of start and end must be a [ row, column ].
    copy() {
        return this.map(r => Vec.of(...r));
    }
    equals(b) {
        return this.every((r, i) => r.every((x, j) => x == b[i][j]));
    }
    plus(b) {
        return this.map((r, i) => r.map((x, j) => x + b[i][j]));
    }
    minus(b) {
        return this.map((r, i) => r.map((x, j) => x - b[i][j]));
    }
    transposed() {
        return this.map((r, i) => r.map((x, j) => this[j][i]));
    } // Transposing turns all rows into columns and vice versa.
    times(b) {
        const len = b.length; // Usage: M.times(b) where b can be a scalar, a Vec, or another Mat.  Returns a new Mat.
        if (typeof len === "undefined") return this.map(r => r.map(x => b * x)); // Mat * scalar case.
        const len2 = b[0].length;
        if (typeof len2 === "undefined") {
            let result = Vec.of(...new Array(this.length)); // Mat * Vec case.
            for (var r = 0; r < len; r++) result[r] = b.dot(this[r]);
            return result;
        }
        let result = Mat.from(new Array(this.length));
        for (let r = 0; r < this.length; r++) // Mat * Mat case.
        {
            result[r] = new Array(len2);
            for (let c = 0, sum = 0; c < len2; c++) {
                result[r][c] = 0;
                for (let r2 = 0; r2 < len; r2++)
                    result[r][c] += this[r][r2] * b[r2][c];
            }
        }
        return result;
    }
    pre_multiply(b) {
        var new_value = b.times(this);
        this.length = 0;
        this.push(...new_value);
        return this;
    } // Overwrites the matrix with the new product.
    post_multiply(b) {
        var new_value = this.times(b);
        this.length = 0;
        this.push(...new_value);
        return this;
    } // Overwrites the matrix with the new product.
    static flatten_2D_to_1D(M) // Turn any 2D Array into a row-major 1D array of raw floats.
    {
        var index = 0,
            floats = new Float32Array(M.length && M.length * M[0].length);
        for (let i = 0; i < M.length; i++)
            for (let j = 0; j < M[i].length; j++) floats[index++] = M[i][j];
        return floats;
    }
}

class Mat4 extends Mat // Special 4x4 matrices that are useful for graphics.
{
    static identity() {
        return Mat.of([1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]);
    };
    static rotation(angle, axis) // Requires a scalar (angle) and a 3x1 Vec (axis)
    {
        let [x, y, z] = axis.normalized(), [c, s] = [Math.cos(angle), Math.sin(angle)], omc = 1.0 - c;
        return Mat.of([x * x * omc + c, x * y * omc - z * s, x * z * omc + y * s, 0], [x * y * omc + z * s, y * y * omc + c, y * z * omc - x * s, 0], [x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c, 0], [0, 0, 0, 1]);
    }
    static scale(s) {
        return Mat.of([s[0], 0, 0, 0], // Requires a 3x1 Vec.
                                           [0, s[1], 0, 0], [0, 0, s[2], 0], [0, 0, 0, 1]);
    }
    static translation(t) {
        return Mat.of([1, 0, 0, t[0]], // Requires a 3x1 Vec.
                                           [0, 1, 0, t[1]], [0, 0, 1, t[2]], [0, 0, 0, 1]); // Note:  look_at() assumes the result will used for a camera and stores its result in
    } //     inverse space.  You can also use it to point the basis of any *object* towards 
    // Note:  look_at() assumes the result will used for a camera and stores its result in
    //     inverse space.  You can also use it to point the basis of any *object* towards 
    static look_at(eye, at, up) {
        let z = at.minus(eye).normalized(), //     anything but you must re-invert it first.  Each input must be 3x1 Vec.
            x = z.cross(up).normalized(), //  Compute vectors along the requested coordinate axes.
            y = x.cross(z).normalized(); //  (y is the "updated" and orthogonalized local y axis.)
        if (!x.every(i => i == i)) throw "Two parallel vectors were given"; // Check for NaN, indicating a degenerate cross product, which
        z.scale(-1); // happens if eye == at, or if at minus eye is parallel to up.
        return Mat4.translation([-x.dot(eye), -y.dot(eye), -z.dot(eye)]).times(Mat.of(x.to4(0), y.to4(0), z.to4(0), Vec.of(0, 0, 0, 1)));
    }
    static orthographic(left, right, bottom, top, near, far) // Box-shaped view volume for projection.
    {
        return Mat4.scale(Vec.of(1 / (right - left), 1 / (top - bottom), 1 / (far - near))).times(
            Mat4.translation(Vec.of(-left - right, -top - bottom, -near - far))).times(
            Mat4.scale(Vec.of(2, 2, -2)));
    }
    static perspective(fov_y, aspect, near, far) // Frustum-shaped view volume for projection.
    {
        var f = 1 / Math.tan(fov_y / 2),
            d = far - near;
        return Mat.of([f / aspect, 0, 0, 0], [0, f, 0, 0], [0, 0, -(near + far) / d, -2 * near * far / d], [0, 0, -1, 0]);
    }
    static inverse(m) // Slow because of the amount of steps; call fewer times when possible.
    {
        var result = Mat4.identity(),
            m00 = m[0][0],
            m01 = m[0][1],
            m02 = m[0][2],
            m03 = m[0][3],
            m10 = m[1][0],
            m11 = m[1][1],
            m12 = m[1][2],
            m13 = m[1][3],
            m20 = m[2][0],
            m21 = m[2][1],
            m22 = m[2][2],
            m23 = m[2][3],
            m30 = m[3][0],
            m31 = m[3][1],
            m32 = m[3][2],
            m33 = m[3][3];
        result[0][0] = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;
        result[0][1] = m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 + m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33;
        result[0][2] = m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 - m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33;
        result[0][3] = m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 + m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23;
        result[1][0] = m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 + m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33;
        result[1][1] = m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 - m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33;
        result[1][2] = m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 + m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33;
        result[1][3] = m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 - m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23;
        result[2][0] = m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 - m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33;
        result[2][1] = m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 + m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33;
        result[2][2] = m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 - m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33;
        result[2][3] = m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 + m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23;
        result[3][0] = m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 + m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32;
        result[3][1] = m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 - m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32;
        result[3][2] = m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 + m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32;
        result[3][3] = m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22;

        return result.times(1 / (m00 * result[0][0] + m10 * result[0][1] + m20 * result[0][2] + m30 * result[0][3])); // Divide by determinant and return.
    }
}


class Shape
// Each shape manages lists of its own vertex positions, vertex normals, and texture coordinates per vertex, and can copy them into a buffer in the graphics card's memory.
// IMPORTANT: When you extend the Shape class, your constructor must fill in four arrays: One list enumerating all the vertices' (3x1 Vec) positions, one for
// their (3x1 Vec) normal vectors pointing away from the surface, one for their (2x1 Vec) texture coordinates (the vertex's position in an image's coordinate space,
// where the whole picture spans x and y in the range 0.0 to 1.0), and usually one for indices, a list of index triples defining which three vertices
// belong to each triangle.  Call new on a Shape and submit it to your Canvas_Manager object; it will populate its arrays and the GPU buffers will recieve them.
{
    constructor() {
        Object.assign(this, {
            positions: [],
            normals: [],
            texture_coords: [],
            colors: [],
            indices: [],
            indexed: true
        });
    }
    copy_onto_graphics_card(gl) // Send the completed vertex and index lists to their own buffers in the graphics card.
    {
        this.graphics_card_buffers = [];
        for (var i = 0; i < 4; i++) // Create buffers for this shape in the graphics card:
        {
            this.graphics_card_buffers.push(gl.createBuffer()); // Store their memory addresses
            gl.bindBuffer(gl.ARRAY_BUFFER, this.graphics_card_buffers[i]);
            switch (i) {
                case 0:
                    gl.bufferData(gl.ARRAY_BUFFER, Mat.flatten_2D_to_1D(this.positions), gl.STATIC_DRAW);
                    break;
                case 1:
                    gl.bufferData(gl.ARRAY_BUFFER, Mat.flatten_2D_to_1D(this.normals), gl.STATIC_DRAW);
                    break;
                case 2:
                    gl.bufferData(gl.ARRAY_BUFFER, Mat.flatten_2D_to_1D(this.texture_coords), gl.STATIC_DRAW);
                    break;
                case 3:
                    gl.bufferData(gl.ARRAY_BUFFER, Mat.flatten_2D_to_1D(this.colors), gl.STATIC_DRAW);
                    break;
            }
        }
        if (this.indexed) {
            gl.getExtension("OES_element_index_uint"); // Load an extension to allow shapes with more vertices than type short can hold
            this.index_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW);
        }
        this.gl = gl;
    }
    draw(graphics_state, model_transform, material, gl = this.gl) // The same draw() function is used for every shape -
    {
        if (!this.gl) throw "This shape's arrays are not copied over to graphics card yet."; // these calls produce different results by varying which
        material.shader.activate(); // vertex list in the GPU we consult.
        material.shader.update_GPU(graphics_state, model_transform, material);

        for (let [i, it] of material.shader.g_addrs.shader_attributes.entries())
            if (it.enabled) {
                gl.enableVertexAttribArray(it.index);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.graphics_card_buffers[i]); // Activate the correct buffer.
                gl.vertexAttribPointer(it.index, it.size, it.type, it.normalized, it.stride, it.pointer); // Populate each attribute from the active buffer.
            }
        else if (it.index >= 0) gl.disableVertexAttribArray(it.index);

        if (this.indexed) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer); // Run the shaders to draw every triangle now.
            gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
        } else gl.drawArrays(gl.TRIANGLES, 0, this.positions.length); // If no indices were provided, assume the vertices are arranged in triples.
    }
    normalize_positions() // Enforces a shape to have an average position at the origin and conform to an average distance of 1 from the origin
    {
        var average_position = Vec.of(0, 0, 0),
            average_length = 0;
        for (let [i, p] of this.positions.entries()) average_position = average_position.plus(p.times(1 / this.positions.length));
        for (let [i, p] of this.positions.entries()) this.positions[i] = p.minus(average_position);
        for (let [i, p] of this.positions.entries()) average_length += 1 / this.positions.length * p.norm();
        for (let [i, p] of this.positions.entries()) this.positions[i] = p.times(1 / average_length);
    }
    store_containing_basis() // Get the smallest basis aligned with the canonical axes where all points in this shape fall in the range 0 to 1
    {
        let min_position = Vec.of(1, 1, 1).times(Infinity),
            max_position = Vec.of(1, 1, 1).times(-Infinity);
        for (let p of this.positions)
            for (let i = 0; i < 3; i++) {
                min_position[i] = Math.min(min_position[i], p[i]);
                max_position[i] = Math.max(max_position[i], p[i]);
            }
        this.containing_basis = Mat4.translation(min_position).times(Mat4.scale(max_position.minus(min_position)));
    }
    insert_transformed_copy_into(recipient, args, points_transform = Mat4.identity(), positions_only = false) // For building compound shapes.
    {
        let temp_shape = new(this.constructor)(...args); // If you try to bypass making a temporary shape and instead directly insert new data into
        // the recipient, you'll run into trouble when the recursion tree stops at different depths.
        recipient.indices.push(...temp_shape.indices.map(i => i + recipient.positions.length));
        // Apply points_transform to all points added during this call:
        recipient.positions.push(...temp_shape.positions.map(p => points_transform.times(p.to4(1)).to3()));
        if (positions_only) return; // Do the same for normals if we want them:
        recipient.normals.push(...temp_shape.normals.map(n => Mat4.inverse(points_transform.transposed()).times(n.to4(1)).to3()));
        recipient.texture_coords.push(...temp_shape.texture_coords); // Lastly, append texture coords.
    }
    cull_zero_area_triangles(threshold = .0001) // Useful when automatically building certin shapes where triangles can become degenerate near singularities.
    {
        let new_positions = [],
            new_normals = [],
            new_texture_coords = [],
            new_colors = [];

        if (this.indexed) return; // TODO:  Also handle indexed shapes.  Also delete vertex data no longer referenced after indices are culled.

        for (var counter = 0; counter < this.positions.length; counter += 3) {
            const [p1, p2, p3] = this.positions.slice(counter, counter + 3),
                area = .5 * p1.minus(p2).cross(p3.minus(p1)).norm();
            if (area > threshold) {
                new_positions.push(...this.positions.slice(counter, counter + 3));
                new_normals.push(...this.texture_coords.slice(counter, counter + 3));
                new_texture_coords.push(...this.normals.slice(counter, counter + 3));
                new_colors.push(...this.colors.slice(counter, counter + 3));
            }
        }
        this.positions = new_positions;
        this.normals = new_normals;
        this.texture_coords = new_texture_coords;
        this.colors = new_colors;
    }
    make_flat_shaded_version() // Auto-generate a new class that re-uses any Shape's points, but with new normals generated from flat shading.
    {
        return class extends this.constructor {
            constructor(...args) {
                super(...args);
                this.duplicate_the_shared_vertices();
                this.flat_shade();
            }
            duplicate_the_shared_vertices() { // Prepare an indexed shape for flat shading if it is not ready -- that is, if there are any edges where the same vertices are indexed by both the adjacent 
                // triangles, and those two triangles are not co-planar.  The two would therefore fight over assigning different normal vectors to the shared vertices.
                var temp_positions = [],
                    temp_tex_coords = [],
                    temp_indices = [];
                for (let [i, it] of this.indices.entries()) {
                    temp_positions.push(this.positions[it]);
                    temp_tex_coords.push(this.texture_coords[it]);
                    temp_indices.push(i);
                }
                this.positions = temp_positions;
                this.indices = temp_indices;
                this.texture_coords = temp_tex_coords;
            }
            flat_shade() // Automatically assign the correct normals to each triangular element to achieve flat shading.  Affect all
            { // recently added triangles (those past "offset" in the list).  Assumes that no vertices are shared across seams.        
                for (var counter = 0; counter < (this.indexed ? this.indices.length : this.positions.length); counter += 3) // Iterate through appropriate triples
                {
                    var indices = this.indexed ? [this.indices[counter], this.indices[counter + 1], this.indices[counter + 2]] : [counter, counter + 1, counter + 2];
                    var p1 = this.positions[indices[0]],
                        p2 = this.positions[indices[1]],
                        p3 = this.positions[indices[2]];
                    var n1 = p1.minus(p2).cross(p3.minus(p1)).normalized(); // Cross two edge vectors of this triangle together to get the normal

                    if (n1.times(.1).plus(p1).norm() < p1.norm()) n1.scale(-1); // Flip the normal if adding it to the triangle brings it closer to the origin.

                    for (let i of indices) this.normals[i] = Vec.from(n1); // Propagate normal to the 3 vertices.
                }
            }
        }
    }
}

class Keyboard_Manager // Compact and fixed version of shortcut.js keyboard library on Github; go there for full documentation.
{
    constructor() {
        this.all_shortcuts = {};
        this.paused = false;
    }
    add(shortcut_combination, callback, opt) {
        var default_options = {
            'type': 'keydown',
            'propagate': false,
            'disable_in_input': true,
            'target': document,
            'keycode': false
        }
        if (!opt) opt = default_options;
        else
            for (var dfo in default_options)
                if (typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
        var ele = opt.target == 'string' ? document.getElementById(opt.target) : opt.target;
        shortcut_combination = shortcut_combination.toLowerCase();
        var onkeypress = (function (e) // On each keypress, this gets called [# of bound keys] times
            {
                if (this.paused) return;
                e = e || window.event;
                if (opt['disable_in_input']) {
                    var element = e.target || e.srcElement || element.parentNode;
                    if (element.nodeType == 3) element = element.parentNode;
                    if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
                }
                var code = e.keyCode || e.which,
                    character = code == 188 ? "," : (code == 190 ? "." : String.fromCharCode(code).toLowerCase());
                var keycombo = shortcut_combination.split("+"),
                    num_pressed = 0;
                var special_keys = {
                    'esc': 27,
                    'escape': 27,
                    'tab': 9,
                    'space': 32,
                    'return': 13,
                    'enter': 13,
                    'backspace': 8,
                    'pause': 19,
                    'break': 19,
                    'insert': 45,
                    'home': 36,
                    'delete': 46,
                    'end': 35,
                    'page_up': 33,
                    'page_down': 34,
                    'left': 37,
                    'up': 38,
                    'right': 39,
                    'down': 40,
                    'f1': 112,
                    'f2': 113,
                    'f3': 114,
                    'f4': 115,
                    'f5': 116,
                    'f6': 117,
                    'f7': 118,
                    'f8': 119,
                    'f9': 120,
                    'f10': 121,
                    'f11': 122,
                    'f12': 123
                }
                var modifiers = {
                    shift: {
                        wanted: false,
                        pressed: e.shiftKey
                    },
                    ctrl: {
                        wanted: false,
                        pressed: e.ctrlKey
                    },
                    alt: {
                        wanted: false,
                        pressed: e.altKey
                    },
                    meta: {
                        wanted: false,
                        pressed: e.metaKey
                    }
                }; // ( Mac specific )
                for (let k of keycombo) // Check if current keycombo in consideration matches the actual keypress
                {
                    modifiers.ctrl.wanted |= (k == 'ctrl' || k == 'control' && ++num_pressed);
                    modifiers.shift.wanted |= (k == 'shift' && ++num_pressed);
                    modifiers.alt.wanted |= (k == 'alt' && ++num_pressed);
                    modifiers.meta.wanted |= (k == 'meta' && ++num_pressed);
                    var shift_nums = {
                        "`": "~",
                        "1": "!",
                        "2": "@",
                        "3": "#",
                        "4": "$",
                        "5": "%",
                        "6": "^",
                        "7": "&",
                        "8": "*",
                        "9": "(",
                        "0": ")",
                        "-": "_",
                        "=": "+",
                        ";": ":",
                        "'": "\"",
                        ",": "<",
                        ".": ">",
                        "/": "?",
                        "\\": "|"
                    }
                    if (k.length > 1 && special_keys[k] == code) num_pressed++;
                    else if (opt['keycode'] && opt['keycode'] == code) num_pressed++;
                    else if (character == k) num_pressed++; //The special keys did not match
                    else if (shift_nums[character] && e.shiftKey) {
                        character = shift_nums[character];
                        if (character == k) num_pressed++;
                    }
                }
                if (num_pressed == keycombo.length && modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
                    modifiers.shift.pressed == modifiers.shift.wanted &&
                    modifiers.alt.pressed == modifiers.alt.wanted &&
                    modifiers.meta.pressed == modifiers.meta.wanted) {
                    callback(e); // *** Fire off the function that matched the pressed keys ***********************************
                    if (!opt['propagate']) {
                        e.cancelBubble = true;
                        e.returnValue = false;
                        if (e.stopPropagation) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                        return;
                    }
                }
            }).bind(this);
        this.all_shortcuts[shortcut_combination] = {
            'callback': onkeypress,
            'target': ele,
            'event': opt['type']
        };
        if (ele.addEventListener) ele.addEventListener(opt['type'], onkeypress, false);
        else if (ele.attachEvent) ele.attachEvent('on' + opt['type'], onkeypress);
        else ele['on' + opt['type']] = onkeypress;
    }
    remove(shortcut_combination) // Just specify the shortcut and this will remove the binding
    {
        shortcut_combination = shortcut_combination.toLowerCase();
        var binding = this.all_shortcuts[shortcut_combination];
        delete(this.all_shortcuts[shortcut_combination])
        if (!binding) return;
        var type = binding['event'],
            ele = binding['target'],
            callback = binding['callback'];
        if (ele.detachEvent) ele.detachEvent('on' + type, callback);
        else if (ele.removeEventListener) ele.removeEventListener(type, callback, false);
        else ele['on' + type] = false;
    }
}

class Graphics_State // Stores things that affect multiple shapes, such as lights and the camera.
{
    constructor(camera_transform = Mat4.identity(), projection_transform = Mat4.identity()) {
        Object.assign(this, {
            camera_transform,
            projection_transform,
            animation_time: 0,
            animation_delta_time: 0,
            lights: []
        });
    }
}
class Light // The properties of one light in the scene (Two 4x1 Vecs and a scalar)
{
    constructor(position, color, size) {
        Object.assign(this, {
            position,
            color,
            attenuation: 1 / size
        });
    }
};

class Color extends Vec // Just an alias.   Colors are just special 4x1 vectors expressed as: ( red, green, blue, opacity ) each from 0 to 1.
{}
class Graphics_Addresses // For organizing communication with the GPU for Shaders
{
    constructor(program, gl) {
        var num_uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < num_uniforms; ++i) {
            var u = gl.getActiveUniform(program, i).name.split('[')[0]; // Retrieve the GPU addresses of each uniform variable in the shader,
            this[u + "_loc"] = gl.getUniformLocation(program, u); // based on their names, and store these pointers for later.
        }
        class Shader_Attribute {
            constructor(name, size, type, enabled, normalized, stride, pointer) {
                Object.assign(this, {
                    index: gl.getAttribLocation(program, name),
                    size,
                    type,
                    enabled,
                    normalized,
                    stride,
                    pointer
                });
            }
        }
        this.shader_attributes = [new Shader_Attribute("object_space_pos", 3, gl.FLOAT, true, false, 0, 0), // Pointers to all shader
                               new Shader_Attribute("normal", 3, gl.FLOAT, true, false, 0, 0), // attribute variables
                               new Shader_Attribute("tex_coord", 2, gl.FLOAT, false, false, 0, 0),
                               new Shader_Attribute("color", 4, gl.FLOAT, false, false, 0, 0)];
    }
}

class Shader // Manages strings of GLSL code that will be sent to the GPU and will run to draw every shape.
{
    constructor(gl) // Extend the class and fill in the abstract functions to make the constructor work.
    {
        Object.assign(this, {
            gl,
            program: gl.createProgram()
        });
        var shared = this.shared_glsl_code() || "";

        var vertShdr = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShdr, shared + this.vertex_glsl_code());
        gl.compileShader(vertShdr);
        if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) throw "Vertex shader compile error: " + gl.getShaderInfoLog(vertShdr);

        var fragShdr = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShdr, shared + this.fragment_glsl_code());
        gl.compileShader(fragShdr);
        if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) throw "Fragment shader compile error: " + gl.getShaderInfoLog(fragShdr);

        gl.attachShader(this.program, vertShdr);
        gl.attachShader(this.program, fragShdr);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw "Shader linker error: " + gl.getProgramInfoLog(this.program);
        this.g_addrs = new Graphics_Addresses(this.program, this.gl);
    }
    activate() {
        this.gl.useProgram(this.program);
    }
    material() {}
    update_GPU() {}
    shared_glsl_code() {}
    vertex_glsl_code() {}
    fragment_glsl_code() {} // You have to override these functions
}

class Texture // Wrap a pointer to a new texture buffer along with a new HTML image object.
{
    constructor(gl, filename, bool_mipMap, bool_will_copy_to_GPU = true) {
        Object.assign(this, {
            filename,
            bool_mipMap,
            bool_will_copy_to_GPU,
            id: gl.createTexture()
        });

        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 0, 255])); // A single red pixel, as a placeholder image to prevent a console warning.
        this.image = new Image();
        this.image.onload = (function (texture, bool_mipMap) // This self-executing anonymous function makes the real onload() function:
            {
                return function () // Instrctions for whenever the real image file is ready
                {
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, bool_will_copy_to_GPU);
                    gl.bindTexture(gl.TEXTURE_2D, texture.id);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // Always use bi-linear sampling when the image will appear magnified.
                    if (bool_mipMap) // When it will appear shrunk, then either use tri-linear sampling of its mip maps:
                    {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                        gl.generateMipmap(gl.TEXTURE_2D);
                    } else
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // Or use the worst sampling method, to illustrate the difference.
                    texture.loaded = true;
                }
            })(this, bool_mipMap, bool_will_copy_to_GPU);
        if (bool_will_copy_to_GPU) {
            this.image.crossOrigin = "Anonymous";
            this.image.src = this.filename;
        } // Avoid a browser warning, and load the image file.
    }
}

class Canvas_Manager // This class manages a whole graphics program for one on-page canvas, including its textures, shapes, shaders, and scenes.
{
    constructor(canvas_id, background_color, scenes) // In addition to requesting a WebGL context, it stores Shaders and Textures, and informs the canvas 
    {
        var gl, demos = [],
            canvas = document.getElementById(canvas_id); // of which functions to call during events - such as a key getting pressed or it being time to redraw.
        Object.assign(this, {
            instances: new Map(),
            shapes_in_use: {},
            scene_components: [],
            prev_time: 0,
            canvas,
            width: canvas.clientWidth,
            height: canvas.clientHeight,
            globals: {
                animate: true,
                string_map: {},
                graphics_state: new Graphics_State()
            }
        });

        for (let name of ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"])
            if (gl = this.gl = this.canvas.getContext(name)) break; // Get the GPU ready, creating a new WebGL context for this canvas
        if (!gl) throw "Canvas failed to make a WebGL context.";
        for (let s of scenes) this.register_scene_component(new(eval(s))(this)); // Register the initially requested scenes to the render loop.

        gl.clearColor.apply(gl, background_color); // Tell the GPU which color to clear the canvas with each frame
        gl.viewport(0, 0, this.width, this.height); // Build the canvas's matrix for converting -1 to 1 ranged coords to its own pixel coords.
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND); // Enable Z-Buffering test with blending
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Specify an interpolation method for blending "transparent" triangles over the existing pixels      
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture()); // A single red pixel, as a placeholder image to prevent a console warning:
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));

        window.requestAnimFrame = (w => // Find the correct browser's version of requestAnimationFrame() needed for queue-ing up re-display events: 
            w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.mozRequestAnimationFrame || w.oRequestAnimationFrame || w.msRequestAnimationFrame ||
            function (callback, element) {
                w.setTimeout(callback, 1000 / 60);
            })(window);
    }
    get_instance(shader_or_texture) // If a scene requests that the Canvas keeps a certain Shader or Texture loaded, check if we already have one first.
    {
        if (this.instances[shader_or_texture]) return this.instances[shader_or_texture]; // Return the one that already is loaded if it exists.  Otherwise,
        if (typeof shader_or_texture == "string") return this.instances[shader_or_texture] = new Texture(this.gl, shader_or_texture, true); // Load requested texture onto GPU buffer, or:
        return this.instances[shader_or_texture] = new(shader_or_texture)(this.gl); // Compile and put the requested shader onto the GPU.
    }
    register_scene_component(component) // The first Scene_Component to be added gets to show its text.  Every Scene_Component gets to show their control panel and enter the event loop.
    {
        if (!this.scene_components.length && document.querySelector("#explanation_section")) component.show_explanation(document.querySelector("#explanation_section"));
        this.scene_components.unshift(component);
        component.make_control_panel(this.controls);
    }
    render(time = 0) // Animate shapes based upon how much measured real time has transpired.
    {
        this.globals.graphics_state.animation_delta_time = time - this.prev_time;
        if (this.globals.animate) this.globals.graphics_state.animation_time += this.globals.graphics_state.animation_delta_time;
        this.prev_time = time;

        for (let s in this.shapes_in_use)
            if (!this.shapes_in_use[s].gl) this.shapes_in_use[s].copy_onto_graphics_card(this.gl);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Clear the canvas's pixels and z-buffer.

        for (let live_string of document.querySelectorAll(".live_string")) live_string.textContent = live_string.onload();
        for (let s of this.scene_components) s.display(this.globals.graphics_state); // Draw each registered animation.
        window.requestAnimFrame(this.render.bind(this)); // Now that this frame is drawn, request that render() happen again 
    } // as soon as all other web page events are processed.
}

class Scene_Component // Scene_Component Superclass -- The base class for any scene part or code snippet that we can add to a canvas.
{
    constructor(context) // Register it with your Canvas_Manager, and override its display() and make_control_panel() functions to make it do something.
    {
        Object.assign(this, {
            controls: new Keyboard_Manager(),
            control_panel: document.createElement("td"),
            globals: context.globals
        });
        this.control_panel.textContent = this.constructor.name;
        this.new_line();
        document.getElementById("control_buttons").rows[0].appendChild(this.control_panel);
    }
    new_line() {
        this.control_panel.appendChild(document.createElement("br"))
    }
    live_string(callback) {
        this.control_panel.appendChild(Object.assign(document.createElement("span"), {
            className: "live_string",
            onload: callback
        }))
    }
    key_triggered_button(description, shortcut_combination, callback, color = '#' + Math.random().toString(9).slice(-6), release_event, recipient = this) {
        let button = this.control_panel.appendChild(Object.assign(document.createElement("button"), {
                default_color: color,
                textContent: "(" + shortcut_combination + ") " + description,
                style: "background-color:" + color
            })),
            press = function () {
                button.style['background-color'] = "red";
                button.style['z-index'] = "1";
                button.style['transform'] = "scale(2)";
                callback.call(recipient);
            },
            release = function () {
                button.style['background-color'] = button.default_color;
                button.style['z-index'] = "0";
                button.style['transform'] = "scale(1)";
                if (release_event) release_event.call(recipient);
            };
        button.addEventListener("mousedown", press);
        button.addEventListener("mouseup", release);
        if (!shortcut_combination) return;
        this.controls.add(shortcut_combination, press, );
        this.controls.add(shortcut_combination, release, {
            'type': 'keyup'
        });
    }
    submit_shapes(context, shapes) // Store pointers to the shapes locally.  Also submit them to the outer context held by the Canvas_Manager.
    {
        this.shapes = [];
        for (let s in shapes) {
            if (context.shapes_in_use[s]) this.shapes[s] = context.shapes_in_use[s]; // If two scenes give any shape the same name as an existing one, the
            else this.shapes[s] = context.shapes_in_use[s] = shapes[s]; // existing one is used instead and the new shape is thrown out.
        }
    }
    make_control_panel() {}
    display(graphics_state) {}
    show_explanation(document_section) {} // You have to override these functions.
}

class Object_From_File {
    constructor(url, text_parsing_function, request = new XMLHttpRequest()) // Read an external file using an AJAX request, then build an 
    {
        request.onreadystatechange = function () // object out of that data using your own supplied parsing function.
        {
            if (request.readyState === 4)
                if (request.status === 200) text_parsing_function(request.responseText);
                else console.error('File retrieval from ' + url + ' failed with status ' + request.status);
        };
        request.overrideMimeType("application/json");
        request.open('GET', url, true);
        request.send();
    }
}

class Code_Manager // Break up a string containing code (any es6 JavaScript).  The parser expression is from https://github.com/lydell/js-tokens
{
    constructor(code) // Their limitation: "If the end of a statement looks like a regex literal (even if it isn’t), it will be treated as one."
    {
        let es6_tokens_parser = RegExp([
        /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)/, // Any string.
        /(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)/, // Any comment (2 forms).  And next, any regex:
        /(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyu]{1,5}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))/,
        /(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)/, // Any number.
        /((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)/, // Any name.
        /(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])/, // Any punctuator.
        /(\s+)|(^$|[\s\S])/ // Any whitespace. Lastly, blank/invalid.
          ].map(r => r.source).join('|'), 'g');

        this.tokens = [];
        this.no_comments = [];
        let single_token = null;
        while ((single_token = es6_tokens_parser.exec(code)) !== null) {
            let token = {
                type: "invalid",
                value: single_token[0]
            }
            if (single_token[1]) token.type = "string", token.closed = !!(single_token[3] || single_token[4])
            else if (single_token[5]) token.type = "comment"
            else if (single_token[6]) token.type = "comment", token.closed = !!single_token[7]
            else if (single_token[8]) token.type = "regex"
            else if (single_token[9]) token.type = "number"
            else if (single_token[10]) token.type = "name"
            else if (single_token[11]) token.type = "punctuator"
            else if (single_token[12]) token.type = "whitespace"
            this.tokens.push(token)
            if (token.type != "whitespace" && token.type != "comment") this.no_comments.push(token.value);
        }
    }
    static highlight_tokens(tokens, result = "") // Format the code with colors and links where appropriate:
    {
        const color_map = {
            string: "chocolate",
            comment: "green",
            regex: "blue",
            number: "magenta",
            name: "black",
            punctuator: "red",
            whitespace: "black"
        };
        for (let t of tokens)
            if (t.type == "name" && (core_dependencies.includes(t.value) || all_dependencies.includes(t.value)))
                result += "<a href='javascript:void(0);' onclick='Code_Manager.display_code(" + t.value + ")'>" + t.value + "</a>";
            else result += "<font color='" + color_map[t.type] + "'>" + t.value + "</font>";
        return result;
    }
    static display_code(class_to_display, element_name = "code_display") {
        document.querySelector("#" + element_name).dataset.displayed = class_to_display;
        document.querySelector("#" + element_name).innerHTML = Code_Manager.highlight_tokens(new Code_Manager(class_to_display.toString()).tokens);
    }
}
