//board:
var w = 500;
var h = 500;
var cw = w * 2;
var ch = h * 2;
var board = []; //1000 x 800
board.length = w * h;
var FRIENDLY_FIRE = false;


var DIRECTIONS = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
};


function outside(x, y) {
    return x < 0 || y < 0 || x >= w || y >= h;
}

function getBlock(x, y) {
    return outside(x, y) ? undefined : board[x + y * w];
}

function pickBlock(x, y) {
    var t = getBlock(x, y);
    if (!t || t.picked || t.dead) return undefined;
    t.picked = true;
    board[x + y * w] = undefined;
    return t;
}

function putBlock(p) {
    if (p) {
        board[p.x + p.y * w] = p;
    }
}

var counts = [0, 0];
for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
        if (Math.random() > 0.99) {
            var b = new being();
            b.x = x;
            b.y = y;
            b.facing = Math.floor(Math.random() * 4);
            board[x + y * w] = b;
            b.type = Math.random() > 0.5 ? 1 : 0;
        }
    }
}

function removeBlock(x, y) {
    return outside(x, y) ? undefined : (board[x + y * w] = undefined);
}

var update_particle = [function (p) {
    p.bag.x = p.bag.x || 0;
    p.bag.y = p.bag.y || 0;
    p.bag.counter = p.bag.counter || 0;
    if (p.bag.x == p.x && p.bag.y == p.y && p.bag.counter < 3) {
        p.bag.counter++;
        return {
            turn: DIRECTIONS.RIGHT
        }
    } else {
        p.bag.counter = 0;
        p.bag.x = p.x;
        p.bag.y = p.y;

        if (Math.random() > 0.2) {
            return {
                move: true
            }
        } else {
            return {
                attack: true
            }
        }
    }
}, function (p) {
    if (Math.random() > 0.5) {
        return {
            turn: DIRECTIONS.LEFT
        }
    } else {
        return {
            attack: true
        }
    }
}]

function apply_movements(b) {
    var state = b.idea;
    if (state['turn'] == DIRECTIONS.LEFT) {
        b.facing--;
    } else if (state['turn'] == DIRECTIONS.RIGHT) {
        b.facing++;
    } else if (state['move'] == true) {
        //try move
        var dx = 0;
        var dy = 0;
        switch (b.facing) {
            case DIRECTIONS.UP:
                dy = -1;
                break;
            case DIRECTIONS.DOWN:
                dy = 1;
                break;
            case DIRECTIONS.LEFT:
                dx = -1;
                break;
            case DIRECTIONS.RIGHT:
                dx = 1;
                break;
        }
        if (outside(b.x + dx, b.y + dy)) {
            //donothing
        } else if (getBlock(b.x + dx, b.y + dy)) {
            //donothing
        } else {
            b.x += dx;
            b.y += dy;
        }
    }
    if (b.facing < 0) {
        b.facing = 3;
    } else if (b.facing > 3) {
        b.facing = 0;
    }
    return b;
}

function apply_attack(b) {
    var state = b.idea;
    if (Object.keys(state).length == 1 && state.attack == true) {
        //only attack
        var dx = 0;
        var dy = 0;
        switch (b.facing) {
            case DIRECTIONS.UP:
                dy = -1;
                break;
            case DIRECTIONS.DOWN:
                dy = 1;
                break;
            case DIRECTIONS.LEFT:
                dx = -1;
                break;
            case DIRECTIONS.RIGHT:
                dx = 1;
                break;
        }
        var target = getBlock(b.x + dx, b.y + dy);
        if (target && (FRIENDLY_FIRE || target.type != b.type)) {
            target.dead = true;
        }
    }
}


function update() {
    //main logic
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            var p = getBlock(x, y);
            if (!p || p.picked) {
                continue;
            }
            if (p.dead) {
                board[x + y * w] = undefined;
                continue;
            }
            p = pickBlock(x, y);

            var q = new being();
            q.facing = p.facing;
            q.x = p.x;
            q.y = p.y;
            q.type = p.type;
            q.dead = p.dead;
            q.bag = p.bag;
            Object.freeze(q);

            var idea = update_particle[q.type](q) || {};
            p.idea = idea;
            var b = apply_movements(p);
            putBlock(b);
        }
    }
    for (var i = 0; i < board.length; i++) {
        var b = board[i];
        if (!b) continue;
        b.picked = false;
        apply_attack(b);
    }

}


//canvas
var cvs = document.createElement("canvas");
cvs.width = cw;
cvs.height = ch;
var ctx = cvs.getContext('2d');
document.body.appendChild(cvs);

//renderer
function render() {
    update();

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    counts = [0, 0];
    for (var i = 0; i < board.length; i++) {
        var b = board[i];
        if (!b) continue;
        ctx.fillStyle = b.type == 1 ? "#f00" : '#fff';
        ctx.fillRect(b.x * 2, b.y * 2, 2, 2);
        counts[b.type]++;
    }
    console.log(counts);
    requestAnimationFrame(render);
}
render();


function being() {
    this.x = 0;
    this.y = 0;
    this.facing = 0;
    this.dead = false;
    this.picked = false;
    this.type = -1;
    this.bag = {};
    // this.breed = 0;
}

