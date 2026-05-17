// correlation.js

const canvas = document.getElementById('correlationCanvas');
const ctx = canvas.getContext('2d');
const correlationCoefficientSpan = document.getElementById('correlationCoefficient');
const resetButton = document.getElementById('resetButton');

let points = [];
const pointRadius = 15; // 大きめの点にしてモバイル対応
const numPoints = 15; // 10-15個のデータポイント
let draggedPoint = null;

// 初期データポイントの生成
function initializePoints() {
    points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }
}

// 描画関数
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 回帰直線の描画
    if (points.length > 1) {
        const { a, b, r } = calculateRegressionAndCorrelation(points);
        correlationCoefficientSpan.textContent = r.toFixed(2);

        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        // x = 0 から x = canvas.width までの線を描画
        ctx.moveTo(0, a * 0 + b);
        ctx.lineTo(canvas.width, a * canvas.width + b);
        ctx.stroke();
    }

    // データポイントの描画
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = draggedPoint === point ? 'red' : 'green';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.stroke();
    });
}

// 相関係数と回帰直線を計算する関数
function calculateRegressionAndCorrelation(data) {
    const n = data.length;
    if (n < 2) return { a: 0, b: 0, r: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

    for (let i = 0; i < n; i++) {
        sumX += data[i].x;
        sumY += data[i].y;
        sumXY += data[i].x * data[i].y;
        sumXX += data[i].x * data[i].x;
        sumYY += data[i].y * data[i].y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    const numeratorA = (n * sumXY - sumX * sumY);
    const denominatorA = (n * sumXX - sumX * sumX);
    
    const a = denominatorA === 0 ? 0 : numeratorA / denominatorA; // 回帰直線の傾き
    const b = meanY - a * meanX; // 回帰直線の切片

    const numeratorR = (n * sumXY - sumX * sumY);
    const denominatorR = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    const r = denominatorR === 0 ? 0 : numeratorR / denominatorR; // 相関係数

    return { a, b, r };
}

// イベントハンドラ
function getEventPos(event) {
    const rect = canvas.getBoundingClientRect();
    // タッチイベントとマウスイベントの対応
    if (event.touches && event.touches.length > 0) {
        return {
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top
        };
    } else {
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}

function onPointerDown(event) {
    event.preventDefault();
    const pos = getEventPos(event);
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dist = Math.sqrt(Math.pow(pos.x - p.x, 2) + Math.pow(pos.y - p.y, 2));
        if (dist < pointRadius) {
            draggedPoint = p;
            break;
        }
    }
}

function onPointerMove(event) {
    event.preventDefault();
    if (draggedPoint) {
        const pos = getEventPos(event);
        draggedPoint.x = pos.x;
        draggedPoint.y = pos.y;
        draw();
    }
}

function onPointerUp(event) {
    event.preventDefault();
    draggedPoint = null;
    draw();
}

// イベントリスナーの追加 (マウスとタッチの両方に対応)
canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('mouseleave', onPointerUp); // マウスがキャンバス外に出た場合

canvas.addEventListener('touchstart', onPointerDown, { passive: false });
canvas.addEventListener('touchmove', onPointerMove, { passive: false });
canvas.addEventListener('touchend', onPointerUp, { passive: false });
canvas.addEventListener('touchcancel', onPointerUp, { passive: false });

resetButton.addEventListener('click', () => {
    initializePoints();
    draw();
});

initializePoints();
draw();
