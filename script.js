document.getElementById('createPuzzleButton').addEventListener('click', function() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function() {
        const img = new Image();
        img.src = reader.result;

        img.onload = function() {
            createJigsawPuzzle(img);
        };
    };
    reader.readAsDataURL(file);
});

function createJigsawPuzzle(image) {
    const puzzleContainer = document.getElementById('puzzleContainer');
    puzzleContainer.innerHTML = ''; // Clear previous puzzles

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const pieceSize = 100; // Size of puzzle pieces
    const rows = Math.ceil(image.height / pieceSize);
    const cols = Math.ceil(image.width / pieceSize);
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);

    const pieces = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceSize;
            pieceCanvas.height = pieceSize;
            const pieceCtx = pieceCanvas.getContext('2d');
            pieceCtx.drawImage(canvas, col * pieceSize, row * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);

            // Position each piece
            pieceCanvas.style.position = 'absolute';
            pieceCanvas.style.left = `${col * pieceSize}px`;
            pieceCanvas.style.top = `${row * pieceSize}px`;
            pieceCanvas.style.border = '1px solid #ccc';
            pieceCanvas.style.cursor = 'move';
            pieceCanvas.draggable = true;
            pieceCanvas.dataset.x = col * pieceSize;
            pieceCanvas.dataset.y = row * pieceSize;

            pieceCanvas.addEventListener('dragstart', handleDragStart);
            pieceCanvas.addEventListener('dragend', handleDragEnd);
            puzzleContainer.appendChild(pieceCanvas);
            pieces.push(pieceCanvas);
        }
    }

    // Handle drag events
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.x + ',' + e.target.dataset.y);
        e.dataTransfer.setData('piece', e.target.toDataURL());
    }

    function handleDragEnd(e) {
        e.target.style.zIndex = 'auto'; // Reset z-index after drag ends
    }

    puzzleContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    puzzleContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        const pieceData = e.dataTransfer.getData('piece');
        const [left, top] = e.dataTransfer.getData('text/plain').split(',').map(Number);
        const pieceCanvas = document.createElement('canvas');
        const pieceCtx = pieceCanvas.getContext('2d');
        pieceCanvas.width = 100;
        pieceCanvas.height = 100;
        const img = new Image();
        img.src = pieceData;
        img.onload = function() {
            pieceCtx.drawImage(img, 0, 0);
            const x = e.clientX - pieceCanvas.width / 2;
            const y = e.clientY - pieceCanvas.height / 2;
            const piece = document.elementFromPoint(e.clientX, e.clientY);

            if (piece && piece.tagName === 'CANVAS') {
                piece.style.left = `${x}px`;
                piece.style.top = `${y}px`;
                piece.style.zIndex = '1000'; // Bring piece to the front
            }
        };
    });

    // Prepare the download link
    const downloadButton = document.getElementById('downloadPuzzleButton');
    downloadButton.style.display = 'inline-block';
    downloadButton.href = canvas.toDataURL('image/png');
}
