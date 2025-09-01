const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pauseButton = document.getElementById('pause-button');
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;
const FPS = 10;

let snake = {
    x: Math.floor(GRID_WIDTH / 2),
    y: Math.floor(GRID_HEIGHT / 2),
    direction: 'RIGHT',
    body: [[Math.floor(GRID_WIDTH / 2), Math.floor(GRID_HEIGHT / 2)]]
};
let food = {
    x: Math.floor(Math.random() * GRID_WIDTH),
    y: Math.floor(Math.random() * GRID_HEIGHT)
};
let score = 0;
let gameOver = false;
let directionQueue = [];
let showNextFood = document.getElementById('showNextFood').checked;
let nextFood = null;
let isPaused = false;
const pressedKeys = new Set();
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('showNextFood').addEventListener('change', () => {
    showNextFood = document.getElementById('showNextFood').checked;
});

function getNextFoodPosition() {
    return {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
    };
}

function moveSnake() {
    if (directionQueue.length > 0) {
        const nextDirection = directionQueue.shift();
        if (
            (nextDirection === 'UP' && snake.direction !== 'DOWN') ||
            (nextDirection === 'DOWN' && snake.direction !== 'UP') ||
            (nextDirection === 'LEFT' && snake.direction !== 'RIGHT') ||
            (nextDirection === 'RIGHT' && snake.direction !== 'LEFT')
        ) {
            snake.direction = nextDirection;
        }
    }

    let newX = snake.x;
    let newY = snake.y;
    if (snake.direction === 'UP') newY--;
    else if (snake.direction === 'DOWN') newY++;
    else if (snake.direction === 'LEFT') newX--;
    else if (snake.direction === 'RIGHT') newX++;

    if (newX < 0) newX = GRID_WIDTH - 1;
    else if (newX >= GRID_WIDTH) newX = 0;
    if (newY < 0) newY = GRID_HEIGHT - 1;
    else if (newY >= GRID_HEIGHT) newY = 0;

    snake.x = newX;
    snake.y = newY;
    snake.body.unshift([snake.x, snake.y]);

    if (snake.x === food.x && snake.y === food.y) {
        score++;
        food = nextFood || getNextFoodPosition();
        nextFood = getNextFoodPosition();
    } else {
        snake.body.pop();
    }

    if (snake.body.slice(1).some(segment => segment[0] === snake.x && segment[1] === snake.y)) {
        gameOver = true;
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.body.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#006400' : '#32CD32';
        ctx.fillRect(segment[0] * GRID_SIZE, segment[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });

    if (showNextFood && !gameOver && nextFood) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(nextFood.x * GRID_SIZE, nextFood.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    if (isPaused) {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Pause', canvas.width - 10, 30);
    }

    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('game-over').style.display = gameOver ? 'block' : 'none';
}

function update() {
    if (!gameOver && !isPaused) {
        moveSnake();
        draw();
    } else {
        draw();
    }
}

function resetGame() {
    snake = {
        x: Math.floor(GRID_WIDTH / 2),
        y: Math.floor(GRID_HEIGHT / 2),
        direction: 'RIGHT',
        body: [[Math.floor(GRID_WIDTH / 2), Math.floor(GRID_HEIGHT / 2)]]
    };
    food = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
    };
    nextFood = getNextFoodPosition();
    score = 0;
    gameOver = false;
    directionQueue = [];
    showNextFood = document.getElementById('showNextFood').checked;
    isPaused = false;
    pauseButton.textContent = '일시정지';
    pressedKeys.clear();
}

nextFood = getNextFoodPosition();

// 키보드 입력 처리
document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }

    if (pressedKeys.has(event.key)) {
        return;
    }
    pressedKeys.add(event.key);

    if (event.key.toLowerCase() === 'p') {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '재개' : '일시정지';
        return;
    }

    if (event.key === 'r' && gameOver) {
        resetGame();
        return;
    }

    if (!gameOver && !isPaused && directionQueue.length < 2) {
        if (event.key === 'ArrowUp') directionQueue.push('UP');
        else if (event.key === 'ArrowDown') directionQueue.push('DOWN');
        else if (event.key === 'ArrowLeft') directionQueue.push('LEFT');
        else if (event.key === 'ArrowRight') directionQueue.push('RIGHT');
    }
});

document.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.key);
});

// 터치 입력 처리
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (!gameOver && !isPaused && directionQueue.length < 2) {
        const touch = event.touches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 15;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) directionQueue.push('RIGHT');
            else directionQueue.push('LEFT');
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) directionQueue.push('DOWN');
            else directionQueue.push('UP');
        }

        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }
});

// 일시정지 버튼 클릭 처리
pauseButton.addEventListener('click', () => {
    if (!gameOver) {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '재개' : '일시정지';
    }
});

// 게임 루프
setInterval(update, 1000 / FPS);