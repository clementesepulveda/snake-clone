import './App.css';
import React, { useRef, useEffect, useState } from 'react'
import useWindowDimensions from './useWindowDimensions';

class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

function App() {
  const windowSize = useWindowDimensions();

  let sizeFactor = 35;
  const width = 16;
  const height = 16;
  const snakeSpeed = 250

  if (width * sizeFactor > windowSize.width) {
    sizeFactor = (windowSize.width - 20) / width
  }
  const canvasWidth = width * sizeFactor;
  const canvasHeight = height * sizeFactor;

  const canvasRef = useRef(null);

  let snakePosition = [new Vector(0, 0)]
  let snakeDirection = new Vector(1, 0)

  const fruitPosition = new Vector(-1, -1)

  // false in each frame
  // check before move, add after move
  let mustSpawnFruit = false;
  let [isGameOver, setGameOver] = useState(false);

  newGame();

  function newGame() {
    snakePosition = [new Vector(
      Math.floor(width / 2),
      Math.floor(height / 2)
    )]

    const directions = [
      new Vector(1, 0),
      new Vector(0, 1),
      new Vector(-1, 0),
      new Vector(0, -1),
    ]
    snakeDirection = directions[Math.round(Math.random() * (directions.length - 1))]
    newFruitPosition();
  }

  function restartGame() {
    setGameOver(false);
    newGame();

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
  console.log('before cut')

  function checkState() {
    const headPosition = snakePosition[snakePosition.length - 1]

    // death by wall
    if (headPosition.x + snakeDirection.x <= -1 || headPosition.y + snakeDirection.y <= -1) {
      gameOver();
    }
    if (headPosition.x + snakeDirection.x >= width || headPosition.y + snakeDirection.y >= height) {
      console.log('cut')
      gameOver();
    }

    // death by tail
    snakePosition.forEach(bodyPos => {
      if (headPosition.x + snakeDirection.x === bodyPos.x && headPosition.y + snakeDirection.y === bodyPos.y) {
        const lastPos = snakePosition[0] // this pos might move
        if (!(headPosition.x + snakeDirection.x === lastPos.x && headPosition.y + snakeDirection.y === lastPos.y)) {
          gameOver();
        }
      }
    });

    checkAteFruit()
  }

  function checkAteFruit() {
    const headPosition = snakePosition[snakePosition.length - 1]

    // eat fruit (add tail, remove fruit, add new fruit)
    if (headPosition.x + snakeDirection.x === fruitPosition.x && headPosition.y + snakeDirection.y === fruitPosition.y) {
      growSnake();
      mustSpawnFruit = true;
    }
  }

  function growSnake() {
    snakePosition.unshift(new Vector(-1, -1));
  }

  function newFruitPosition() {
    let positions = []
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {

        let notInSnake = true;
        snakePosition.forEach(snake => {
          if (snake.x === i && snake.y === j) {
            notInSnake = false;
          }
        });

        if (notInSnake) {
          positions.push(new Vector(i, j))
        }
      }
    }

    if (positions.length === 0) {
      victory();
      return;
    }

    const randomValidPosition = positions[
      Math.round(Math.random() * (positions.length - 1))
    ]
    fruitPosition.x = randomValidPosition.x
    fruitPosition.y = randomValidPosition.y
  }

  function gameOver() {
    // TODO show game over and button to reset
    setGameOver(true);
    snakeDirection = new Vector(0, 0);

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const txt = "Game Over"

    ctx.fillStyle = "green";
    ctx.textBaseline = "middle";
    ctx.font = "50px Arial";
    ctx.fillText(txt,
      width * sizeFactor / 2 - ctx.measureText(txt).width / 2,
      height * sizeFactor / 2
    )
  }

  function victory() {
    // TODO show game over and button to reset
    setGameOver(true);
    snakeDirection.x = 0;
    snakeDirection.y = 0;

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const txt = "Victory"

    ctx.fillStyle = "green";
    ctx.textBaseline = "middle";
    ctx.font = "50px Arial";
    ctx.fillText(txt,
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
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();

    // SNAKE
    let i = 0;
    snakePosition.slice().reverse().forEach(snake => {
      ctx.beginPath();
      ctx.rect(
        Math.round(snake.x) * sizeFactor,
        Math.round(snake.y) * sizeFactor,
        sizeFactor,
        sizeFactor);
      ctx.fillStyle = i % 2 === 0 ? "rgb(132 204 22)" : "green";
      ctx.fill();
      ctx.stroke();

      i += 1
    });
  }

  function changeDirection(newDirection) {
    if (snakePosition.length > 1) { // can't go back
      const headPos = snakePosition[snakePosition.length - 1]
      const neckPos = snakePosition[snakePosition.length - 2]
      if (headPos.x + newDirection.x === neckPos.x && headPos.y + newDirection.y === neckPos.y) {
        return;
      }
    }

    snakeDirection = newDirection
  }

  useEffect(() => {
    window.addEventListener('keypress', e => {
      if (e.key === 'w') {
        changeDirection(new Vector(0, -1))
      } else if (e.key === 'a') {
        changeDirection(new Vector(-1, 0))
      } else if (e.key === 's') {
        changeDirection(new Vector(0, 1))
      } else if (e.key === 'd') {
        changeDirection(new Vector(1, 0))
      }

      if (e.key === 'p') {
        growSnake()
      }

      if (e.key === 'r') {
        restartGame()
      }
    });
  }, [isGameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isGameOver) {
        gameOver()
        return;
      }

      mustSpawnFruit = false;
      checkState();
      if (isGameOver) {
        return;
      }
      moveSnake();
      console.log(isGameOver)
      if (mustSpawnFruit) {
        newFruitPosition();
      }
      if (isGameOver) {
        return;
      }
      drawBoard();
    }, snakeSpeed);
    return () => clearInterval(interval);
  }, [isGameOver]);

  return (
    <div className='h-screen bg-gray-800'>
      <div className='p-5 flex items-center justify-center'>
        <h1 className='text-white text-5xl font-mono text-lime-500'>Snake</h1>
      </div>
      <div className='flex items-center justify-center'>
        <canvas className='bg-lime-600 border-2 border-black' ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>

        {isGameOver
          ? <button className='z-20 absolute top-80 font-green' onClick={restartGame}>Restart</button>
          : <></>
        }

      </div>

      <div className='p-4 flex items-center justify-center'>
        <button className='' onClick={() => changeDirection(new Vector(-1, 0))}>
          <i className="fa fa-angle-left text-5xl font-black pr-2"></i>
        </button>

        <div className='flex flex-col items-center'>
          <div>
            <button className='' onClick={() => changeDirection(new Vector(0, -1))}>
              <i className="fa fa-angle-up text-5xl font-black pb-2"></i>
            </button>
          </div>
          <br />
          <div>
            <button className='' onClick={() => changeDirection(new Vector(0, 1))}>
              <i className="fa fa-angle-down text-5xl font-black pt-2"></i>
            </button>
          </div>

        </div>
        <button className='' onClick={() => changeDirection(new Vector(1, 0))}>
          <i className="fa fa-angle-right text-5xl font-black pl-2"></i>
        </button>
      </div>

    </div >

  );
}

export default App;
