const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let image = new Image();
let isMouseDown = false;
let startX, startY, endX, endY;

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        image.src = e.target.result;
        image.onload = function () {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            offscreenCtx.drawImage(image, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        };
    };
    reader.readAsDataURL(file);
}


function drawSelectionRect() {
    ctx.drawImage(offscreenCanvas, 0, 0);
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
}

function applyPixelation() {
    const width = endX - startX;
    const height = endY - startY;
    const pixelSize = 10;

    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const pixelData = offscreenCtx.getImageData(startX + x, startY + y, pixelSize, pixelSize);
            const avgColor = getAverageColor(pixelData.data);

            offscreenCtx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
            offscreenCtx.fillRect(startX + x, startY + y, pixelSize, pixelSize);
        }
    }

    ctx.drawImage(offscreenCanvas, 0, 0);
}

function getAverageColor(data) {
    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    return { r: r / count, g: g / count, b: b / count };
}

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext('2d');


canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.clientX - canvas.offsetLeft;
    startY = e.clientY - canvas.offsetTop;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    endX = e.clientX - canvas.offsetLeft;
    endY = e.clientY - canvas.offsetTop;
    drawSelectionRect();
});

canvas.addEventListener('mouseup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    endX = e.clientX - canvas.offsetLeft;
    endY = e.clientY - canvas.offsetTop;
    drawSelectionRect();
    applyPixelation();
});

document.getElementById('imageFile').addEventListener('change', (e) => {
    loadImage(e.target.files[0]);
});

document.getElementById('saveButton').addEventListener('click', () => {
    const filename = prompt('Enter the filename:', 'pixelated_image.png');
    if (filename === null || filename.trim() === '') {
        // User pressed cancel or entered an empty filename, so do nothing
        return;
    }

    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 'image/png');
});
