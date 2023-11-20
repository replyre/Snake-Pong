const board = document.getElementById("game-board");
const context = board.getContext("2d");
const gameEnd = document.getElementById("game-over");
const restartBtn = document.getElementById("restart-btn");

const GRID_SIZE = 20;
const Snake_Size = GRID_SIZE;
const Food_Size = GRID_SIZE;

let snake, food, dx, dy, blinkCounter;
let gamePause = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let currentScoreElem = document.getElementById("current-score");
let highScoreElem = document.getElementById("high-score");

function InitializeGame() {
  snake = [
    {
      x: Math.floor(board.width / 2 / GRID_SIZE) * GRID_SIZE,
      y: Math.floor(board.height / 2 / GRID_SIZE) * GRID_SIZE,
    },
    {
      x: Math.floor(board.width / 2 / GRID_SIZE) * GRID_SIZE,
      y: (Math.floor(board.height / 2 / GRID_SIZE) + 1) * GRID_SIZE,
    },
  ];

  food = {
    ...generateFoodPosition(),
    dx: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
    dy: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
  };
  dx = 0;
  dy = -GRID_SIZE;
  blinkCounter = 0;
  score = 0;
  currentScoreElem.textContent = score;
  highScoreElem.textContent = highScore;
}

InitializeGame();

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (dy === 0) {
        dx = 0;
        dy = -GRID_SIZE;
      }
      break;
    case "ArrowDown":
      if (dy === 0) {
        dx = 0;
        dy = GRID_SIZE;
      }
      break;
    case "ArrowLeft":
      if (dx === 0) {
        dx = -GRID_SIZE;
        dy = 0;
      }
      break;
    case "ArrowRight":
      if (dx === 0) {
        dx = GRID_SIZE;
        dy = 0;
      }
      break;
  }
});

function generateFoodPosition() {
  while (true) {
    let newFoodPosition = {
      x: Math.floor((Math.random() * board.width) / GRID_SIZE) * GRID_SIZE,
      y: Math.floor((Math.random() * board.height) / GRID_SIZE) * GRID_SIZE,
    };

    let collisionWithSnake = false;
    for (let body of snake) {
      if (body.x === newFoodPosition.x && body.y === newFoodPosition.y) {
        collisionWithSnake = true;
        break;
      }
    }

    if (!collisionWithSnake) return newFoodPosition;
  }
}

function checkCollision() {
  if (
    snake[0].x < 0 ||
    snake[0].x >= board.width ||
    snake[0].y < 0 ||
    snake[0].y >= board.height
  )
    return true;

  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }

  return false;
}

function update() {
  if (gamePause) return;

  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
  };
  snake.unshift(head);

  if (checkCollision()) {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreElem.textContent = highScore;
    }
    gameOver();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    score++;
    currentScoreElem.textContent = score;
    food = {
      ...generateFoodPosition(),
      dx: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
      dy: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
    };

    if (
      snake.length ===
      (board.width / GRID_SIZE) * (board.height / GRID_SIZE)
    ) {
      gameWin();
      return;
    }
  } else {
    snake.pop();
  }
  if (blinkCounter % 4 === 0) {
    food.x += food.dx;
    food.y += food.dy;
    if (food.x < 0) {
      food.dx = -food.dx;
      food.x = 0;
    }
    if (food.x >= board.width) {
      food.dx = -food.dx;
      food.x = board.width - GRID_SIZE;
    }
    if (food.y < 0) {
      food.dy = -food.dy;
      food.y = 0;
    }
    if (food.y >= board.height) {
      food.dy = -food.dy;
      food.y = board.height - GRID_SIZE;
    }
  }
  blinkCounter++;
  draw();
}

function drawGrid() {
  context.strokeStyle = "grey";
  for (let i = 0; i < board.width; i += GRID_SIZE) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, board.height);
    context.stroke();
  }
  for (let j = 0; j < board.height; j += GRID_SIZE) {
    context.beginPath();
    context.moveTo(0, j);
    context.lineTo(board.width, j);
    context.stroke();
  }
}

function draw() {
  context.clearRect(0, 0, board.width, board.height);
  drawGrid();
  for (const body of snake) {
    context.fillStyle = "green";
    context.fillRect(body.x, body.y, Snake_Size - 1.5, Snake_Size - 1.5);
  }
  context.lineWidth = 0.8;
  context.fillStyle = "red";
  context.fillRect(food.x + 2.5, food.y + 2.5, Food_Size - 5, Food_Size - 5);
}

function gameOver() {
  gamePause = true;
  gameEnd.style.display = "flex";
}

function gameWin() {
  gamePause = true;
  alert("Congratulations! You win !");
  InitializeGame();
}

restartBtn.addEventListener("click", () => {
  gameEnd.style.display = "none";
  gamePause = false;
  InitializeGame();
  update();
});

setInterval(update, 100);

window.addEventListener("blur", () => {
  gamePause = true;
});

window.addEventListener("focus", () => {
  gamePause = false;
  update();
});
