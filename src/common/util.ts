import {Point} from "./type";


export function castExists<T>(value: T|undefined): T {
    if (value === undefined) {
        throw new ValueError('Unexpected undefined');
    }
    return value;
}

export function comparePoint(p: Point, p2: Point): number {
    if (p.r !== p2.r) {
        return Math.sign(p.r - p2.r);
    }
    return Math.sign(p.c - p2.c);
}
