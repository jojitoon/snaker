import React, { useEffect, useCallback, useState, useRef } from 'react';
import './snake.css';
import snakeHead from '../assets/Head.png';
import snakeBody from '../assets/Body.png';
import snakeTail from '../assets/Tail.png';

import appleImg from '../assets/apple.jpeg';
import pearImg from '../assets/pear.jpeg';
import pillImg from '../assets/pill.png';
import hamImg from '../assets/ham.jpeg';

const BOX_SIZE = 800;
const SNAKE_SIZE = 20;

const snakeBodyMap = {
  head: snakeHead,
  body: snakeBody,
  tail: snakeTail,
};

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
    image: appleImg,
  },
  EGG: {
    name: 'APPLE',
    color: '#00ff00',
    score: 2,
    image: appleImg,
  },
  BANANA: {
    name: 'APPLE',
    color: '#ffff00',
    score: 4,
    image: pearImg,
  },
  PEAR: {
    name: 'APPLE',
    color: '#00ffff',
    score: 5,
    image: pearImg,
  },
  STRAWBERRY: {
    name: 'APPLE',
    color: '#ff00ff',
    score: 6,
    image: appleImg,
  },
  STONE: {
    name: 'STONE',
    color: '#000000',
    score: -10,
    image: hamImg,
  },
  MEDICINE: {
    name: 'MEDICINE',
    color: 'teal',
    score: 10,
    image: pillImg,
  },
};

const generatePos = () =>
  Math.floor(Math.random() * (BOX_SIZE / SNAKE_SIZE)) * SNAKE_SIZE;

const generateXY = () => {
  const x = generatePos();
  const y = generatePos();
  return { x, y };
};

const generateUniqueXY = (blocks) => {
  const XY = generateXY();

  const existABlock = blocks.find(
    (block) => block.x === XY.x && block.y === XY.y
  );

  if (existABlock) {
    return generateUniqueXY(blocks);
  }

  return XY;
};
const generateFood = (blocks = []) => {
  const randomIndex = Math.floor(Math.random() * FOODS_ARRAY.length);
  const foodType = FOODS_ARRAY[randomIndex];

  const XY = generateUniqueXY(blocks);
  return {
    ...XY,
    type: foodType,
  };
};

const generateInitialFoods = (numberOfFoods = 10, blocks) => {
  const foods = [];
  for (let i = 0; i < numberOfFoods; i++) {
    foods.push(generateFood(blocks));
  }
  return foods;
};

const initialSnake = [
  { x: 120, y: 0, type: 'head', direction: DIRECTIONS.EAST, rotation: 0 },
  { x: 100, y: 0, type: 'body', direction: DIRECTIONS.EAST, rotation: 0 },
  { x: 80, y: 0, type: 'body', direction: DIRECTIONS.EAST, rotation: 0 },
  { x: 60, y: 0, type: 'body', direction: DIRECTIONS.EAST, rotation: 0 },
  { x: 40, y: 0, type: 'body', direction: DIRECTIONS.EAST, rotation: 0 },
  { x: 20, y: 0, type: 'body', direction: DIRECTIONS.EAST, rotation: 0 },
  { x: 0, y: 0, type: 'body', direction: DIRECTIONS.EAST, rotation: 0 },
];

const calculateRotations = (nextDirection, direction) => {
  if (direction === DIRECTIONS.NORTH) {
    if (nextDirection === DIRECTIONS.EAST) return 0;
    if (nextDirection === DIRECTIONS.WEST) return 180;
  }
  if (direction === DIRECTIONS.SOUTH) {
    if (nextDirection === DIRECTIONS.EAST) return 0;
    if (nextDirection === DIRECTIONS.WEST) return 180;
  }
  if (direction === DIRECTIONS.EAST) {
    if (nextDirection === DIRECTIONS.NORTH) return -90;
    if (nextDirection === DIRECTIONS.SOUTH) return 90;
  }
  if (direction === DIRECTIONS.WEST) {
    if (nextDirection === DIRECTIONS.NORTH) return -90;
    if (nextDirection === DIRECTIONS.SOUTH) return 90;
  }
  return 0;
};

const LEVEL_1_BLOCK = [
  { x: 80, y: 80 },
  { x: 100, y: 80 },
  { x: 120, y: 80 },
  { x: 140, y: 80 },
  { x: 160, y: 80 },

  { x: 200, y: 200 },
  { x: 200, y: 220 },
  { x: 200, y: 240 },
  { x: 200, y: 260 },
  { x: 200, y: 280 },
];

const LEVEL_2_BLOCK = [
  { x: 80, y: 80 },
  { x: 100, y: 80 },
  { x: 120, y: 80 },
  { x: 140, y: 80 },
  { x: 160, y: 80 },

  { x: 200, y: 200 },
  { x: 200, y: 220 },
  { x: 200, y: 240 },
  { x: 200, y: 260 },
  { x: 200, y: 280 },
  { x: 200, y: 300 },
  { x: 200, y: 320 },
  { x: 200, y: 340 },
  { x: 200, y: 360 },
  { x: 200, y: 380 },
  { x: 200, y: 400 },
  { x: 200, y: 420 },
  { x: 200, y: 440 },
  { x: 200, y: 460 },
  { x: 200, y: 480 },
  { x: 200, y: 500 },
  { x: 200, y: 520 },
  { x: 200, y: 540 },
  { x: 200, y: 560 },
  { x: 200, y: 580 },
  { x: 200, y: 600 },
];

const LEVEL_3_BLOCK = [
  { x: 80, y: 80 },
  { x: 100, y: 80 },
  { x: 120, y: 80 },
  { x: 140, y: 80 },
  { x: 160, y: 80 },

  { x: 200, y: 200 },
  { x: 200, y: 220 },
  { x: 200, y: 240 },
  { x: 200, y: 260 },
  { x: 200, y: 280 },
];

const LEVEL_4_BLOCK = [
  { x: 80, y: 80 },
  { x: 100, y: 80 },
  { x: 120, y: 80 },
  { x: 140, y: 80 },
  { x: 160, y: 80 },

  { x: 200, y: 200 },
  { x: 200, y: 220 },
  { x: 200, y: 240 },
  { x: 200, y: 260 },
  { x: 200, y: 280 },
];

const getLevelBlock = (level) => {
  switch (level) {
    case 1:
      return LEVEL_1_BLOCK;
    case 2:
      return LEVEL_2_BLOCK;
    case 3:
      return LEVEL_3_BLOCK;
    case 4:
      return LEVEL_4_BLOCK;
    default:
      return [];
  }
};

const determineLevel = (score) => {
  if (score >= 10 && score < 20) {
    return 2;
  }
  if (score >= 20 && score < 30) {
    return 3;
  }
  if (score >= 30 && score < 40) {
    return 4;
  }

  return 1;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState(initialSnake);
  const intervalRef = useRef();
  const [gameOver, setGameover] = useState(false);
  const [direction, setDirection] = useState(DIRECTIONS.EAST);
  const [foods, setFoods] = useState(generateInitialFoods(LEVEL_1_BLOCK));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [levelBlock, setLevelBlock] = useState(LEVEL_1_BLOCK);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    const blks = getLevelBlock(currentLevel);
    setLevelBlock(blks);
    setFoods(generateInitialFoods(blks));
  }, [currentLevel]);

  useEffect(() => {
    const hScore = localStorage.getItem(`highScore-${currentLevel}`);
    setHighScore(hScore || 0);
  }, [currentLevel]);

  const handleScore = useCallback(() => {
    if (!highScore || score > highScore || highScore === 0) {
      localStorage.setItem(`highScore-${currentLevel}`, score);
      setHighScore(score);
    }
  }, [score, highScore, currentLevel]);

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

        newFoods.push(generateFood(levelBlock));
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

  const detectWallCollision = useCallback(
    (head) => {
      const block = levelBlock.find((b) => b.x === head.x && b.y === head.y);

      if (
        block ||
        head.x > BOX_SIZE - SNAKE_SIZE ||
        head.y > BOX_SIZE - SNAKE_SIZE ||
        head.y <= 0 - SNAKE_SIZE / 2 ||
        head.x <= 0 - SNAKE_SIZE / 2
      ) {
        handleOnGameOver();
      }
    },
    [levelBlock]
  );

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

    let newHeadRotation = newHead.rotation;

    if (direction !== newHead.direction) {
      newHeadRotation = calculateRotations(direction, newHead.direction);
    }

    newHead.eaten = false;
    newHead.rotation = newHeadRotation;
    newHead.direction = direction;

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
    return snake.map((part, i) => {
      const isTail = i === snake.length - 1;
      const isHead = i === 0;
      const bodyPart = isHead ? 'head' : isTail ? 'tail' : 'body';

      return (
        <img
          className='snake-body'
          style={{
            left: `${part.x}px`,
            top: `${part.y}px`,
            width: `${SNAKE_SIZE - 2}px`,
            height: `${SNAKE_SIZE - 2}px`,
            margin: '1px',
            transform: `rotate(${part.rotation || 0}deg)`,
            ...(part.eaten
              ? {
                  transform: 'scale(120%)',
                }
              : {}),
          }}
          alt='snake'
          src={snakeBodyMap[bodyPart]}
        />
      );
    });
  };

  const buildFoods = () => {
    return foods.map((food) => (
      <img
        className='food'
        style={{
          left: `${food.x}px`,
          top: `${food.y}px`,
          width: `${SNAKE_SIZE}px`,
          height: `${SNAKE_SIZE}px`,
          // backgroundColor: FOOD_TYPES[food.type].color,
        }}
        alt='food'
        src={FOOD_TYPES[food.type].image}
      />
    ));
  };

  const buildBlocks = () => {
    return levelBlock.map((block) => (
      <div
        className='block'
        style={{
          left: `${block.x}px`,
          top: `${block.y}px`,
        }}
        alt='block'
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
    setLevelBlock(LEVEL_1_BLOCK);
    setCurrentLevel(1);

    setTimeout(() => {
      setGameover(false);
    }, 1000);
  };

  // useEffect(() => {
  //   const newLevel = determineLevel(score);
  //   if (newLevel > currentLevel) {
  //     setCurrentLevel(newLevel);
  //     setLevelBlock(getLevelBlock(newLevel));
  //   }
  // }, [score]);

  const LevelSelector = () => (
    <div>
      <select
        value={currentLevel}
        onChange={(e) => setCurrentLevel(Number(e.target.value))}>
        <option value={1}>Level 1</option>
        <option value={2}>Level 2</option>
        <option value={3}>Level 3</option>
        <option value={4}>Level 4</option>
        <option value={5}>Level 5</option>
      </select>
    </div>
  );
  return (
    <>
      <div className='side'>
        <h1>Level: {currentLevel}</h1>
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
        {buildBlocks()}
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
            <LevelSelector />
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
            <LevelSelector />
            <button onClick={() => setStarted(true)}>Start Game</button>
          </div>
        </div>
      )}
    </>
  );
}
