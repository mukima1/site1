document.addEventListener('DOMContentLoaded', function() {
    // Canvas setup
    const canvas = document.getElementById('doodle-canvas');
    const ctx = canvas.getContext('2d');
    
    // Drawing state
    let isDrawing = false;
    let currentTool = 'pen';
    let currentColor = '#000000';
    let currentSize = 5;
    let currentOpacity = 1;
    let fillShapes = false;
    let startX, startY;
    let textInputActive = false;
    let lastX, lastY; // To track last position for temporary shapes
    
    // Undo/Redo functionality
    let canvasStates = [];
    let currentState = -1;
    
    // Initialize canvas with empty state
    function initializeCanvas() {
        resizeCanvas();
        saveCanvasState(); // This will initialize canvasStates
    }
    
    // Set canvas to full available size
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        canvas.width = container.clientWidth * 0.95;
        canvas.height = container.clientHeight * 0.95;
        
        // Redraw canvas content if there was any
        if (canvasStates.length > 0) {
            redrawCanvas();
        }
    }
    
    function saveCanvasState() {
        // If we're not at the end of the history, remove future states
        if (currentState < canvasStates.length - 1) {
            canvasStates = canvasStates.slice(0, currentState + 1);
        }
        
        // Save current canvas state
        canvasStates.push(canvas.toDataURL());
        currentState++;
        
        // Limit history to 50 states
        if (canvasStates.length > 50) {
            canvasStates.shift();
            currentState--;
        }
        
        // Update undo/redo buttons
        updateUndoRedoButtons();
    }
    
    function updateUndoRedoButtons() {
        document.getElementById('undo-btn').disabled = currentState <= 0;
        document.getElementById('redo-btn').disabled = currentState >= canvasStates.length - 1;
    }
    
    function redrawCanvas() {
        if (currentState >= 0) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = canvasStates[currentState];
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // Tool functions
    function drawPen(x, y) {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    function drawEraser(x, y) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
    }
    
    function drawLine(x, y) {
        // Clear previous temporary line
        redrawCanvas();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Save the last position for temporary drawing
        lastX = x;
        lastY = y;
    }
    
    function drawRectangle(x, y) {
        // Clear previous temporary rectangle
        redrawCanvas();
        ctx.beginPath();
        const width = x - startX;
        const height = y - startY;
        
        if (fillShapes) {
            ctx.fillRect(startX, startY, width, height);
        } else {
            ctx.rect(startX, startY, width, height);
            ctx.stroke();
        }
        
        // Save the last position for temporary drawing
        lastX = x;
        lastY = y;
    }
    
    function drawCircle(x, y) {
        // Clear previous temporary circle
        redrawCanvas();
        ctx.beginPath();
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        if (fillShapes) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
        
        // Save the last position for temporary drawing
        lastX = x;
        lastY = y;
    }
    
    function commitShape() {
        if (['line', 'rectangle', 'circle'].includes(currentTool)) {
            // Redraw the shape permanently
            redrawCanvas();
            ctx.beginPath();
            
            switch (currentTool) {
                case 'line':
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(lastX, lastY);
                    ctx.stroke();
                    break;
                case 'rectangle':
                    const width = lastX - startX;
                    const height = lastY - startY;
                    if (fillShapes) {
                        ctx.fillRect(startX, startY, width, height);
                    } else {
                        ctx.rect(startX, startY, width, height);
                        ctx.stroke();
                    }
                    break;
                case 'circle':
                    const radius = Math.sqrt(Math.pow(lastX - startX, 2) + Math.pow(lastY - startY, 2));
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    if (fillShapes) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;
            }
            
            saveCanvasState();
        }
    }
    
    function addText(x, y) {
        if (textInputActive) return;
        
        textInputActive = true;
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.style.position = 'absolute';
        textInput.style.left = `${x + canvas.offsetLeft}px`;
        textInput.style.top = `${y + canvas.offsetTop}px`;
        textInput.style.border = '1px solid #000';
        textInput.style.padding = '5px';
        textInput.style.fontSize = `${currentSize}px`;
        textInput.style.color = currentColor;
        textInput.style.opacity = currentOpacity;
        
        textInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                ctx.font = `${currentSize}px Arial`;
                ctx.fillStyle = currentColor;
                ctx.globalAlpha = currentOpacity;
                ctx.fillText(textInput.value, x, y);
                ctx.globalAlpha = 1;
                document.body.removeChild(textInput);
                textInputActive = false;
                saveCanvasState();
            } else if (e.key === 'Escape') {
                document.body.removeChild(textInput);
                textInputActive = false;
            }
        });
        
        document.body.appendChild(textInput);
        textInput.focus();
    }
    
    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(
            e.type === 'touchstart' ? 'mousedown' : 'mousemove',
            {
                clientX: touch.clientX,
                clientY: touch.clientY
            }
        );
        
        if (e.type === 'touchstart') {
            startDrawing(mouseEvent);
        } else {
            draw(mouseEvent);
        }
    }
    
    function startDrawing(e) {
        if (textInputActive) return;
        
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        if (currentTool === 'text') {
            addText(startX, startY);
            isDrawing = false;
        } else {
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            ctx.lineWidth = currentSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = currentOpacity;
            
            if (currentTool === 'pen' || currentTool === 'brush') {
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    }
    
    function draw(e) {
        if (!isDrawing || textInputActive) return;
        
        const x = e.offsetX;
        const y = e.offsetY;
        
        switch (currentTool) {
            case 'pen':
            case 'brush':
                drawPen(x, y);
                break;
            case 'eraser':
                drawEraser(x, y);
                break;
            case 'line':
                drawLine(x, y);
                break;
            case 'rectangle':
                drawRectangle(x, y);
                break;
            case 'circle':
                drawCircle(x, y);
                break;
        }
    }
    
    function stopDrawing() {
        if (!isDrawing || textInputActive) return;
        
        isDrawing = false;
        commitShape();
    }
    
    // UI Event Listeners
    document.getElementById('tool-select').addEventListener('change', function(e) {
        currentTool = e.target.value;
    });
    
    document.getElementById('color-picker').addEventListener('input', function(e) {
        currentColor = e.target.value;
        document.getElementById('color-hex').value = currentColor;
    });
    
    document.getElementById('color-hex').addEventListener('input', function(e) {
        const hex = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(hex) || /^#[0-9A-F]{3}$/i.test(hex)) {
            currentColor = hex;
            document.getElementById('color-picker').value = currentColor;
        }
    });
    
    document.getElementById('size-slider').addEventListener('input', function(e) {
        currentSize = e.target.value;
        document.getElementById('size-value').textContent = currentSize;
    });
    
    document.getElementById('opacity-slider').addEventListener('input', function(e) {
        currentOpacity = e.target.value / 100;
        document.getElementById('opacity-value').textContent = `${e.target.value}%`;
    });
    
    document.getElementById('fill-shapes').addEventListener('change', function(e) {
        fillShapes = e.target.checked;
    });
    
    // Color palette
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            currentColor = this.dataset.color;
            document.getElementById('color-picker').value = currentColor;
            document.getElementById('color-hex').value = currentColor;
        });
    });
    
    // Clear canvas
    document.getElementById('clear-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            saveCanvasState();
        }
    });
    
    // Save drawing
    document.getElementById('save-btn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'doodlemaster-drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    
    // Undo/Redo
    document.getElementById('undo-btn').addEventListener('click', function() {
        if (currentState > 0) {
            currentState--;
            redrawCanvas();
            updateUndoRedoButtons();
        }
    });
    
    document.getElementById('redo-btn').addEventListener('click', function() {
        if (currentState < canvasStates.length - 1) {
            currentState++;
            redrawCanvas();
            updateUndoRedoButtons();
        }
    });
    
    // Grid toggle
    document.getElementById('toggle-grid').addEventListener('click', function() {
        const gridOverlay = document.querySelector('.grid-overlay');
        if (!gridOverlay) {
            // Create grid overlay if it doesn't exist
            const overlay = document.createElement('div');
            overlay.className = 'grid-overlay';
            document.querySelector('.canvas-container').appendChild(overlay);
            overlay.style.display = 'block';
        } else {
            gridOverlay.style.display = gridOverlay.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            document.getElementById('undo-btn').click();
        }
        
        // Ctrl+Y for redo
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            document.getElementById('redo-btn').click();
        }
        
        // Ctrl+S for save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('save-btn').click();
        }
    });
    
    // Initialize the app
    initializeCanvas();
    window.addEventListener('resize', resizeCanvas);
});