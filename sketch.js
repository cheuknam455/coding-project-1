
let size = 15;
let num = 10;
let grid = [];
let min = 150;

let song;
let fft;
let spectrum = [];
let distFromCenter = [];
let audioStarted = false;

let toggleBtn;

// preload the audio file
function preload() {
  song = loadSound("loop2.mp3");
}

function setup() {
  createCanvas(600, 600, WEBGL);
  colorMode(HSB);

  fft = new p5.FFT(); // audio analysis

  // Initialize 3D grid
  for (let i = 0; i < num; i++) {
    grid[i] = [];
    for (let j = 0; j < num; j++) {
      grid[i][j] = [];
      for (let k = 0; k < num; k++) {
        grid[i][j][k] = floor(random(2));
        //calculate positionss and distance
        let offset = size / 2 - (num / 2) * size;
        let x = i * size + offset;
        let y = j * size + offset;
        let z = k * size + offset;
        let distance = dist(x, y, z, 0, 0, 0);
        // store the position and distance 
        distFromCenter.push({ i, j, k, distance });
      }
    }
  }

  // Sort spheres by distance from center
  distFromCenter.sort((a, b) => a.distance - b.distance);

  // Create play/pause button
  toggleBtn = createButton("Play / Pause");
  toggleBtn.position(20, 20);
  toggleBtn.mousePressed(toggleAudio);
  toggleBtn.addClass("toggle-btn");
}
// function to toggle audio playback
function toggleAudio() {
  if (song.isPlaying()) {
    song.pause();
    toggleBtn.html("Play");
    audioStarted = false;
  } else {
    userStartAudio().then(() => {
      song.loop();
      toggleBtn.html("Pause");
      audioStarted = true;
    });
  }
}

function draw() {
  background(0);

  // Add lighting for 3D effect
  ambientLight(50); 
  pointLight(255, 255, 255, 0, 0, 300); // 

  orbitControl();

  if (!audioStarted) return;

  // Get audio analysis
  spectrum = fft.analyze();
  let energy = fft.getEnergy(20, 140); 

  // Update grid based on audio
  let totalSpheres = num * num * num;
  for (let i = 0; i < totalSpheres; i++) {
    let pos = distFromCenter[i];
    let c = map(spectrum[i % spectrum.length], 0, 255, min, 255);
    grid[pos.i][pos.j][pos.k] = c;
  }

  // Add dynamic rotation based on audio energy
  rotateY(frameCount * 0.01 + map(energy, 0, 255, 0, 0.1));
  rotateX(frameCount * 0.005 + map(energy, 0, 255, 0, 0.05));

  // Draw spheres
  let offset = size / 2 - (num / 2) * size;
  translate(offset, offset, offset);

  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      for (let k = 0; k < num; k++) {
        if (grid[i][j][k] > min) {
          let hue = map(grid[i][j][k], min, 255, 180, 360) % 360;
          fill(hue, 100, 100, 0.8);
          stroke(hue, 100, 70); // Colored outline matching the sphere color
          strokeWeight(1); // Thin outline

          push();
          translate(i * size, j * size, k * size);

          // Add bouncing effect with beat
          let bounce = map(grid[i][j][k], min, 255, 0.5, 1.5); 
          scale(bounce);

          sphere(size * 0.4); 
          pop();
        }
      }
    }
  }
}