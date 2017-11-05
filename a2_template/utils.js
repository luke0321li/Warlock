function rand_num(min, max) {
    return Math.random() * (max - min) + min;
}

function rand_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
