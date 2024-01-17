class Vector {
    /**
     * @type Number[]
     */
    #arr;

    /**
     * @constructor
     * @param {...Number} n
     */
    constructor(...n) {
        this.#arr = n;
    }

    /**
     * @param {Number} n
     * @return {Number}
     */
    get(n) {
        return this.#arr[n];
    }

    /**
     * @returns {?Number}
     */
    x() {
        return this.#arr[0];
    }

    /**
     * @returns {?Number}
     */
    y() {
        return this.#arr[1];
    }
}

class Matrix {
    /**
     * @type Array.<Array.<Number>>
     */
    m;

    /**
     * @param {...Array.<Number>} m
     */
    constructor(...m) {
        this.m = m;
    }

    /**
     * @param {Vector} vector
     * @returns {Vector}
     */
    multiply(vector) {
        let result = [];
        for (let y = 0; y < this.height(); y++) {
            let sum = 0;
            for (let x = 0; x < this.width(); x++) {
                sum += (vector.get(x) ?? 1) * this.m[y][x];
            }
            result.push(sum);
        }
        return new Vector(...result);
    }

    /**
     * @return {number}
     */
    width() {
        return this.m[0].length;
    }

    /**
     * @return {number}
     */
    height() {
        return this.m.length;
    }
}

class Renderer {
    /**
     * @type {!CanvasRenderingContext2D}
     */
    ctx;

    /**
     * @type {!HTMLCanvasElement}
     */
    canvasElement;

    /**
     * @constructor
     * @param {!HTMLCanvasElement} canvasElement
     */
    constructor(canvasElement) {
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.render();
    }

    render() {
        this.renderDots();
    }

    renderDots() {
        const dots = [
            new Vector(-50, -50, 0), // Top-left
            new Vector(50, -50, 0),  // Top-right
            new Vector(-50, 50, 0),  // Bottom-left
            new Vector(50, 50, 0)    // Bottom-right
        ];

        const translationMatrix = new Matrix(
            [1, 0, 0, this.canvasElement.width / 2],
            [0, 1, 0, this.canvasElement.height / 2],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        );

        for (let dot of dots) {
            dot = translationMatrix.multiply(dot);
            this.ctx.fillRect(dot.x() - 2, dot.y() - 2, 4, 4);
        }
    }
}

const canvasElement = document.querySelector('#canvas');
new Renderer(canvasElement);
