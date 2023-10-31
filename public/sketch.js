let model, video, keypoints, predictions = [];
var socket;


function preload() {
  video = createCapture(VIDEO, () => {
    loadHandTrackingModel();
  });
  video.hide();
}

function setup() {
  createCanvas(600, 800);
	setupOsc(12000, 3334);
}

async function loadHandTrackingModel() {
  // Load the MediaPipe handpose model.
  model = await handpose.load();
  predictHand();
}

function draw() {
  background(255);
  if (model) image(video, 0, 0);
  if (predictions.length > 0) {
    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();
  }
}

async function predictHand() {
  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain a
  // hand prediction from the MediaPipe graph.
  predictions = await model.estimateHands(video.elt);
  if (predictions.length > 0) {
    sendKeypoints(predictions);
  }

  setTimeout(() => predictHand(), 100);
}

function sendKeypoints(predictions){
  // let prediction = predictions[0];
  // for (let j = 0; j < prediction.landmarks.length; j++) {
  //   let keypoint = prediction.landmarks[j];
  //   var keys = Object.keys(obj);
  //   console.log(keypoint);
  // }

  //console.log(predictions)
  console.log('who the bitch now');

  Object.keys(predictions[0].annotations).forEach(function (key) {
    // console.table('Key : ' + key + ', Value : ' + prediction.landmarks[key])
    sendOsc(key,predictions[0].annotations[key])
  })
}


// function sendKeypoints(predictions) {
//   let prediction = predictions[0];

//   // Assuming 'palmBase' is the bottom of the hand
//   // and it's the first element in the palmBase array
//   let referencePoint = prediction.annotations.palmBase[0];

//   let flatData = [];
  
//   // Loop through each keypoint
//   prediction.landmarks.forEach(keypoint => {
//     // Calculate the relative position with respect to the reference point
//     let relativeX = keypoint[0] - referencePoint[0];
//     let relativeY = keypoint[1] - referencePoint[1];
//     let relativeZ = keypoint[2] - referencePoint[2];

//     // Add the relative positions to the flatData array
//     flatData.push(relativeX, relativeY, relativeZ);
//   });

//   // Send the flattened and relative data to OSC
//   sendOsc('/handpose', flatData);
// }





function sendKeypoints(predictions) {
  if (predictions.length > 0) {
    let prediction = predictions[0];
    let referencePoint = prediction.annotations.palmBase[0];
    let featureVector = [];

    // Add relative positions to feature vector
    prediction.landmarks.forEach(keypoint => {
      featureVector.push(keypoint[0] - referencePoint[0]);
      featureVector.push(keypoint[1] - referencePoint[1]);
      featureVector.push(keypoint[2] - referencePoint[2]);
    });

    // Define selected pairs of landmarks for distance calculation
    const selectedPairs = [
      // PalmBase to fingertips
      [0, 4], [0, 8], [0, 12], [0, 16], [0, 20],
      // Between fingertips
      [4, 8], [8, 12], [12, 16], [16, 20],
      // Between each finger's joints
      [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8],
      [9, 10], [10, 11], [11, 12], [13, 14], [14, 15], [15, 16],
      [17, 18], [18, 19], [19, 20],
      // Between bases of adjacent fingers
      [1, 5], [5, 9], [9, 13], [13, 17],
      // Diagonal distances across the palm
      [0, 8], [0, 12], [0, 16], [5, 17], [1, 13],
      // Thumb to other fingertips
      [4, 8], [4, 12], [4, 16], [4, 20],
      // Wrist to fingertips
      [0, 4], [0, 8], [0, 12], [0, 16], [0, 20],
      // Add more pairs as needed...
    ];

    // Add selected inter-landmark distances to feature vector
    selectedPairs.forEach(pair => {
      const distance = calculateDistance(prediction.landmarks[pair[0]], prediction.landmarks[pair[1]]);
      featureVector.push(distance);
    });

    // Normalize the feature vector
    featureVector = normalizeVector(featureVector);

    // Send the feature vector using OSC
    sendOsc('/handpose', featureVector);
  }
}

function calculateDistance(pointA, pointB) {
  return Math.sqrt(
    Math.pow(pointA[0] - pointB[0], 2) +
    Math.pow(pointA[1] - pointB[1], 2) +
    Math.pow(pointA[2] - pointB[2], 2)
  );
}

function normalizeVector(vector) {
  const max = Math.max(...vector);
  return vector.map(value => value / max);
}



function sendOsc(address, value) {
  socket.emit('message', [address].concat(value));
}




// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  let prediction = predictions[0];
  for (let j = 0; j < prediction.landmarks.length; j++) {
    let keypoint = prediction.landmarks[j];
    fill(255, 0, 0);
    noStroke();
    ellipse(keypoint[0], keypoint[1], 10, 10);
  }
}

// function sendKeypoints(predictions) {
//   const prediction = predictions[0];

//   // Helper function to calculate the approximate distance between two points
//   const approxDistance = (point1, point2) => {
//     const dx = point1[0] - point2[0];
//     const dy = point1[1] - point2[1];
//     const dz = point1[2] - point2[2];
//     return Math.abs(dx) + Math.abs(dy) + Math.abs(dz); // Manhattan distance approximation
//   };

//   let flatData = [];

//   // Distances from PalmBase to each fingertip (simplified to just thumb and pinky)
//   const palmBase = prediction.annotations.palmBase[0];
//   const thumbTip = prediction.annotations.thumb.at(-1);
//   const pinkyTip = prediction.annotations.pinky.at(-1);
//   flatData.push(approxDistance(palmBase, thumbTip));
//   flatData.push(approxDistance(palmBase, pinkyTip));

//   // Distance between thumb and pinky tips (simplified to just these two)
//   flatData.push(approxDistance(thumbTip, pinkyTip));

//   // Send the flatData as OSC message
//   sendOsc('/handpose', flatData);
// }

// function sendOsc(address, value) {
//   socket.emit('message', [address].concat(value));
// }




// A function to draw the skeletons
function drawSkeleton() {
  let annotations = predictions[0].annotations;
  stroke(255, 0, 0);
  for (let j = 0; j < annotations.thumb.length - 1; j++) {
    line(annotations.thumb[j][0], annotations.thumb[j][1], annotations.thumb[j + 1][0], annotations.thumb[j + 1][1]);
  }
  for (let j = 0; j < annotations.indexFinger.length - 1; j++) {
    line(annotations.indexFinger[j][0], annotations.indexFinger[j][1], annotations.indexFinger[j + 1][0], annotations.indexFinger[j + 1][1]);
  }
  for (let j = 0; j < annotations.middleFinger.length - 1; j++) {
    line(annotations.middleFinger[j][0], annotations.middleFinger[j][1], annotations.middleFinger[j + 1][0], annotations.middleFinger[j + 1][1]);
  }
  for (let j = 0; j < annotations.ringFinger.length - 1; j++) {
    line(annotations.ringFinger[j][0], annotations.ringFinger[j][1], annotations.ringFinger[j + 1][0], annotations.ringFinger[j + 1][1]);
  }
  for (let j = 0; j < annotations.pinky.length - 1; j++) {
    line(annotations.pinky[j][0], annotations.pinky[j][1], annotations.pinky[j + 1][0], annotations.pinky[j + 1][1]);
  }

  line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.thumb[0][0], annotations.thumb[0][1]);
  line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.indexFinger[0][0], annotations.indexFinger[0][1]);
  line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.middleFinger[0][0], annotations.middleFinger[0][1]);
  line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.ringFinger[0][0], annotations.ringFinger[0][1]);
  line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.pinky[0][0], annotations.pinky[0][1]);
}

function sendOsc(address, value) {
	socket.emit('message', [address].concat(value));
}

function setupOsc(oscPortIn, oscPortOut) {
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {	
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}
