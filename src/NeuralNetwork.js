const sigmoid = (x) => 1 / (1 + Math.exp(-x));

class Neouron {
  constructor(nInputs) {
    this.weights = [];
    for (let i = 0; i < nInputs; i++) {
      this.weights[i] = Math.random();
    }
    this.bias = Math.random();
  }

  compute(inputArray) {
    let sum = this.bias;
    for (let i in inputArray) {
      sum += inputArray[i] * this.weights[i];
    }
    return sigmoid(sum);
  }

  clone() {
    const neuron = new Neouron(this.weights.length);
    neuron.weights = [...this.weights];
    neuron.bias = this.bias;
    return neuron;
  }

  mutate(n) {
    for (let i = 0; i < n; i++) {
      const randomIdx = Math.floor(Math.random() * (this.weights.length + 1));
      if (randomIdx === this.weights.length) {
        this.bias += Math.random() - 0.5;
      } else {
        this.weights[randomIdx] += Math.random() - 0.5;
      }
    }
  }
}

class NeuroLayer {
  constructor(n, nInputs) {
    this.neurons = [];
    for (let i = 0; i < n; i++) {
      this.neurons.push(new Neouron(nInputs));
    }
  }

  compute(inputArray) {
    const outputArray = [];
    for (let neuron of this.neurons) {
      outputArray.push(neuron.compute(inputArray));
    }
    return outputArray;
  }

  clone() {
    const neuroLayer = new NeuroLayer(0, 0);
    for (let neuron of this.neurons) {
      neuroLayer.neurons.push(neuron.clone());
    }
    return neuroLayer;
  }

  mutate(nNeourons, nWeights) {
    for (let i = 0; i < nNeourons; i++) {
      const randomIdx = Math.floor(Math.random() * (this.neurons.length));
      this.neurons[randomIdx].mutate(nWeights);
    }
  }
}

class NeuralNetwork {
  constructor(nInputs, layerSizes) {
    this.layers = [];
    for (let layerSize of layerSizes) {
      if (this.layers.length === 0) {
        this.layers.push(new NeuroLayer(layerSize, nInputs));
      } else {
        this.layers.push(new NeuroLayer(layerSize,
          this.layers[this.layers.length - 1].neurons.length));
      }
    }
  }

  compute(inputArray) {
    let computed = inputArray;
    for (let layer of this.layers) {
      computed = layer.compute(computed);
    }
    return computed;
  }

  clone() {
    const neouroNetwork = new NeuralNetwork(0, []);
    for (let layer of this.layers) {
      neouroNetwork.layers.push(layer.clone());
    }
    return neouroNetwork;
  }

  mutate(nLayers, nNeourons, nWeights) {
    for (let i = 0; i < nLayers; i++) {
      const randomIdx = Math.floor(Math.random() * (this.layers.length));
      this.layers[randomIdx].mutate(nNeourons, nWeights);
    }
  }
}

export default NeuralNetwork;