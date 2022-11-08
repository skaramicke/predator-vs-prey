import { lerpColor } from "./lerpColor";

export const drawNetwork = (
  inputActivations,
  hiddenLayerWeights,
  hiddenLayerActivations,
  outputActivations,
  ctx,
  leftSide,
  x, y
) => {
  const left = leftSide ? 0 : ctx.canvas.clientWidth - 200;
  // Draw input layer
  for (let i = 0; i < inputActivations.length; i++) {
    ctx.beginPath();
    const activation = leftSide ? -inputActivations[i] : inputActivations[i];
    let color;
    if (activation > 0) {
      color = lerpColor('#EEEEEE', '#00ff00', Math.abs(activation));
    } else {
      color = lerpColor('#EEEEEE', '#ff0000', Math.abs(activation));
    }
    ctx.fillStyle = color;
    ctx.arc(left + 10, 10 + i * 20, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  // Draw hidden layer based on number of hidden_neurons
  for (let i = 0; i < hiddenLayerActivations.length; i++) {
    ctx.beginPath();
    let activation = hiddenLayerActivations[i];
    if (activation > 0) {
      ctx.fillStyle = lerpColor('#EEEEEE', '#00ff00', Math.abs(activation));
    } else {
      ctx.fillStyle = lerpColor('#EEEEEE', '#ff0000', Math.abs(activation));
    }
    ctx.arc(left + 50, 10 + i * 20, 8, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // Draw lines between input and hidden layer
  for (let i = 0; i < inputActivations.length; i++) {
    for (let j = 0; j < hiddenLayerActivations.length; j++) {
      ctx.beginPath();
      ctx.strokeStyle = lerpColor('#FF0000', '#00FF00', (hiddenLayerWeights[j * i] + 1.0) / 2.0);
      ctx.moveTo(left + 10, 10 + i * 20);
      ctx.lineTo(left + 50, 10 + j * 20);
      ctx.stroke();
      ctx.closePath();
    }
  }

  // Draw output layer
  for (let i = 0; i < outputActivations.length; i++) {
    ctx.beginPath();
    let activation = outputActivations[i];
    if (activation > 0) {
      ctx.fillStyle = lerpColor('#EEEEEE', '#00ff00', Math.abs(activation));
    } else {
      ctx.fillStyle = lerpColor('#EEEEEE', '#ff0000', Math.abs(activation));
    }
    ctx.arc(left + 90, 10 + i * 20, 8, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  const outputWeightsOffset = inputActivations.length * hiddenLayerActivations.length;
  // Draw lines between hidden and output layer
  for (let i = 0; i < hiddenLayerActivations.length; i++) {
    for (let j = 0; j < outputActivations.length; j++) {
      ctx.beginPath();
      ctx.strokeStyle = lerpColor('#FF0000', '#00FF00', (hiddenLayerWeights[outputWeightsOffset + j * i] + 1.0) / 2.0);
      ctx.moveTo(left + 50, 10 + i * 20);
      ctx.lineTo(left + 90, 10 + j * 20);
      ctx.stroke();
      ctx.closePath();
    }
  }


  // Draw a line to x, y
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.moveTo(left + 10, 10 + inputActivations.length * 20);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.closePath();

};
