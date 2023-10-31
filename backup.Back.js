
// function sendKeypoints(predictions) {
//   let prediction = predictions[0];

//   // Use palmBase as the reference point (base of the wrist)
//   const palmBase = prediction.annotations.palmBase[0];

//   // Adjust keypoints to be relative to the palmBase and flatten the structure
//   let adjustedAndFlattenedKeypoints = [];
//   for (let j = 0; j < prediction.landmarks.length; j++) {
//     let keypoint = prediction.landmarks[j];
//     adjustedAndFlattenedKeypoints.push(keypoint[0] - palmBase[0]);
//     adjustedAndFlattenedKeypoints.push(keypoint[1] - palmBase[1]);
//     adjustedAndFlattenedKeypoints.push(keypoint[2] - palmBase[2]);
//   }



//     Object.keys(adjustedAndFlattenedKeypoints).forEach(function (key) {
//     // console.table('Key : ' + key + ', Value : ' + prediction.landmarks[key])
//     sendOsc(key,predictions[0].adjustedAndFlattenedKeypoints[key])
//     console.log(adjustedAndFlattenedKeypoints)

//   })


// }


// function sendKeypoints(predictions){
//     let prediction = predictions[0];
//     for (let j = 0; j < prediction.landmarks.length; j++) {
//       let keypoint = prediction.landmarks[j];
//       var keys = Object.keys(obj);
//       console.log(keypoint);
//     }

//   console.log(predictions)

//   Object.keys(predictions[0].annotations).forEach(function (key) {
//     // console.table('Key : ' + key + ', Value : ' + prediction.landmarks[key])
//     sendOsc(key,predictions[0].annotations[key])
//   })
// }



//this works for OscViewer
// function sendKeypoints(predictions) {
//   let prediction = predictions[0];

//   // Use palmBase as the reference point (base of the wrist)
//   const wristBase = prediction.annotations.palmBase[0];

//   // Adjust keypoints to be relative to the base of the wrist
//   let adjustedAnnotations = {};
//   Object.keys(prediction.annotations).forEach(function (key) {
//     adjustedAnnotations[key] = prediction.annotations[key].map(coord => {

//       return [coord[0] - wristBase[0], coord[1] - wristBase[1], coord[2] - wristBase[2]];
//     });
//   });

//   console.log(adjustedAnnotations);

//   // Send adjusted keypoints
//   Object.keys(adjustedAnnotations).forEach(function (key) {
//     // sendOsc(key, adjustedAnnotations[key]);
//     sendOsc('wek/inputs', adjustedAnnotations[key]);

//   });
// }



// //this works for OscViewer
// function sendKeypoints(predictions) {
//   let prediction = predictions[0];

//   // Use palmBase as the reference point (base of the wrist)
//   const wristBase = prediction.annotations.palmBase[0];

//   // Adjust keypoints to be relative to the base of the wrist
//   let adjustedAnnotations = {};
//   Object.keys(prediction.annotations).forEach(function (key) {
//     adjustedAnnotations[key] = prediction.annotations[key].map(coord => {

//       return [coord[0] - wristBase[0], coord[1] - wristBase[1], coord[2] - wristBase[2]];
//     });
//   });

//   console.log(adjustedAnnotations);

//   // Send adjusted keypoints
//   Object.keys(adjustedAnnotations).forEach(function (key) {
//     sendOsc(key, adjustedAnnotations[key]);
//   });
// }








