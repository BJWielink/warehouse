class Vector {
    /**
     * @type Array<?number>
     */
    #arr;

    /**
     * @constructor
     * @param {...?number} n
     */
    constructor(...n) {
        this.#arr = n;
    }

    /**
     * @param {!number} n
     * @return {?number}
     */
    get(n) {
        return this.#arr[n];
    }

    /**
     * @returns {?number}
     */
    x() {
        return this.#arr[0];
    }

    /**
     * @returns {?number}
     */
    y() {
        return this.#arr[1];
    }

    /**
     * @param {?number} [x]
     * @param {?number} [y]
     * @param {?number} [z]
     * @return {!Vector}
     */
    translate(x, y, z) {
        return Matrix.translation(x, y, z).vecMul(this);
    }

    /**
     * @param {!number} yaw
     * @param {!number} pitch
     * @param {!number} roll
     * @return {!Vector}
     */
    rotate(yaw, pitch, roll) {
        return Matrix.rotation(yaw, pitch, roll).vecMul(this);
    }
}

class Matrix {
    /**
     * @type Array.<Array.<number>>
     */
    m;

    /**
     * @param {...Array.<number>} m
     */
    constructor(...m) {
        this.m = m;
    }

    /**
     * @param {!Matrix} matrix
     * @return {!Matrix}
     */
    matMul(matrix) {
        let result = [];

        for (let y = 0; y < this.height(); y++) {
            result[y] = [];
            for (let x = 0; x < matrix.width(); x++) {
                result[y][x] = 0;
                for (let k = 0; k < this.width(); k++) {
                    result[y][x] += this.m[y][k] * matrix.m[k][x];
                }
            }
        }

        return new Matrix(...result);
    }

    /**
     * @param {!Vector} vector
     * @returns {!Vector}
     */
    vecMul(vector) {
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
     * @param {!number} yaw
     * @return {Matrix}
     */
    static yaw(yaw) {
        return new Matrix(
            [Math.cos(yaw), -Math.sin(yaw), 0],
            [Math.sin(yaw), Math.cos(yaw), 0],
            [0, 0, 1]
        )
    }

    /**
     * @param {!number} pitch
     * @return {Matrix}
     */
    static pitch(pitch) {
        return new Matrix(
            [Math.cos(pitch), 0, Math.sin(pitch)],
            [0, 1, 0],
            [-Math.sin(pitch), 0, Math.cos(pitch)]
        );
    }

    /**
     * @param {!number} roll
     * @return {Matrix}
     */
    static roll(roll) {
        return new Matrix(
            [1, 0, 0],
            [0, Math.cos(roll), -Math.sin(roll)],
            [0, Math.sin(roll), Math.cos(roll)],
        );
    }

    /**
     * @param {!number} yaw
     * @param {!number} pitch
     * @param {!number} roll
     * @return {!Matrix}
     */
    static rotation(yaw, pitch, roll) {
        const yawMatrix = Matrix.yaw(yaw);
        const pitchMatrix = Matrix.pitch(pitch);
        const rollMatrix = Matrix.roll(roll);
        return rollMatrix.matMul(pitchMatrix.matMul(yawMatrix));
    }

    /**
     * @param {?number} x
     * @param {?number} y
     * @param {?number} z
     * @return {Matrix}
     */
    static translation(x, y, z) {
        return new Matrix(
            [1, 0, 0, x ?? 0],
            [0, 1, 0, y ?? 0],
            [0, 0, 1, z ?? 0],
            [0, 0, 0, 1],
        );
    }

    /**
     * @return {!number}
     */
    width() {
        return this.m[0].length;
    }

    /**
     * @return {!number}
     */
    height() {
        return this.m.length;
    }
}

class Rectangle {
    /**
     * @type Array.<Vector>
     */
    vertices;

    /**
     * @type {!number}
     */
    yaw = 0;

    /**
     * @type {!number}
     */
    pitch = 0;

    /**
     * @type {!number}
     */
    roll = 0;

    /**
     * @param {!number} size
     * @constructor
     */
    constructor(size) {
        this.vertices = [
            new Vector(-size, -size, 0), // Top-left
            new Vector(size, -size, 0),  // Top-right
            new Vector(size, size, 0),   // Bottom-right
            new Vector(-size, size, 0),  // Bottom-left
            new Vector(-size, -size, 0)   // Top-left
        ];
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
     * @type {!number}
     */
    previousTimestamp = -1;

    /**
     * @type {Rectangle}
     */
    rectangle = new Rectangle(50);

    /**
     * @constructor
     * @param {!HTMLCanvasElement} canvasElement
     */
    constructor(canvasElement) {
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        requestAnimationFrame((timestamp) => this.render(timestamp));
    }

    /**
     * @param {!DOMHighResTimeStamp} timestamp
     */
    render(timestamp) {
        const delta = this.getDelta(timestamp);
        if (delta > 0) {
            this.update(delta);
        }
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.renderRectangle();
        requestAnimationFrame((timestamp) => this.render(timestamp));
    }

    /**
     * @param {DOMHighResTimeStamp} delta
     */
    update(delta) {
        const velocity = 0.0007;
        this.rectangle.roll += delta * velocity;
        this.rectangle.pitch += delta * velocity;
        this.rectangle.yaw += delta * velocity;
    }

    /**
     * @param {!DOMHighResTimeStamp} timestamp
     * @return DOMHighResTimeStamp
     */
    getDelta(timestamp) {
        let delta = 0;

        if (this.previousTimestamp !== -1) {
            delta = timestamp - this.previousTimestamp;
        }

        this.previousTimestamp = timestamp;
        return delta;
    }

    renderRectangle() {
        let first = true;
        this.ctx.beginPath();
        for (let vertex of this.rectangle.vertices) {
            vertex = vertex.rotate(this.rectangle.yaw, this.rectangle.pitch, this.rectangle.roll);
            vertex = vertex.translate(this.canvasElement.width / 2, this.canvasElement.height / 2);

            if (first === true) {
                this.ctx.moveTo(vertex.x(), vertex.y());
                first = false;
            } else {
                this.ctx.lineTo(vertex.x(), vertex.y());
            }
        }
        this.ctx.stroke();
    }
}

const canvasElement = document.querySelector('#canvas');
new Renderer(canvasElement);
