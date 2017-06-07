function player22(p) {
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


//crusher

function player2(p) {

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