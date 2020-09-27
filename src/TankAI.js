import NeuralNetwork from './NeuralNetwork.js';

const getMaxIdx = (arr) => {
  let maxIdx = 0;
  for (let idx in arr) {
    if (arr[idx] > arr[maxIdx]) {
      maxIdx = idx;
    }
  }
  return maxIdx;
}

const chooseMaxFromArr = (arr, seriesLength) => {
  const maxIdx = getMaxIdx(arr);
  const maxValue = arr[maxIdx] /
    seriesLength;
  if (maxValue > 0.5) {
    return [maxIdx];
  }
  return [];
}

class TankAI {
  constructor(parent) {
    if (parent === undefined) {
      this.shotNN = new NeuralNetwork(10, [1]);
      this.moveNN = new NeuralNetwork(13, [13, 4]);
    } else {
      this.moveNN = parent.moveNN.clone();
      this.shotNN = parent.shotNN.clone();
    }
  }

  mutate() {
    this.moveNN.mutate(2, 4, 2);
    this.shotNN.mutate(1, 4, 2);
  }

  decideMove(environment) {
    if (environment.enemyBullets.length > 0) {
      let moveDecisions = [0, 0, 0, 0];
      for (let bullet of environment.enemyBullets) {
        const inputsArray = [
          environment.tank.x / 500,
          environment.tank.y / 500,
          +environment.tank.axis,
          +environment.tank.direction,
          environment.enemy.x / 500,
          environment.enemy.y / 500,
          +environment.enemy.axis,
          +environment.enemy.direction,
          bullet.x,
          bullet.y,
          +bullet.axis,
          +bullet.direction,
          1,
        ];
        const result = this.moveNN.compute(inputsArray);
        for (let idx in result) {
          moveDecisions[idx] += result[idx];
        }
      }
      return chooseMaxFromArr(moveDecisions, environment.enemyBullets.length);
    } else {
      const inputsArray = [
        environment.tank.x / 500,
        environment.tank.y / 500,
        +environment.tank.axis,
        +environment.tank.direction,
        environment.enemy.x / 500,
        environment.enemy.y / 500,
        +environment.enemy.axis,
        +environment.enemy.direction,
        0,
        0,
        0,
        0,
        0,
      ];
      const result = this.moveNN.compute(inputsArray);
      return chooseMaxFromArr(result, 1);
    }
  }

  decideShot(environment) {
    const inputsArray = [
      environment.tank.x / 500,
      environment.tank.y / 500,
      +environment.tank.axis,
      +environment.tank.direction,
      environment.tank.power / 100,
      environment.enemy.x / 500,
      environment.enemy.y / 500,
      +environment.enemy.axis,
      +environment.enemy.direction,
      environment.enemy.power / 100,
    ];
    const result = this.shotNN.compute(inputsArray);
    return chooseMaxFromArr(result, 1);
  }

  decide(environment) {
    const moveActions = this.decideMove(environment);
    const shotActions = this.decideShot(environment);
    if (shotActions.length > 0) {
      shotActions[0] = 4;
    }
    return [...moveActions, ...shotActions];
  }
}

export default TankAI;