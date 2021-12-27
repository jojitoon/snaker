import React, { useEffect, useCallback, useState, useRef } from 'react';
import './snake.css';

const BOX_SIZE = 800;
const SNAKE_SIZE = 20;

const DIRECTIONS = {
  NORTH: 'NORTH',
  SOUTH: 'SOUTH',
  EAST: 'EAST',
  WEST: 'WEST',
};
const ARROWS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
};

const allowedKeys = Object.values(ARROWS);

const NEXT_DIRECTIONS = {
  [DIRECTIONS.NORTH]: {
    [ARROWS.down]: DIRECTIONS.NORTH,
    [ARROWS.up]: DIRECTIONS.NORTH,
    [ARROWS.left]: DIRECTIONS.WEST,
    [ARROWS.right]: DIRECTIONS.EAST,
  },
  [DIRECTIONS.SOUTH]: {
    [ARROWS.down]: DIRECTIONS.SOUTH,
    [ARROWS.up]: DIRECTIONS.SOUTH,
    [ARROWS.left]: DIRECTIONS.WEST,
    [ARROWS.right]: DIRECTIONS.EAST,
  },
  [DIRECTIONS.EAST]: {
    [ARROWS.down]: DIRECTIONS.SOUTH,
    [ARROWS.up]: DIRECTIONS.NORTH,
    [ARROWS.left]: DIRECTIONS.EAST,
    [ARROWS.right]: DIRECTIONS.EAST,
  },
  [DIRECTIONS.WEST]: {
    [ARROWS.down]: DIRECTIONS.SOUTH,
    [ARROWS.up]: DIRECTIONS.NORTH,
    [ARROWS.left]: DIRECTIONS.WEST,
    [ARROWS.right]: DIRECTIONS.WEST,
  },
};

const getNextDirection = (key, direction) => {
  if (!allowedKeys.includes(key)) return direction;
  return NEXT_DIRECTIONS[direction][key];
};

const FOODS_ARRAY = [
  'APPLE',
  'BANANA',
  'EGG',
  'PEAR',
  'STRAWBERRY',
  'STONE',
  'MEDICINE',
];

const FOOD_TYPES = {
  APPLE: {
    name: 'APPLE',
    color: '#ff0000',
    score: 2,
  },
  EGG: {
    name: 'APPLE',
    color: '#00ff00',
    score: 3,
  },
  BANANA: {
    name: 'APPLE',
    color: '#ffff00',
    score: 4,
  },
  PEAR: {
    name: 'APPLE',
    color: '#00ffff',
    score: 5,
  },
  STRAWBERRY: {
    name: 'APPLE',
    color: '#ff00ff',
    score: 6,
  },
  STONE: {
    name: 'APPLE',
    color: '#000000',
    score: -10,
  },
  MEDICINE: {
    name: 'MEDICINE',
    color: 'teal',
    score: 10,
  },
};

const generatePos = () =>
  Math.floor(Math.random() * (BOX_SIZE / SNAKE_SIZE)) * SNAKE_SIZE;

const generateFood = () => {
  const randomIndex = Math.floor(Math.random() * FOODS_ARRAY.length);
  const foodType = FOODS_ARRAY[randomIndex];
  return {
    x: generatePos(),
    y: generatePos(),
    type: foodType,
  };
};

const generateInitialFoods = (numberOfFoods = 10) => {
  const foods = [];
  for (let i = 0; i < numberOfFoods; i++) {
    foods.push(generateFood());
  }
  return foods;
};

const initialSnake = [
  { x: 40, y: 0, type: 'head' },
  { x: 20, y: 0, type: 'body' },
  { x: 0, y: 0, type: 'body' },
];
export default function SnakeGame() {
  const [snake, setSnake] = useState(initialSnake);
  const intervalRef = useRef();
  const [gameOver, setGameover] = useState(false);
  const [direction, setDirection] = useState(DIRECTIONS.EAST);
  const [foods, setFoods] = useState(generateInitialFoods());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const hScore = localStorage.getItem('highScore');
    if (hScore) {
      setHighScore(hScore);
    }
  }, []);

  const handleScore = useCallback(() => {
    if (score > highScore || highScore === 0) {
      console.log('setting high score');
      localStorage.setItem('highScore', score);
      setHighScore(score);
    }
  }, [score, highScore]);

  useEffect(() => {
    if (gameOver) {
      handleScore();
    }
  }, [handleScore, gameOver]);

  const handleOnGameOver = useCallback(() => {
    setGameover(true);
    clearInterval(intervalRef.current);
  }, []);

  const detectFoodCollision = useCallback(
    (head) => {
      const food = foods.find((f) => f.x === head.x && f.y === head.y);
      if (food) {
        setScore(score + FOOD_TYPES[food.type].score);
        const newFoods = foods.filter((f) => f.x !== head.x || f.y !== head.y);

        newFoods.push(generateFood());
        setFoods(newFoods);
        if (food.type === FOOD_TYPES.MEDICINE.name) {
          if (snake.length > 3) {
            setSnake((snake) => {
              const newSnake = [...snake];
              newSnake[0].eaten = true;
              newSnake.pop();
              return newSnake;
            });
          }
        } else {
          setSnake((snake) => {
            const newSnake = [...snake, { x: head.x, y: head.y, type: 'body' }];
            newSnake[0].eaten = true;
            return newSnake;
          });
        }
      }
    },
    [foods, score]
  );

  const detectWallCollision = useCallback((head) => {
    if (
      head.x > BOX_SIZE - SNAKE_SIZE ||
      head.y > BOX_SIZE - SNAKE_SIZE ||
      head.y <= 0 - SNAKE_SIZE / 2 ||
      head.x <= 0 - SNAKE_SIZE / 2
    ) {
      handleOnGameOver();
    }
  }, []);

  const detectBodyCollision = useCallback(
    (head) => {
      const body = snake.find((b) => b.x === head.x && b.y === head.y);
      if (body) {
        handleOnGameOver();
      }
    },
    [snake]
  );

  const handleMove = useCallback(() => {
    const newSnake = [...snake];
    const head = newSnake[0];
    const newHead = { ...head };

    switch (direction) {
      case DIRECTIONS.NORTH:
        newHead.y -= SNAKE_SIZE;
        break;
      case DIRECTIONS.SOUTH:
        newHead.y += SNAKE_SIZE;
        break;
      case DIRECTIONS.EAST:
        newHead.x += SNAKE_SIZE;
        break;
      case DIRECTIONS.WEST:
        newHead.x -= SNAKE_SIZE;
        break;
      default:
        break;
    }

    newHead.eaten = false;
    head.type = 'body';
    newSnake.unshift(newHead);
    newSnake.pop();

    detectWallCollision(newHead);
    detectBodyCollision(newHead);
    setSnake(newSnake);
    detectFoodCollision(newHead);
  }, [snake]);

  const handleKeyDown = useCallback(
    (e) => {
      setDirection(getNextDirection(e.key, direction));
    },
    [direction]
  );

  const buildSnake = () => {
    return snake.map((part) => (
      <div
        className='snake-body'
        style={{
          left: `${part.x}px`,
          top: `${part.y}px`,
          width: `${SNAKE_SIZE - 2}px`,
          height: `${SNAKE_SIZE - 2}px`,
          margin: '1px',
          ...(part.eaten
            ? {
                transform: 'scale(120%)',
              }
            : {}),
        }}
      />
    ));
  };

  const buildFoods = () => {
    return foods.map((food) => (
      <div
        className='food'
        style={{
          left: `${food.x}px`,
          top: `${food.y}px`,
          width: `${SNAKE_SIZE}px`,
          height: `${SNAKE_SIZE}px`,
          backgroundColor: FOOD_TYPES[food.type].color,
        }}
      />
    ));
  };

  useEffect(() => {
    if (!gameOver && !isPaused && started) {
      intervalRef.current = setTimeout(handleMove, 100);
    }
    return () => {
      clearTimeout(intervalRef?.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snake, gameOver, isPaused, started]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleGameOver = () => {
    setFoods(generateInitialFoods());
    setSnake(initialSnake);
    setScore(0);
    setDirection(DIRECTIONS.EAST);

    setTimeout(() => {
      setGameover(false);
    }, 1000);
  };

  return (
    <>
      <div className='side'>
        <h2>Score: {score}</h2>
        <h3>High Score: {highScore}</h3>
        <button onClick={() => setIsPaused(true)}>pause</button>
      </div>
      <div
        className='box'
        style={{
          width: `${BOX_SIZE}px`,
          height: `${BOX_SIZE}px`,
        }}>
        {buildSnake()}
        {buildFoods()}
      </div>
      {gameOver && (
        <div className='game-over'>
          <div className='content'>
            <h1>Game Over</h1>
            <p>
              Your score is <h2>{score}</h2>
            </p>
            <p>
              High score is <h2>{highScore}</h2>
            </p>
            <button onClick={handleGameOver}>Play Again</button>
          </div>
        </div>
      )}
      {isPaused && !gameOver && (
        <div className='game-over'>
          <div className='content'>
            <h1>Paused</h1>
            <p>
              Your score is <h2>{score}</h2>
            </p>
            <button onClick={() => setIsPaused(false)}>continue</button>
          </div>
        </div>
      )}
      {!started && !isPaused && !gameOver && (
        <div className='game-over'>
          <div className='content'>
            <h1>Welcome to Snaker</h1>

            <button onClick={() => setStarted(true)}>Start Game</button>
          </div>
        </div>
      )}
    </>
  );
}
