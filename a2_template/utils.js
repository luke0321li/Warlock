function rand_num(min, max) {
    return Math.random() * (max - min) + min;
}

function rand_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function add_lists(list_1, list_2) {
    return [list_1[0] + list_2[0], list_1[1] + list_2[1], list_1[2] + list_2[2]];
}
