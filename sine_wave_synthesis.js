const amp1Slider = document.getElementById('amp1');
const freq1Slider = document.getElementById('freq1');
const phase1Slider = document.getElementById('phase1');
const amp2Slider = document.getElementById('amp2');
const freq2Slider = document.getElementById('freq2');
const phase2Slider = document.getElementById('phase2');

const amp1Value = document.getElementById('amp1-value');
const freq1Value = document.getElementById('freq1-value');
const phase1Value = document.getElementById('phase1-value');
const amp2Value = document.getElementById('amp2-value');
const freq2Value = document.getElementById('freq2-value');
const phase2Value = document.getElementById('phase2-value');

const canvas = document.getElementById('wave-canvas');
const ctx = canvas.getContext('2d');
const beatPhenomenonDiv = document.getElementById('beat-phenomenon');
const showBeatAnimationButton = document.getElementById('show-beat-animation');

function draw() {
    // Update canvas drawing buffer size to match its display size
    canvas.width = canvas.clientWidth;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // Get values from sliders
    const amp1 = parseFloat(amp1Slider.value);
    const freq1 = parseFloat(freq1Slider.value);
    const phase1 = parseFloat(phase1Slider.value) * (Math.PI / 180);
    const amp2 = parseFloat(amp2Slider.value);
    const freq2 = parseFloat(freq2Slider.value);
    const phase2 = parseFloat(phase2Slider.value) * (Math.PI / 180);

    // Update display values
    amp1Value.textContent = amp1.toFixed(0);
    freq1Value.textContent = freq1.toFixed(1);
    phase1Value.textContent = `${phase1Slider.value}°`;
    amp2Value.textContent = amp2.toFixed(0);
    freq2Value.textContent = freq2.toFixed(1);
    phase2Value.textContent = `${phase2Slider.value}°`;

    // Draw Wave 1
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.moveTo(0, midY);
    for (let x = 0; x < width; x++) {
        const angle = (x / width) * 2 * Math.PI * freq1 + phase1;
        const y = midY - amp1 * Math.sin(angle);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Wave 2
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.moveTo(0, midY);
    for (let x = 0; x < width; x++) {
        const angle = (x / width) * 2 * Math.PI * freq2 + phase2;
        const y = midY - amp2 * Math.sin(angle);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Combined Wave
    ctx.beginPath();
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 3;
    ctx.moveTo(0, midY);
    for (let x = 0; x < width; x++) {
        const angle1 = (x / width) * 2 * Math.PI * freq1 + phase1;
        const y1 = amp1 * Math.sin(angle1);
        const angle2 = (x / width) * 2 * Math.PI * freq2 + phase2;
        const y2 = amp2 * Math.sin(angle2);
        const combinedY = midY - (y1 + y2);
        ctx.lineTo(x, combinedY);
    }
    ctx.stroke();
    
    requestAnimationFrame(draw);
}

let isBeatAnimationRunning = false;
let beatAnimationId;

// Add event listeners to all sliders
[amp1Slider, freq1Slider, phase1Slider, amp2Slider, freq2Slider, phase2Slider].forEach(slider => {
    slider.addEventListener('input', () => {
        // Stop the beat animation if user interacts with sliders
        if (isBeatAnimationRunning) {
            cancelAnimationFrame(beatAnimationId);
            isBeatAnimationRunning = false;
            showBeatAnimationButton.textContent = '「うなり」をアニメーションで見てみよう';
        }
    });
});

showBeatAnimationButton.addEventListener('click', () => {
    if (isBeatAnimationRunning) {
        // Stop the animation
        cancelAnimationFrame(beatAnimationId);
        isBeatAnimationRunning = false;
        showBeatAnimationButton.textContent = '「うなり」をアニメーションで見てみよう';
    } else {
        // Start the animation
        isBeatAnimationRunning = true;
        showBeatAnimationButton.textContent = 'アニメーションを停止';
        beatPhenomenonDiv.style.display = 'block';

        // Set parameters for a clear beat visualization
        amp1Slider.value = 50;
        freq1Slider.value = 4.0;
        amp2Slider.value = 50;
        freq2Slider.value = 4.2;

        // Animate the phase shift to represent time passing
        let startTime = Date.now();
        const animateBeat = () => {
            let elapsedTime = (Date.now() - startTime) * 0.1; // Control speed
            phase1Slider.value = elapsedTime % 360;
            phase2Slider.value = elapsedTime % 360;
            if (isBeatAnimationRunning) {
                beatAnimationId = requestAnimationFrame(animateBeat);
            }
        };
        animateBeat();
    }
});

// Initial draw
draw();
