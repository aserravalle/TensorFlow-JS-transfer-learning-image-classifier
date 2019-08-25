// Load the classifiers
const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
let net;

// Webcam predictor function
async function app() {
  console.log('Loading mobilenet..');
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  // Read an image from the webcam and associate it with one of the classes
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');
    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add a training example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-d').addEventListener('click', () => addExample(3));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['Ariel', 'Maia', 'Zac', 'Pancho'];
      document.getElementById('console').innerText = `
        Prediction: ${classes[result.classIndex]}\n
        Probability: ${result.confidences[result.classIndex] * 100}%
      `;
    }

    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true },
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata', () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();
