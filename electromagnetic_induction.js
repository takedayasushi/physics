// electromagnetic_induction.js

const canvas = document.getElementById('inductionCanvas');
const ctx = canvas.getContext('2d');
const bulbBrightnessSpan = document.getElementById('bulbBrightness');

let magnet = {
    x: canvas.width / 2, 
    y: canvas.height / 2,
    width: 80,
    height: 30,
    pole: 'N', // 'N' for North, 'S' for South - conceptual
    isDragging: false
};

let coil = {
    x: canvas.width / 2 - 100, 
    y: canvas.height / 2 - 50,
    width: 200,
    height: 100,
    turns: 10,
    wireColor: '#663300',
    bulbPower: 0 // 0-100, simulates brightness
};

let prevMagnetX = magnet.x;
let prevMagnetY = magnet.y;
let fluxChange = 0;
const MAX_FLUX_CHANGE = 20; // Max value for flux change for full brightness

function drawCoil() {
    ctx.beginPath();
    ctx.rect(coil.x, coil.y, coil.width, coil.height);
    ctx.strokeStyle = coil.wireColor;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw multiple turns (simplified)
    for (let i = 1; i <= coil.turns; i++) {
        ctx.beginPath();
        ctx.moveTo(coil.x, coil.y + (i * coil.height / (coil.turns + 1)));
        ctx.lineTo(coil.x + coil.width, coil.y + (i * coil.height / (coil.turns + 1)));
        ctx.stroke();
    }
}

function drawMagnet() {
    ctx.fillStyle = 'red'; // North pole
    ctx.fillRect(magnet.x - magnet.width / 2, magnet.y - magnet.height / 2, magnet.width / 2, magnet.height);
    ctx.fillStyle = 'blue'; // South pole
    ctx.fillRect(magnet.x, magnet.y - magnet.height / 2, magnet.width / 2, magnet.height);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(magnet.x - magnet.width / 2, magnet.y - magnet.height / 2, magnet.width, magnet.height);

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', magnet.x - magnet.width / 4, magnet.y);
    ctx.fillText('S', magnet.x + magnet.width / 4, magnet.y);
}

function calculateMagneticFluxChange() {
    // Simplified model: Flux change is proportional to the magnet's velocity near the coil
    const dx = magnet.x - prevMagnetX;
    const dy = magnet.y - prevMagnetY;
    const distance = Math.sqrt(dx * dx + dy * dy); // Magnet speed

    // Check if magnet is near or inside the coil
    const coilCenterX = coil.x + coil.width / 2;
    const coilCenterY = coil.y + coil.height / 2;
    const distToCoilCenter = Math.sqrt(Math.pow(magnet.x - coilCenterX, 2) + Math.pow(magnet.y - coilCenterY, 2));
    const effectiveRadius = Math.max(coil.width, coil.height) / 2 + magnet.width / 2; // Approximation

    if (distToCoilCenter < effectiveRadius) {
        // The closer and faster, the greater the flux change
        fluxChange = distance * (1 - (distToCoilCenter / effectiveRadius));
        fluxChange = Math.min(fluxChange, MAX_FLUX_CHANGE); // Cap flux change
    } else {
        fluxChange = 0;
    }

    // Update bulb brightness based on absolute flux change
    coil.bulbPower = Math.min(100, (fluxChange / MAX_FLUX_CHANGE) * 100);
    bulbBrightnessSpan.textContent = `${Math.round(coil.bulbPower)}%`;

    prevMagnetX = magnet.x;
    prevMagnetY = magnet.y;
}

function drawBulb() {
    const bulbRadius = 15;
    const bulbX = coil.x + coil.width / 2;
    const bulbY = coil.y - bulbRadius - 20;

    // Draw bulb base
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, bulbRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'lightgray';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw filament (simple cross)
    ctx.beginPath();
    ctx.moveTo(bulbX - bulbRadius / 2, bulbY);
    ctx.lineTo(bulbX + bulbRadius / 2, bulbY);
    ctx.moveTo(bulbX, bulbY - bulbRadius / 2);
    ctx.lineTo(bulbX, bulbY + bulbRadius / 2);
    ctx.strokeStyle = 'gray';
    ctx.stroke();

    // Simulate glow based on bulbPower
    if (coil.bulbPower > 0) {
        const glowIntensity = coil.bulbPower / 100; // 0 to 1
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, bulbRadius + (glowIntensity * 5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 0, ${glowIntensity * 0.5})`; // Yellow glow
        ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCoil();
    drawBulb();
    drawMagnet();
    calculateMagneticFluxChange();
    requestAnimationFrame(animate);
}

// Mouse events for dragging the magnet
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        mouseX > magnet.x - magnet.width / 2 &&
        mouseX < magnet.x + magnet.width / 2 &&
        mouseY > magnet.y - magnet.height / 2 &&
        mouseY < magnet.y + magnet.height / 2
    ) {
        magnet.isDragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (magnet.isDragging) {
        const rect = canvas.getBoundingClientRect();
        magnet.x = e.clientX - rect.left;
        magnet.y = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', () => {
    magnet.isDragging = false;
    fluxChange = 0; // Reset flux change when magnet is released
    coil.bulbPower = 0; // Turn off bulb
});

canvas.addEventListener('mouseleave', () => {
    magnet.isDragging = false;
    fluxChange = 0; // Reset flux change when magnet leaves canvas
    coil.bulbPower = 0; // Turn off bulb
});

animate();