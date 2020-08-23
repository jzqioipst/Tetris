//canvas
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

//BOARD
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 22;

const VIRTUAL_WIDTH = 12;
const VIRTUAL_HEIGHT = 3;

const BOARD_MARGIN_LEFT = 100;
const BOARD_MARGIN_TOP = 100;

//BLOCK
const BLOCK_SIZE = 25;

//SHAPE
const NUM_OF_PAT = 7;   //PAT = PATTERN
const SHAPE = [
	//ㅣ
	[
		[{x:-1, y:0}, {x:0, y:0}, {x:1, y:0}, {x:2, y:0}],
		[{x:1, y:-1}, {x:1, y:0}, {x:1, y:1}, {x:1, y:2}],
		[{x:-1, y:1}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}],
		[{x:0, y:-1}, {x:0, y:0}, {x:0, y:1}, {x:0, y:2}]
	],
	//ㅁ
	[
		[{x:0, y:-1}, {x:1, y:-1}, {x:0, y:0}, {x:1, y:0}],
		[{x:0, y:-1}, {x:1, y:-1}, {x:0, y:0}, {x:1, y:0}],
		[{x:0, y:-1}, {x:1, y:-1}, {x:0, y:0}, {x:1, y:0}],
		[{x:0, y:-1}, {x:1, y:-1}, {x:0, y:0}, {x:1, y:0}]
	],
	//ㅗ
	[
		[{x:-1, y:0}, {x:0, y:0}, {x:1, y:0}, {x:0, y:-1}],
		[{x:0, y:-1}, {x:0, y:0}, {x:0, y:1}, {x:1, y:0}],
		[{x:-1, y:0}, {x:0, y:0}, {x:1, y:0}, {x:0, y:1}],
		[{x:-1, y:0}, {x:0, y:-1}, {x:0, y:0}, {x:0, y:1}]
	],
	//ㄹ
	[
		[{x:-1, y:-1}, {x:0, y:-1}, {x:0, y:0}, {x:1, y:0}],
		[{x:1, y:-1}, {x:1, y:0}, {x:0, y:0}, {x:0, y:1}],
		[{x:-1, y:0}, {x:0, y:0}, {x:0, y:1}, {x:1, y:1}],
		[{x:0, y:-1}, {x:0, y:0}, {x:-1, y:0}, {x:-1, y:1}]
	],
	//ㄹ반대
	[
		[{x:1, y:-1}, {x:0, y:-1}, {x:0, y:0}, {x:-1, y:0}],
		[{x:0, y:-1}, {x:0, y:0}, {x:1, y:0}, {x:1, y:1}],
		[{x:1, y:0}, {x:0, y:0}, {x:0, y:1}, {x:-1, y:1}],
		[{x:-1, y:-1}, {x:-1, y:0}, {x:0, y:0}, {x:0, y:1}]
	],
	//ㄴ
	[
		[{x:-1, y:-1}, {x:-1, y:0}, {x:0, y:0}, {x:1, y:0}],
		[{x:1, y:-1}, {x:0, y:-1}, {x:0, y:0}, {x:0, y:1}],
		[{x:-1, y:0}, {x:0, y:0}, {x:1, y:0}, {x:1, y:1}],
		[{x:0, y:-1}, {x:0, y:0}, {x:0, y:1}, {x:-1, y:1}],
	],
	//ㄴ반대
	[
		[{x:1, y:-1}, {x:1, y:0}, {x:0, y:0}, {x:-1, y:0}],
		[{x:0, y:-1}, {x:0, y:0}, {x:0, y:1}, {x:1, y:1}],
		[{x:1, y:0}, {x:0, y:0}, {x:-1, y:0}, {x:-1, y:1}],
		[{x:-1, y:-1}, {x:0, y:-1}, {x:0, y:0}, {x:0, y:1}]
	]
];

//data
const BLANK = 1;
const WALL = 2;
const CEILING = 3;
const BLOCK = 0;    //5로 나누어 떨어지면 BLOCK이다.
const STICK = 5;    //ㅣ
const BOX = 10;     //ㅁ
const HAT = 15;     //ㅗ
const LCLIP = 20;   //ㄹ
const RCLIP = 25;   //ㄹ반대
const LCHAIR = 30;  //ㄴ
const RCHAIR = 35;  //ㄴ반대

//game level
const MAX_WAIT = [75, 64, 54, 45, 37, 30, 24, 19, 15, 12, 9, 6, 3, 1, 0];   //레벨별 하강 속도
const MAX_SURVIVAL = 75;    //충돌 후 생존시간

//실제 게임 판
let data = [];
for (let y = 0; y < BOARD_HEIGHT; y++) {
    data[y] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x == 0 || x == BOARD_WIDTH - 1 || y == BOARD_HEIGHT - 1) {
            data[y][x] = WALL;
        }
        else if (y == 0) {
            data[y][x] = CEILING;
        }
        else {
            data[y][x] = BLANK;
        }
    }
}
//보조 게임 판
let virData = [];   //vir = virtual
for (let y = 0; y < VIRTUAL_HEIGHT; y++) {
    virData[y] = [];
    for (let x = 0; x < VIRTUAL_WIDTH; x++) {
        if (x == 0 || x == VIRTUAL_WIDTH - 1) {
            virData[y][x] = WALL;
        }
        else {
            virData[y][x] = BLANK;
        }
    }
}

let nextPatIndex = [];
for (let i = 0; i < 3; i++) {
    nextPatIndex[i] = Math.floor(Math.random() * NUM_OF_PAT);
}

let level = 1;

let mine = {
    x: 5,
    y: 1,
    dir: 0,
    patIndex: Math.floor(Math.random() * NUM_OF_PAT),

    wait: MAX_WAIT[level - 1],
    survival: MAX_SURVIVAL
}

//event
let leftPressed = false;
let upPressed = false;
let rightPressed = false;
let downPressed = false;

let spacePressed = false;
let fPressed = false;
let dPressed = false;

document.addEventListener("keydown", (e) => {
    if (e.keyCode == 37) {
        leftPressed = true;
    }
    else if (e.keyCode == 38) {
        upPressed = true;
    }
    else if (e.keyCode == 39) {
        rightPressed = true;
    }
    else if (e.keyCode == 40) {
        downPressed = true;
    }
    else if (e.keyCode == 32) {
        spacePressed = true;
    }
    else if (e.keyCode == 70) {
        fPressed = true;
    }
    else if (e.keyCode == 68) {
        dPressed = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.keyCode == 37) {
        leftPressed = false;
    }
    else if (e.keyCode == 38) {
        upPressed = false;
    }
    else if (e.keyCode == 39) {
        rightPressed = false;
    }
    else if (e.keyCode == 40) {
        downPressed = false;
    }
    else if (e.keyCode == 32) {
        spacePressed = false;
    }
    else if (e.keyCode == 70) {
        fPressed = false;
    }
    else if (e.keyCode == 68) {
        dPressed = false;
    }
});

//draw
draw();
let myTimer = setInterval(playGame, 25);

function getNewBlock() {
    mine.x = 5;
    mine.y = 1;
    mine.dir = 0;
    mine.patIndex = nextPatIndex[0];
    for (let i = 0; i < 2; i++) {
        nextPatIndex[i] = nextPatIndex[i + 1];
    }
    nextPatIndex[2] = Math.floor(Math.random() * NUM_OF_PAT);

    mine.survival = MAX_SURVIVAL;

    if (canMove(mine.x, mine.y, mine.dir)) {
        return true;
    }
    return false;
}

function moveMineDown() {
    mine.y++;

    return 0;
}

function canMove(dx, dy, dir) { //d = destination
    for (let i = 0; i < 4; i++) {
        let x = dx + SHAPE[mine.patIndex][dir][i].x;
        let y = dy + SHAPE[mine.patIndex][dir][i].y;

        if (0 < y) {
            if (data[y][x] != BLANK) {
                return false;
            }
        }
        else if (virData[Math.abs(y)][x] != BLANK) {
            return false;
        }
    }

    return true;
}

function copyMineToData() {
    for (let i = 0; i < 4; i++) {
        let x = mine.x + SHAPE[mine.patIndex][mine.dir][i].x;
        let y = mine.y + SHAPE[mine.patIndex][mine.dir][i].y;

        if (0 < y) {
            data[y][x] = (mine.patIndex + 1) * 5;
        }
        else {
            virData[Math.abs(y)][x] = (mine.patIndex + 1) * 5;
        }
    }
}

function goToWork() {
    if (canMove(mine.x, mine.y + 1, mine.dir)) {
        if (mine.wait != 0) {
            mine.wait--;
        }
        else {
            moveMineDown();
            mine.wait = MAX_WAIT[level - 1];
        }
    }
    else if (0 < mine.survival) {
        mine.survival--;
    }
    else {
        copyMineToData();

        if (getNewBlock() == false) {
            clearInterval(myTimer);
            alert("Game Over");
        }
    }
}

function moveToRight() {
    if (canMove(mine.x + 1, mine.y, mine.dir)) {
        mine.x++;
        mine.survival = MAX_SURVIVAL;

        return true;
    }

    return false;
}

function moveToLeft() {
    if (canMove(mine.x - 1, mine.y, mine.dir)) {
        mine.x--;
        mine.survival = MAX_SURVIVAL;

        return true;
    }

    return false;
}

function canRotate(dir) {
    if (canMove(mine.x, mine.y, dir)) {
        return true;
    }

    let x = mine.x;
    let y = mine.y;

    if (mine.patIndex == 0) {
        for (let i = 0; i < 4; i++) {
            if (i == 2) {
                x = mine.x;
                y = mine.y;
            }

            if (i < 2) {
                if (dir % 2 == 0) {
                    x++;
                }
                else {
                    y++;
                }
            }
            else {
                if (dir % 2 == 0) {
                    x--;
                }
                else {
                    y--;
                }
            }

            if (canMove(x, y, dir)) {
                mine.x = x;
                mine.y = y;

                return true;
            }
        }
    }
    else {
        switch (mine.dir) {
            case 0:
                y--;
                break;
            case 1:
                x++;
                break;
            case 2:
                y++;
                break;
            case 3:
                x--;
                break;
        }

        if (canMove(x, y, dir)) {
            mine.x = x;
            mine.y = y;

            return true;
        }
    }

    return false;
}

function rotateRight() {
    let dir = mine.dir;
    dir = ++dir % 4;
    if (canRotate(dir)) {
        mine.dir = dir;
        mine.survival = MAX_SURVIVAL;

        return true;
    }

    return false;
}

function rotateLeft() {
    let dir = mine.dir + 4;
    dir = --dir % 4;
    if (canRotate(dir)) {
        mine.dir = dir;
        mine.survival = MAX_SURVIVAL;

        return true;
    }

    return false;
}

//DELAY, keyDelay 모션 조작을 하기 전까지 임시 장치
//key 반응이 너무 지나치게 민감하지 않도록 유도
const MAX_DELAY = 2;
let keyDelay = MAX_DELAY;
let rkey = false, lkey = false, ukey = false, dkey = false;
function manipulate() {
    if (0 < keyDelay) {
        if (rightPressed) {
            rkey = true;
        }
        if (leftPressed) {
            lkey = true;
        }
        if (downPressed) {
            dkey = true;
        }
        if (upPressed) {
            ukey = true;
        }
        keyDelay--;
        return;
    }
    keyDelay = MAX_DELAY;

    if (rkey) {
        moveToRight();
    }
    if (lkey) {
        moveToLeft();
    }

    if (ukey) {
        rotateRight();
    }
    if (dkey) {
        rotateLeft();
    }

    rkey = lkey = dkey = ukey = false;
}

function playGame() {
    manipulate();
    goToWork();
}

function drawRect(xpos, ypos, what) {
    ctx.beginPath();

    switch (what) {
        case BLANK:
            ctx.fillStyle = "#C8C8C8";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case WALL:
            ctx.fillStyle = "#000000";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case CEILING:
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#FF0000";
            break;
        case STICK:
            ctx.fillStyle = "#00D8FF";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case BOX:
            ctx.fillStyle = "#FFE400";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case HAT:
            ctx.fillStyle = "#660058";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case LCLIP:
            ctx.fillStyle = "#FF0000";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case RCLIP:
            ctx.fillStyle = "#1DDB16";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case LCHAIR:
            ctx.fillStyle = "#0000FF";
            ctx.strokeStyle = "#FFFFFF";
            break;
        case RCHAIR:
            ctx.fillStyle = "#FF8224";
            ctx.strokeStyle = "#FFFFFF";
            break;
    }

    ctx.rect(xpos, ypos, BLOCK_SIZE, BLOCK_SIZE);
    ctx.stroke();

    ctx.fill();
    ctx.closePath();
}

function drawData() {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            let xpos = BOARD_MARGIN_LEFT + (x * BLOCK_SIZE);
            let ypos = BOARD_MARGIN_TOP + (y * BLOCK_SIZE);
            
            drawRect(xpos, ypos, data[y][x]);
        }
    }
}

function drawMine() {
    for (let i = 0; i < 4; i++) {
        let x = mine.x + SHAPE[mine.patIndex][mine.dir][i].x;
        let y = mine.y + SHAPE[mine.patIndex][mine.dir][i].y;

        if (y <= 0) {
            continue;
        }

        let xpos = BOARD_MARGIN_LEFT + (x * BLOCK_SIZE);
        let ypos = BOARD_MARGIN_TOP + (y * BLOCK_SIZE);

        let what = (mine.patIndex + 1) * 5;
        drawRect(xpos, ypos, what);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawData();
    drawMine();

    requestAnimationFrame(draw);
}