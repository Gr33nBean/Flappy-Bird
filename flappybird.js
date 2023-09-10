
let game = {
    board: {
        obj: null,
        def_width: 0,
        def_height: 0
    },
    context: null,
    bird: {
        obj: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        def_x: 0,
        def_y: 0,
        def_width: 0,
        def_height: 0,
        img: null
    },
    pipe: {
        obj_array: [],
        def_x: 0,
        def_y: 0,
        def_width: 0,
        def_height: 0,
        img_top: null,
        img_bottom: null
    },
    physics: {
        vX: 0, // for pipes
        vY: 0, // for bird
        g: 0.0
    },
    score: 0,
    gameOver: false
}

window.onload = function () {
    game.board.def_width = 360;
    game.board.def_height = 640;
    game.board.obj = document.getElementById("board");
    game.board.obj.height = game.board.def_height;
    game.board.obj.width = game.board.def_width;

    game.context = game.board.obj.getContext("2d");

    game.bird.def_width = 34;
    game.bird.def_height = 24;
    game.bird.def_x = game.board.def_width / 8;
    game.bird.def_y = game.board.def_height / 2;
    game.bird.obj.x = game.bird.def_x;
    game.bird.obj.y = game.bird.def_y;
    game.bird.obj.width = game.bird.def_width;
    game.bird.obj.height = game.bird.def_height;
    game.bird.img = new Image();
    game.bird.img.src = "./flappybird.png";

    game.pipe.obj_array = [];
    game.pipe.def_x = game.board.def_width;
    game.pipe.def_y = 0;
    game.pipe.def_width = 64;
    game.pipe.def_height = 512;
    game.pipe.img_top = new Image();
    game.pipe.img_top.src = "./toppipe.png";
    game.pipe.img_bottom = new Image();
    game.pipe.img_bottom.src = "./bottompipe.png";

    game.physics.g = 0.4;
    game.physics.vX = -2;
    game.physics.vY = 0;

    game.score = 0;
    game.gameOver = false;

    game.bird.img.onload = function () {
        game.context.drawImage(game.bird.img, game.bird.obj.x, game.bird.obj.y, game.bird.def_width, game.bird.def_height);
    }

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (game.gameOver) {
        return;
    }
    game.context.clearRect(0, 0, game.board.def_width, game.board.def_height);

    game.physics.vY += game.physics.g;
    game.bird.obj.y = Math.max(game.bird.obj.y + game.physics.vY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas

    game.context.drawImage(game.bird.img, game.bird.obj.x, game.bird.obj.y, game.bird.def_width, game.bird.def_height);

    if (game.bird.obj.y > game.board.def_height) {
        game.gameOver = true;
    }

    //pipes
    for (let i = 0; i < game.pipe.obj_array.length; i++) {
        let pipe = game.pipe.obj_array[i];
        pipe.x += game.physics.vX;
        game.context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && game.bird.obj.x > pipe.x + pipe.width) {
            game.score += 0.5; //0.5 because there are 2 pipes!
            pipe.passed = true;
        }

        if (detectCollision(game.bird.obj, pipe)) {
            game.gameOver = true;
        }
    }

    //clear pipes
    while (game.pipe.obj_array.length > 0 && game.pipe.obj_array[0].x < -game.pipe.def_width) {
        game.pipe.obj_array.shift(); //removes first element from the array
    }

    //score
    game.context.fillStyle = "white";
    game.context.font = "45px sans-serif";
    game.context.fillText(game.score, 5, 45);

    if (game.gameOver) {
        game.context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (game.gameOver) {
        return;
    }

    let randomPipeY = game.pipe.def_y - game.pipe.def_height / 4 - Math.random() * (game.pipe.def_height / 2);
    let openingSpace = game.board.def_height / 4;

    let topPipe = {
        img: game.pipe.img_top,
        x: game.pipe.def_x,
        y: randomPipeY,
        width: game.pipe.def_width,
        height: game.pipe.def_height,
        passed: false
    }

    game.pipe.obj_array.push(topPipe);

    let bottomPipe = {
        img: game.pipe.img_bottom,
        x: game.pipe.def_x,
        y: randomPipeY + game.pipe.def_height + openingSpace,
        width: game.pipe.def_width,
        height: game.pipe.def_height,
        passed: false
    }
    game.pipe.obj_array.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        game.physics.vY = -6;

        //reset game
        if (game.gameOver) {
            game.bird.obj.y = game.bird.def_y;
            game.pipe.obj_array = [];
            game.score = 0;
            game.gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}