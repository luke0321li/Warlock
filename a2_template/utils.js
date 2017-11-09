function rand_num(min, max) {
    return Math.random() * (max - min) + min;
}

function rand_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function rotate_vec(vec, angle) {
    let r_1 = Vec.of(Math.cos(angle), 0, Math.sin(angle));
    let r_2 = Vec.of(-1 * Math.sin(angle), 0, Math.cos(angle));
    let v_new = Vec.of(vec.dot(r_1), vec[1], vec.dot(r_2));
    return v_new;
}
