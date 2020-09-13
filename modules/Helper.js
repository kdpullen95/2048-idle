export function randomValue(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function randomValueSet(set) {
    return randomValue(Array.from(set));
}

export function trunc2(num) {
    return Math.trunc(num * 100)/100;
}