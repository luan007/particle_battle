//board:
var w = 400;
var h = 400;
var scaler = 4;
var cw = w * scaler;
var ch = h * scaler;
var board = []; //1000 x 800
var determined = [];

var deathAnimator = [];

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

function getdBlock(x, y) {
    return outside(x, y) ? undefined : determined[x + y * w];
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
        if (Math.random() > 0.9) {
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

var update_particle = [player1, player2]

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

function dirAdd(d1, d2) {
    return (d1 + d2) % 4;
}


function dirIndex(vision, dir) {
    switch (dir) {
        case DIRECTIONS.RIGHT:
            return vision[5];
        case DIRECTIONS.LEFT:
            return vision[3];
        case DIRECTIONS.UP:
            return vision[1];
        case DIRECTIONS.DOWN:
            return vision[7];
    }
    return undefined;
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
            q.vision = [
                getdBlock(x - 1, y - 1),
                getdBlock(x, y - 1),
                getdBlock(x + 1, y - 1),

                getdBlock(x - 1, y),
                undefined,
                getdBlock(x + 1, y),

                getdBlock(x - 1, y + 1),
                getdBlock(x, y + 1),
                getdBlock(x + 1, y + 1),
            ];

            q.front = dirIndex(q.vision, q.facing);
            q.left = dirIndex(q.vision, dirAdd(q.facing, DIRECTIONS.LEFT));
            q.right = dirIndex(q.vision, dirAdd(q.facing, DIRECTIONS.RIGHT));
            q.behind = dirIndex(q.vision, dirAdd(q.facing, DIRECTIONS.DOWN));
            Object.freeze(q);

            var idea = update_particle[q.type](q) || {};
            p.idea = idea;
            var b = apply_movements(p);
            putBlock(b);
        }
    }
    for (var i = 0; i < board.length; i++) {
        var b = board[i];
        determined[i] = undefined;
        if (b && !b.dead) {
            determined[i] = b;
        }
        if (b && b.dead) {
            deathAnimator[i] = {
                x: b.x,
                y: b.y,
                type: b.type,
                t: 10
            };
        }
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
    for (var i = 0; i < 3; i++) {
        update();
    }

    // ctx.clearRect(0, 0, cw, ch);
    // ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, cw, ch);
    counts = [0, 0];

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    for (var x = 0; x < w; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x * scaler, 0);
        ctx.lineTo(x * scaler, h * scaler);
        ctx.stroke();
    }

    for (var y = 0; y < h; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y * scaler);
        ctx.lineTo(w * scaler, y * scaler);
        ctx.stroke();
    }

    for (var i = 0; i < board.length; i++) {
        var b = board[i];


        if (deathAnimator[i]) {
            var d = deathAnimator[i];
            ctx.save();
            ctx.translate(d.x * scaler, d.y * scaler);
            ctx.fillStyle = 'rgba(255,255,255,' + (d.t / 10) / 4 + ')';
            ctx.beginPath();
            ctx.ellipse(0, 0, d.t * 3, d.t * 3, 0, 0, Math.PI * 2);
            ctx.fill();
            d.t--;
            if (d.t <= 0) {
                deathAnimator[i] = undefined;
            }
            ctx.restore();
        }


        if (!b) continue;
        ctx.strokeStyle = b.type == 1 ? "#f00" : '#0af';
        ctx.fillStyle = b.type == 1 ? "#f00" : '#0af';
        ctx.save();
        ctx.translate(b.x * scaler, b.y * scaler);
        // ctx.rotate(Math.PI / 4);

        ctx.beginPath();
        switch (b.facing) {
            case DIRECTIONS.DOWN:
                ctx.moveTo(0, scaler);
                ctx.lineTo(scaler, scaler);
                break;
            case DIRECTIONS.LEFT:
                ctx.moveTo(0, 0);
                ctx.lineTo(0, scaler);
                break;
            case DIRECTIONS.RIGHT:
                ctx.moveTo(scaler, 0);
                ctx.lineTo(scaler, scaler);
                break;
            case DIRECTIONS.UP:
                ctx.moveTo(0, 0);
                ctx.lineTo(scaler, 0);
                break;
        }
        ctx.stroke();

        // ctx.beginPath();
        // ctx.rect(0, 0, scaler, scaler);
        // ctx.stroke();
        if (b.idea.attack) {
            ctx.beginPath();
            ctx.rect(0, 0, scaler, scaler);
            ctx.fill();
        }
        ctx.restore();
        counts[b.type]++;
    }

    //render ui
    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = counts[0] < counts[1] ? "rgba(200, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.5)";
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 20 + 60);
    ctx.lineTo(w * scaler / 2 - 220, 20 + 60);
    ctx.lineTo(w * scaler / 2 - 190, 40 + 60);
    ctx.lineTo(w * scaler / 2 + 190, 40 + 60);
    ctx.lineTo(w * scaler / 2 + 220, 20 + 60);
    ctx.lineTo(w * scaler, 20 + 60);
    ctx.lineTo(w * scaler, 0);
    ctx.fill();


    ctx.translate(w * scaler / 2, 50);
    ctx.font = "bold 62px Rajdhani"
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(counts[1], 0, 0);
    ctx.strokeStyle = "#f00";


    ctx.translate(- w * scaler / 2 + 50, -10);
    ctx.font = "32px Rajdhani"
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText('< ' + player2.name + ' >', 0, 0);
    ctx.strokeStyle = "#f00";



    if (counts[0] < counts[1]) {
        ctx.translate(w * scaler - 100, 0);
        ctx.font = "32px Rajdhani"
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText('LEAD', 0, 0);
        ctx.strokeStyle = "#f00";
    }

    ctx.restore();


    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = counts[0] > counts[1] ? "rgba(0, 140, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
    ctx.moveTo(0, h * scaler);
    ctx.lineTo(0, h * scaler - (20 + 60));
    ctx.lineTo(w * scaler / 2 - 220, h * scaler - 20 - 60);
    ctx.lineTo(w * scaler / 2 - 190, h * scaler - 40 - 60);
    ctx.lineTo(w * scaler / 2 + 190, h * scaler - 40 - 60);
    ctx.lineTo(w * scaler / 2 + 220, h * scaler - 20 - 60);
    ctx.lineTo(w * scaler, h * scaler - 20 - 60);
    ctx.lineTo(w * scaler, h * scaler);
    ctx.fill();

    ctx.translate(w * scaler / 2, h * scaler - 50);
    ctx.font = "bold 62px Rajdhani"
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(counts[0], 0, 0);
    ctx.strokeStyle = "#f00";

    ctx.translate(- w * scaler / 2 + 50, 10);
    ctx.font = "32px Rajdhani"
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText('< ' + player1.name + ' >', 0, 0);
    ctx.strokeStyle = "#f00";


    if (counts[0] > counts[1]) {
        ctx.translate(w * scaler - 100, 0);
        ctx.font = "32px Rajdhani"
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText('LEAD', 0, 0);
        ctx.strokeStyle = "#f00";
    }
    ctx.restore();


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

