//wander bot
function player1(p) {
    if (p.bag.uturn > 0) {
        p.bag.uturn--;
        return {
            turn: DIRECTIONS.LEFT
        }
    }
    else if (p.bag.uturn == 0) {
        p.bag.uturn = undefined;
        return {
            move: true
        }
    }
    if (p.x == 0 || p.y == 0 || p.x == w - 1 || p.y == h - 1) {
        p.bag.uturn = 2;
        return {
            turn: DIRECTIONS.LEFT
        }
    }
    if (p.bag.step) {
        p.bag.step = 0;
        return {
            move: true
        }
    } else {
        p.bag.step = 1;
        return {
            attack: true
        }
    }
}