Hand-post-feature-extraction
Doesn't estimate hand poses for you, but does some nice feature extraction and sends that information over OSC for Wekinator that is much more germane to the task of gesture recognition (as opposed to just a raw table of X,Y,Z positions).

Based almost entirely on https://github.com/faaip/Handpose-OSC-p5

(Only the feature extraction work is original). See original readme below:

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
