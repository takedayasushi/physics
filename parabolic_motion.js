const initialVelocityInput = document.getElementById('initial_velocity');
const angleInput = document.getElementById('angle');
const gravityInput = document.getElementById('gravity');
const startButton = document.getElementById('start_simulation');
const resetButton = document.getElementById('reset_simulation');
const rangeSpan = document.getElementById('range');
const maxHeightSpan = document.getElementById('max_height');
const flightTimeSpan = document.getElementById('flight_time');
const canvas = document.getElementById('simulation_canvas');
const ctx = canvas.getContext('2d');

let animationFrameId;
let startTime;

function getScale(range) {
    // Calculate scale to fit the entire trajectory within the canvas width
    // Add a small margin (e.g., 20 pixels)
    const margin = 20;
    if (range > 0 && (range * 5) > (canvas.width - margin)) {
        return (canvas.width - margin) / range;
    }
    return 5; // Default scale if trajectory is small
}

function animate(v0, angleRad, g, start, scale) {
    const originX = 0;
    const originY = canvas.height;

    let currentTime = (Date.now() - start) / 1000; // time in seconds

    // Calculate current position
    let x = v0 * Math.cos(angleRad) * currentTime;
    let y = v0 * Math.sin(angleRad) * currentTime - 0.5 * g * currentTime * currentTime;

    // Clear canvas for this frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the trajectory up to the current point
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.moveTo(originX, originY);
    for (let t = 0; t <= currentTime; t += 0.01) {
        let pathX = v0 * Math.cos(angleRad) * t;
        let pathY = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;
        ctx.lineTo(originX + pathX * scale, originY - pathY * scale);
    }
    ctx.stroke();

    // Draw the projectile
    ctx.beginPath();
    ctx.arc(originX + x * scale, originY - y * scale, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();

    // Continue animation if projectile is still in the air
    if (y >= 0) {
        animationFrameId = requestAnimationFrame(() => animate(v0, angleRad, g, start, scale));
    } else {
        // Animation finished, draw the full static parabola for clarity
        drawFullParabola(v0, angleRad, g, scale);
    }
}

function drawFullParabola(v0, angleRad, g, scale) {
    const dt = 0.01;
    const originX = 0;
    const originY = canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.moveTo(originX, originY);

    let x, y;
    let t = 0;
    do {
        x = v0 * Math.cos(angleRad) * t;
        y = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;
        ctx.lineTo(originX + x * scale, originY - y * scale);
        t += dt;
    } while (y >= 0);
    ctx.stroke();
}


function calculateAndDisplayResults(v0, angleRad, g) {
    const flightTime = (2 * v0 * Math.sin(angleRad)) / g;
    const range = v0 * Math.cos(angleRad) * flightTime;
    const maxHeight = (v0 * v0 * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * g);

    rangeSpan.textContent = range.toFixed(2);
    maxHeightSpan.textContent = maxHeight.toFixed(2);
    flightTimeSpan.textContent = flightTime.toFixed(2);

    return { range }; // Return range for scaling
}

function startSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // Update canvas drawing buffer size to match its display size
    canvas.width = canvas.clientWidth;

    const v0 = parseFloat(initialVelocityInput.value);
    const angleDeg = parseFloat(angleInput.value);
    const g = parseFloat(gravityInput.value);

    if (isNaN(v0) || isNaN(angleDeg) || isNaN(g) || v0 < 0 || g <= 0) {
        alert('有効な数値を入力してください。初速度は0以上、重力加速度は0より大きい値にしてください。');
        return;
    }

    const angleRad = angleDeg * (Math.PI / 180);

    // Calculate and display final results immediately
    const { range } = calculateAndDisplayResults(v0, angleRad, g);
    
    // Get the dynamic scale
    const scale = getScale(range);

    // Start the animation
    startTime = Date.now();
    animate(v0, angleRad, g, startTime, scale);
}

function resetSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rangeSpan.textContent = '0';
    maxHeightSpan.textContent = '0';
    flightTimeSpan.textContent = '0';
    // Reset input values to default
    initialVelocityInput.value = '50';
    angleInput.value = '45';
    gravityInput.value = '9.8';
}

startButton.addEventListener('click', startSimulation);
resetButton.addEventListener('click', resetSimulation);

// Initial setup
resetSimulation();