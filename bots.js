function stone(p) {
    if (p.inFront && p.inFront.type != p.type) {
        return {
            attack: true
        }
    } else {
        return {
            turn: DIRECTIONS.RIGHT
        }
    }
}


//wander bot
function wanderBot(p) {
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

//killing machine
function killingMachine(p) {

    p.bag.idle = p.bag.idle || 0;
    //stickies
    
    if (p.front && p.front.type != p.type) {
        return {
            attack: true
        }
    }
    if (p.left && p.left.type != p.type) {
        p.bag.chase = 3
        return {
            turn: DIRECTIONS.LEFT
        }
    }
    if (p.right && p.right.type != p.type) {
        p.bag.chase = 3
        return {
            turn: DIRECTIONS.RIGHT
        }
    }
    if (p.behind && p.behind.type != p.type) {
        return {
            turn: DIRECTIONS.LEFT
        }
    }
    if(p.bag.chase) {
        p.bag.chase--;
        return {
            move: true
        }
    }

    p.bag.idle++;
    if(p.bag.idle > 5) {
        p.bag.idle = 0;
        return {
            move: true
        }
    }
    return {
        attack: true
    }
}