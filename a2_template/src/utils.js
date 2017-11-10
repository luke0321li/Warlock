function rand_num(min, max) {
    return Math.random() * (max - min) + min;
}

function rand_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function rotate_vec(vec, angle) {
    return Vec.of(vec[0] * Math.cos(angle) + vec[2] * Math.sin(angle), vec[1], vec[0] * -1 * Math.sin(angle) + vec[2] *  Math.cos(angle));
}
