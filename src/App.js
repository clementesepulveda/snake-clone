import './App.css';
import React, { useRef, useEffect } from 'react'

class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

function App() {
  const sizeFactor = 20
  const width = 32;
  const height = 32;
  const canvasWidth = width * sizeFactor;
  const canvasHeight = height * sizeFactor;

  const canvasRef = useRef(null);

  let snakePosition = [new Vector(3, 3)]
  let snakeDirection = new Vector(1, 0)
  const snakeSpeed = 300

  const fruitPosition = new Vector(0, 0)
  newFruitPosition();

  let isGameOver = false;

  function restartGame() {
    isGameOver = false;
    snakePosition = [new Vector(3, 3)]
    snakeDirection = new Vector(1, 0)
    newFruitPosition();
  }

  function moveSnake() {
    if (isGameOver) {
      return
    }

    const lastHead = snakePosition[snakePosition.length - 1]

    snakePosition.shift()
    snakePosition.push(new Vector(
      lastHead.x + snakeDirection.x,
      lastHead.y + snakeDirection.y,
    ))
  }

  function checkState() {
    const headPosition = snakePosition[snakePosition.length - 1]

    // death by wall
    if (headPosition.x + snakeDirection.x <= -1 || headPosition.y + snakeDirection.y <= -1) {
      gameOver();
    }
    if (headPosition.x + snakeDirection.x >= width || headPosition.y + snakeDirection.y >= height) {
      gameOver();
    }
    // TODO death by tail
    snakePosition.forEach(bodyPos => {
      if (headPosition.x + snakeDirection.x === bodyPos.x && headPosition.y + snakeDirection.y === bodyPos.y) {
        gameOver();
      }
    });

    // eat fruit (add tail, remove fruit, add new fruit)
    if (headPosition.x + snakeDirection.x === fruitPosition.x && headPosition.y + snakeDirection.y === fruitPosition.y) {
      growSnake();
      newFruitPosition();
    }
  }

  function growSnake() {
    snakePosition.unshift(new Vector(0, 0));
  }

  function newFruitPosition() {
    // TODO check not over snake
    fruitPosition.x = Math.round(Math.random() * (width - 1))
    fruitPosition.y = Math.round(Math.random() * (height - 1))
  }

  function gameOver() {
    // TODO show game over and button to reset
    isGameOver = true;
    snakeDirection.x = 0;
    snakeDirection.y = 0;

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const txt = "Game Over"

    ctx.textBaseline = "middle";
    ctx.font = "50px Arial";
    ctx.fillText("Game Over",
      width * sizeFactor / 2 - ctx.measureText(txt).width / 2,
      height * sizeFactor / 2
    )
  }

  function drawBoard() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // FRUIT
    ctx.beginPath();
    ctx.rect(
      Math.round(fruitPosition.x) * sizeFactor,
      Math.round(fruitPosition.y) * sizeFactor,
      sizeFactor,
      sizeFactor);
    ctx.fill();
    ctx.stroke();

    // SNAKE
    snakePosition.forEach(snake => {
      ctx.beginPath();
      ctx.rect(
        Math.round(snake.x) * sizeFactor,
        Math.round(snake.y) * sizeFactor,
        sizeFactor,
        sizeFactor);
      ctx.fill();
      ctx.stroke();
    });
  }

  useEffect(() => {
    window.addEventListener('keypress', e => {
      // TODO fast movements bug
      if (e.key === 'w' && snakeDirection.y !== 1) {
        snakeDirection.x = 0
        snakeDirection.y = -1
      } else if (e.key === 'a' && snakeDirection.x !== 1) {
        snakeDirection.x = -1
        snakeDirection.y = 0
      } else if (e.key === 's' && snakeDirection.y !== -1) {
        snakeDirection.x = 0
        snakeDirection.y = 1
      } else if (e.key === 'd' && snakeDirection.x !== -1) {
        snakeDirection.x = 1
        snakeDirection.y = 0
      }

      if (e.key === 'p') {
        growSnake()
      }

      if (e.key === 'r') {
        restartGame()
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isGameOver) {
        return;
      }
      checkState();
      if (isGameOver) {
        return;
      }
      moveSnake();
      drawBoard();
    }, snakeSpeed);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='h-screen bg-slate-900'>
    <div className='p-10 flex items-center justify-center'>
      <h1 className='color-white'>Snake</h1>
    </div>
      <div className='p-10 flex items-center justify-center'>
        <canvas className='bg-green-500 border-2 border-black' ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>
      </div>
    </div>
  );
}

export default App;
