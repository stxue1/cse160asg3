const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Request fullscreen function (cross-browser compatibility)
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) { /* Firefox */
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { /* IE/Edge */
    element.msRequestFullscreen();
  }
}

// Event listener to go fullscreen (e.g., on a button click)
const fullscreenButton = document.getElementById('fullscreenButton');
fullscreenButton.addEventListener('click', () => {
  requestFullscreen(canvas);
});


// Crucial: Get the *actual* canvas dimensions after entering fullscreen
function resizeCanvas() {
    canvas.width = window.innerWidth;  // Or document.documentElement.clientWidth
    canvas.height = window.innerHeight; // Or document.documentElement.clientHeight

    // Redraw or adjust your canvas content as needed after resize.
    // ... your drawing code ...
}

// Event listener for fullscreen change (to handle resizing)
document.addEventListener('fullscreenchange', resizeCanvas);
document.addEventListener('mozfullscreenchange', resizeCanvas);
document.addEventListener('webkitfullscreenchange', resizeCanvas);
document.addEventListener('msfullscreenchange', resizeCanvas);

// Initial canvas setup (before going fullscreen)
resizeCanvas(); // Set initial size

// Mouse move event listener
canvas.addEventListener('mousemove', (event) => {
  // Get mouse position relative to the canvas (important in fullscreen)
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Now 'x' and 'y' are the coordinates within the canvas, even in fullscreen.
  console.log("Mouse position: x =", x, ", y =", y);

  // ... your mouse movement handling logic ...
});

// Example drawing (for demonstration)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    ctx.fillStyle = 'red';
    ctx.fillRect(50, 50, 100, 100);

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(200, 150, 50, 0, 2 * Math.PI);
    ctx.fill();

    requestAnimationFrame(draw); // For smooth animation
}

draw(); // Start the drawing loop (optional, but good practice)


