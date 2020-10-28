/*
  The purpose of this file is to take in the analyser node and a <canvas> element: 
    - the module will create a drawing context that points at the <canvas> 
    - it will store the reference to the analyser node
    - in draw(), it will loop through the data in the analyser node
    - and then draw something representative on the canvas
    - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import * as classes from './class.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData;
// city silhouette
let sihouette = document.querySelector("#citySilhouette");
let pixelCount = 0;

// for stars
let stars;
let numStars = 50;
let starColor = "yellow";
let starRadius = 10;
let maxRadius = 1.3;
let percent = 0;

function setupCanvas(canvasElement, analyserNodeRef) {
  // create drawing context
  ctx = canvasElement.getContext("2d");
  canvasWidth = canvasElement.width;
  canvasHeight = canvasElement.height;
  // create a gradient that runs top to bottom
  gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "#11001c" }, { percent: .25, color: "#190028" }, { percent: .5, color: "#220135" }, { percent: .75, color: "#32004f" }, { percent: 1, color: "#3a015c" }]);
  // keep a reference to the analyser node
  analyserNode = analyserNodeRef;
  // this is the array where the analyser data will be stored
  audioData = new Uint8Array(analyserNode.fftSize / 2);

  stars = [];
  generateStars();

  // slider
  document.querySelector('#radiusSlider').onchange = (e) => {
    maxRadius = e.target.value;
  }
  document.querySelector("#starColorSelect").onclick = (e) => {
    starColor = e.target.value;
  }
}

function draw(params = {}) {
  // 1 - populate the audioData array with the frequency data from the analyserNode
  // notice these arrays are passed "by reference" 
  analyserNode.getByteFrequencyData(audioData);
  // OR
  //analyserNode.getByteTimeDomainData(audioData); // waveform data

  // 2 - draw background
  ctx.save();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 3 - draw gradient
  if (params.showGradient) {
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = .7;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 4 - draw bars
  if (params.showBars) {
    let lineGradient = utils.getLinearGradient(ctx, 10, 0, 750, 0, [{ percent: 0, color: "red" }, { percent: 1 / 6, color: "orange" }, { percent: 2 / 6, color: "yellow" },
    { percent: 3 / 6, color: "green" }, { percent: 4 / 6, color: "aqua" }, { percent: 5 / 6, color: "blue" }, { percent: 1, color: "pink" }]);

    ctx.save();
    ctx.lineWidth = 20;
    ctx.strokeStyle = lineGradient;
    // loop through the data and draw!
    for (let i = 0; i < audioData.length; i++) {
      percent += audioData[i];
      ctx.beginPath();
      ctx.moveTo(10 + i * 20, 650 - audioData[i] * 1.5);
      ctx.lineTo(10 + i * 20, 650);
      ctx.stroke();
    }
    ctx.restore();
  }

  percent /= audioData.length;
  if (params.showStars) {
    drawStars(percent, numStars);
  }

  if (params.showSilhouette) {
    loopSilhouette(sihouette);
  }


  // 6 - bitmap manipulation
  let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  let data = imageData.data;
  let length = data.length;
  let width = imageData.width;

  // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
  for (let i = 0; i < length; i += 4) {
    if (params.showInvert) {
      let red = data[i], green = data[i + 1], blue = data[i + 2];
      data[i] = 255 - red;      // set red value
      data[i + 1] = 255 - green;  // set blue value?
      data[i + 2] = 255 - blue;   // set green value?
    }
  } // end for

  if (params.showEmboss) {
    for (let i = 0; i < length; i++) {
      if (i % 4 == 3) continue; // skip alpha channel
      data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
    }
  }

  // D) copy image data back to canvas
  ctx.putImageData(imageData, 0, 0);

}

// helper function to loop buildings
const loopSilhouette = (image) => {
  if (pixelCount >= 800) {
    pixelCount = 0;
  }

  //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  //right          
  ctx.drawImage(image, 0, 0, 564, 584, pixelCount, 0, 800, 600);
  //left
  ctx.drawImage(image, 0, 0, 564, 584, -800 + pixelCount, 0, 800, 600);
  pixelCount++;
}

const generateStars = () => {
  for (let i = 0; i < numStars; i++) {
    let newStar = new classes.Star(ctx, starRadius);
    stars.push(newStar);
  }
}

const drawStars = (percent, numStars) => {
  for (let i = 0; i < numStars; i++) {
    // Star radius
    let cirRadius = maxRadius * (percent / 255) * stars[i].radius;
    
    ctx.beginPath();
    ctx.save();
    /* if (glow) {
      // glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = starColor;
    } */

    //ctx.fillStyle = starColor;
    utils.drawCircle(ctx, stars[i].x, stars[i].y, cirRadius, starColor);
    ctx.closePath();
    ctx.restore();
  }
}


export { setupCanvas, draw };