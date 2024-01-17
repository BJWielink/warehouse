/**
 * Initializes a new canvas to be used as renderer.
 * @param {HTMLCanvasElement} canvasElement - The element that will be used as canvas renderer.
 */
function init(canvasElement) {
    const ctx = canvasElement.getContext('2d');
    
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
}

const canvasElement = document.querySelector('#canvas');
init(canvasElement);
