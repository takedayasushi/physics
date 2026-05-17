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

function drawParabola(v0, angleRad, g) {
    const scale = 5; // 1m = 5 pixels
    const dt = 0.1;  // time step

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    let x = 0;
    let y = 0;
    let t = 0;

    // Origin at bottom-left for physics simulation
    const originX = 0;
    const originY = canvas.height;

    ctx.moveTo(originX, originY);

    while (y >= 0) {
        x = v0 * Math.cos(angleRad) * t;
        y = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;

        // Draw only if within canvas bounds and y is not negative (below ground)
        if (x * scale <= canvas.width && y * scale >= 0) {
            ctx.lineTo(originX + x * scale, originY - y * scale); // Invert y-axis for canvas
        }
        t += dt;
    }
    ctx.stroke();
}

function calculateAndDisplayResults(v0, angleRad, g) {
    const flightTime = (2 * v0 * Math.sin(angleRad)) / g;
    const range = v0 * Math.cos(angleRad) * flightTime;
    const maxHeight = (v0 * v0 * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * g);

    rangeSpan.textContent = range.toFixed(2);
    maxHeightSpan.textContent = maxHeight.toFixed(2);
    flightTimeSpan.textContent = flightTime.toFixed(2);
}

function startSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    const v0 = parseFloat(initialVelocityInput.value);
    const angleDeg = parseFloat(angleInput.value);
    const g = parseFloat(gravityInput.value);

    if (isNaN(v0) || isNaN(angleDeg) || isNaN(g) || v0 < 0 || g <= 0) {
        alert('有効な数値を入力してください。初速度は0以上、重力加速度は0より大きい値にしてください。');
        return;
    }

    const angleRad = angleDeg * (Math.PI / 180);

    // Initial draw and calculation
    drawParabola(v0, angleRad, g);
    calculateAndDisplayResults(v0, angleRad, g);

    // No real-time animation for now, just static draw
    // If real-time animation is needed, a separate animate function would be called here.
}

function resetSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rangeSpan.textContent = '0';
    maxHeightSpan.textContent = '0';
    flightTimeSpan.textContent = '0';
    // Reset input values to default or clear them
    initialVelocityInput.value = '50';
    angleInput.value = '45';
    gravityInput.value = '9.8';
}

startButton.addEventListener('click', startSimulation);
resetButton.addEventListener('click', resetSimulation);

// Initial setup
resetSimulation();