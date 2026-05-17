// electromagnetic_induction.js

const canvas = document.getElementById('inductionCanvas');
const ctx = canvas.getContext('2d');
const bulbBrightnessSpan = document.getElementById('bulbBrightness');

let magnet = {
    x: canvas.width / 2, 
    y: canvas.height / 2,
    width: 160,
    height: 60,
    pole: 'N', // 'N' for North, 'S' for South - conceptual
    isDragging: false
};

let coil = {
    x: canvas.width / 2 - 150, 
    y: canvas.height / 2 - 75,
    width: 300,
    height: 150,
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
    ctx.font = '24px Arial';
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
    const bulbRadius = 30;
    const bulbX = coil.x + coil.width / 2;
    const bulbY = coil.y - bulbRadius - 30;

    // Simulate glow based on bulbPower (Draw glow BEFORE bulb so it surrounds it nicely)
    if (coil.bulbPower > 0) {
        const glowIntensity = coil.bulbPower / 100; // 0 to 1
        const maxGlowRadius = bulbRadius + (glowIntensity * 150); // Large glowing aura

        const gradient = ctx.createRadialGradient(bulbX, bulbY, bulbRadius, bulbX, bulbY, maxGlowRadius);
        gradient.addColorStop(0, `rgba(255, 255, 0, ${glowIntensity * 0.9})`); // Bright center
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)'); // Fades out

        ctx.beginPath();
        ctx.arc(bulbX, bulbY, maxGlowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Draw bulb base
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, bulbRadius, 0, Math.PI * 2);
    
    // Bulb glass color changes when lit
    if (coil.bulbPower > 0) {
        const glowIntensity = coil.bulbPower / 100;
        ctx.fillStyle = `rgba(255, 255, ${200 - glowIntensity * 200}, 1)`; // Turn yellow/white
    } else {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.8)'; // Off
    }
    
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw filament (simple cross)
    ctx.beginPath();
    ctx.moveTo(bulbX - bulbRadius / 2, bulbY);
    ctx.lineTo(bulbX + bulbRadius / 2, bulbY);
    ctx.moveTo(bulbX, bulbY - bulbRadius / 2);
    ctx.lineTo(bulbX, bulbY + bulbRadius / 2);
    
    // Filament brightens
    ctx.strokeStyle = coil.bulbPower > 10 ? '#fff' : '#888';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCoil();
    drawBulb();
    drawMagnet();
    calculateMagneticFluxChange();
    requestAnimationFrame(animate);
}

// Mouse and Touch events for dragging the magnet
function startDrag(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // 実際のキャンバスのサイズと画面上の表示サイズの比率（X軸）
    const scaleY = canvas.height / rect.height;  // 実際のキャンバスのサイズと画面上の表示サイズの比率（Y軸）

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (
        x > magnet.x - magnet.width / 2 &&
        x < magnet.x + magnet.width / 2 &&
        y > magnet.y - magnet.height / 2 &&
        y < magnet.y + magnet.height / 2
    ) {
        magnet.isDragging = true;
    }
}

function moveDrag(clientX, clientY) {
    if (magnet.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        magnet.x = (clientX - rect.left) * scaleX;
        magnet.y = (clientY - rect.top) * scaleY;
    }
}

function stopDrag() {
    magnet.isDragging = false;
    fluxChange = 0; // Reset flux change when magnet is released
    coil.bulbPower = 0; // Turn off bulb
}

// Mouse events
canvas.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
canvas.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseleave', stopDrag);

// Touch events (for smartphones/tablets)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    moveDrag(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

canvas.addEventListener('touchend', stopDrag);

animate();