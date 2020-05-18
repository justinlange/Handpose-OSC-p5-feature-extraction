# Handpose OSC
This is a quick attempt at using the [MediaPipe Handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose) and have it output OSC using [p5js-osc](https://github.com/genekogan/p5js-osc) by Gene Kogan @genekogan.

## Setup
Make sure you have [node](https://nodejs.org/en/) installed.

```
git clone https://github.com/faaip/Handpose-OSC-p5
cd Handpose-OSC-p5
npm install

```
Run node process:
```
node bridge.js
```
You can now open *http://localhost:3000/* in the browser and it will send OSC to port **3334**.

### Thanks
Gene Kogan for p5js-osc <br>
MediaPipe team
