document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let img = new Image();
    let pixelatedImgData;
    let isSelecting = false;
    let selectionStart;
    let selectionEnd;
  
    document.getElementById("imageFile").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        img = new Image();
        img.onload = () => {
          // Set canvas dimensions to match the image dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          pixelatedImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  
    function pixelate(start, end) {
      const pixelSize = 10;
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
  
      ctx.putImageData(pixelatedImgData, 0, 0);
      for (let i = x; i < x + w; i += pixelSize) {
        for (let j = y; j < y + h; j += pixelSize) {
          const color = getAverageColor(i, j, pixelSize, pixelSize);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
          ctx.fillRect(i, j, pixelSize, pixelSize);
        }
      }
  
      pixelatedImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  
    function getAverageColor(x, y, w, h) {
      const data = pixelatedImgData.data;
      let color = { r: 0, g: 0, b: 0, a: 0 };
      let count = 0;
  
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          const index = (i + j * canvas.width) * 4;
          color.r += data[index];
          color.g += data[index + 1];
          color.b += data[index + 2];
          color.a += data[index + 3];
          count++;
        }
      }
      color.r = Math.round(color.r / count);
      color.g = Math.round(color.g / count);
      color.b = Math.round(color.b / count);
      color.a = Math.round(color.a / count);
  
      return color;
    }
  
    canvas.addEventListener("mousedown", (e) => {
      isSelecting = true;
      selectionStart = getMousePos(canvas, e);
    });
  
    canvas.addEventListener("mousemove", (e) => {
      if (isSelecting) {
        selectionEnd = getMousePos(canvas, e);
        ctx.putImageData(pixelatedImgData, 0, 0);
        ctx.strokeStyle = "#00bcd4";
        ctx.lineWidth = 2;
        ctx.setLineDash([6]);
        const rectWidth = Math.abs(selectionEnd.x - selectionStart.x);
        const rectHeight = Math.abs(selectionEnd.y - selectionStart.y);
        const startX = Math.min(selectionStart.x, selectionEnd.x);
        const startY = Math.min(selectionStart.y, selectionEnd.y);
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);
      }
    });
    canvas.addEventListener("mouseup", (e) => {
        if (isSelecting) {
          isSelecting = false;
          selectionEnd = getMousePos(canvas, e);
          pixelate(selectionStart, selectionEnd);
          pixelatedImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      });
    
      function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
        };
      }
    
      document.getElementById("saveButton").addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "pixelated-image.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
