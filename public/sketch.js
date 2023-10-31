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



function sendKeypoints(predictions) {
  if (predictions.length > 0) {
    let prediction = predictions[0];
    let referencePoint = prediction.annotations.palmBase[0];
    let distances = [];
    let angles = [];

    // Add relative positions to feature vector
    prediction.landmarks.forEach(keypoint => {
      distances.push(keypoint[0] - referencePoint[0]);
      distances.push(keypoint[1] - referencePoint[1]);
      distances.push(keypoint[2] - referencePoint[2]);
    });


    // Define selected pairs of landmarks for distance calculation
    const selectedPairs = [
      // PalmBase to fingertips
      [0, 4], [0, 8], [0, 12], [0, 16], [0, 20],

      // Between fingertips
      [4, 8], [8, 12], [12, 16], [16, 20],

      // Between the joints that are one joint farther out than the base of the fingers (i.e the proximal interphalangeal joint)
      [2, 6], [6, 10], [10, 14], [14, 18],

      // // Diagonal distances across the palm
      // [0, 8], [0, 12], [0, 16], [5, 17], [1, 13],

      // Thumb to other fingertips
      [4, 8], [4, 12], [4, 16], [4, 20],

      // Thumb to the base of each finger
      [4, 5], [4, 9], [4, 13], [4, 17],

      // Wrist to fingertips
      [0, 4], [0, 8], [0, 12], [0, 16], [0, 20],
      // Add more pairs as needed...
    ];


    // Add selected inter-landmark distances to distances array
    selectedPairs.forEach(pair => {
      const distance = calculateDistance(prediction.landmarks[pair[0]], prediction.landmarks[pair[1]]);
      distances.push(distance);
    });



    // Define angles between each finger's joints
    const selectedAngles = [
      // Thumb joints angles
      [0, 1, 2], [1, 2, 3], [2, 3, 4],

      // Index finger joints angles
      [0, 5, 6], [5, 6, 7], [6, 7, 8],

      // Middle finger joints angles
      [0, 9, 10], [9, 10, 11], [10, 11, 12],

      // Ring finger joints angles
      [0, 13, 14], [13, 14, 15], [14, 15, 16],

      // Pinky finger joints angles
      [0, 17, 18], [17, 18, 19], [18, 19, 20],
    ];


    // Define the wrist and fingertip points for direction calculation
    const wristToFingertips = [
      [0, 4], [0, 8], [0, 12], [0, 16], [0, 20]
    ];

     // Add direction angles relative to the wrist direction to feature vector
    wristToFingertips.forEach(pair => {
      const wristDirection = directionVector(prediction.landmarks[pair[0]], prediction.landmarks[0]);
      const fingerDirection = directionVector(prediction.landmarks[pair[0]], prediction.landmarks[pair[1]]);
      const angle = calculateAngleVectors(wristDirection, fingerDirection);
      featureVector.push(angle);
    });


      // Add angles between each finger's joints to angles array
    selectedAngles.forEach(angleSet => {
      const angle = calculateAngle(
        prediction.landmarks[angleSet[0]],
        prediction.landmarks[angleSet[1]],
        prediction.landmarks[angleSet[2]]
      );
      angles.push(angle);
    });


     // Define the gravity vector (pointing downwards)
    const gravityVector = [0, -1, 0];

    // Define fingertip points for direction calculation relative to gravity
    const fingertips = [4, 8, 12, 16, 20];



    // Add direction angles relative to the gravity vector to angles array
    fingertips.forEach(tip => {
      const fingerDirection = directionVector(prediction.landmarks[tip - 1], prediction.landmarks[tip]);
      const angle = calculateAngleVectors(fingerDirection, gravityVector);
      angles.push(angle);
    });


    // Add angles between each finger's joints to feature vector
    selectedAngles.forEach(angleSet => {
      const angle = calculateAngle(
        prediction.landmarks[angleSet[0]],
        prediction.landmarks[angleSet[1]],
        prediction.landmarks[angleSet[2]]
      );
      featureVector.push(angle);
    });


  // Function to calculate the direction vector from one point to another
  function directionVector(fromPoint, toPoint) {
    return [
      toPoint[0] - fromPoint[0],
      toPoint[1] - fromPoint[1],
      toPoint[2] - fromPoint[2]
    ];
  }

  // Function to calculate angle between two vectors in degrees
function calculateAngleVectors(vectorA, vectorB) {
  const dotProduct = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2];
  const magnitudeA = Math.sqrt(vectorA[0] * vectorA[0] + vectorA[1] * vectorA[1] + vectorA[2] * vectorA[2]);
  const magnitudeB = Math.sqrt(vectorB[0] * vectorB[0] + vectorB[1] * vectorB[1] + vectorB[2] * vectorB[2]);
  return Math.acos(dotProduct / (magnitudeA * magnitudeB)) * (180 / Math.PI); // Angle in degrees
}


 // Normalize distances and angles separately, then combine them
    distances = normalizeVector(distances);
    angles = normalizeVector(angles);
    let featureVector = distances.concat(angles);


    // Send the feature vector using OSC
    sendOsc('/handpose', featureVector);
  }
}

function calculateDistance(pointA, pointB) {
  const xDiff = pointA[0] - pointB[0];
  const yDiff = pointA[1] - pointB[1];
  const zDiff = pointA[2] - pointB[2];
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
}

function calculateAngle(pointA, pointB, pointC) {
  const vectorAB = [pointB[0] - pointA[0], pointB[1] - pointA[1], pointB[2] - pointA[2]];
  const vectorBC = [pointC[0] - pointB[0], pointC[1] - pointB[1], pointC[2] - pointB[2]];
  
  const dotProduct = vectorAB[0] * vectorBC[0] + vectorAB[1] * vectorBC[1] + vectorAB[2] * vectorBC[2];
  const magnitudeAB = Math.sqrt(vectorAB[0] * vectorAB[0] + vectorAB[1] * vectorAB[1] + vectorAB[2] * vectorAB[2]);
  const magnitudeBC = Math.sqrt(vectorBC[0] * vectorBC[0] + vectorBC[1] * vectorBC[1] + vectorBC[2] * vectorBC[2]);

  return Math.acos(dotProduct / (magnitudeAB * magnitudeBC)) * (180 / Math.PI); // Angle in degrees
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
