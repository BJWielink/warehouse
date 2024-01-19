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
     * @returns {?number}
     */
    z() {
        return this.#arr[2];
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

    /**
     * @param {!number} distance
     * @return {!Vector}
     */
    depthProject(distance) {
        return Matrix.depthProjection(distance, this).vecMul(this);
    }

    /**
     * @param {!number} size
     * @return {!Vector}
     */
    scaleAll(size) {
        return Matrix.scale(size, size, size).vecMul(this);
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
     * @param {!number} distance
     * @param {!Vector} vector
     * @return {!Matrix}
     */
    static depthProjection(distance, vector) {
        const z = 1 / (distance - vector.z());

        return new Matrix(
            [z, 0, 0],
            [0, z, 0]
        );
    }

    /**
     * @param {!number} x
     * @param {!number} y
     * @param {!number} z
     * @return {!Matrix}
     */
    static scale(x, y, z) {
        return new Matrix(
            [x, 0, 0],
            [0, y, 0],
            [0, 0, z]
        )
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

class Cube {
    /**
     * @type Array.<Array.<Vector>>
     */
    edges;

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
            new Vector(-size, -size, -size), // Top-left
            new Vector(size, -size, -size),  // Top-right
            new Vector(size, size, -size),   // Bottom-right
            new Vector(-size, size, -size),  // Bottom-left

            new Vector(-size, -size, size),
            new Vector(size, -size, size),
            new Vector(size, size, size),
            new Vector(-size, size, size)
        ];

        this.edges = [
            [this.vertices[0], this.vertices[1]],
            [this.vertices[1], this.vertices[2]],
            [this.vertices[2], this.vertices[3]],
            [this.vertices[3], this.vertices[0]],

            [this.vertices[4], this.vertices[5]],
            [this.vertices[5], this.vertices[6]],
            [this.vertices[6], this.vertices[7]],
            [this.vertices[7], this.vertices[4]],

            [this.vertices[0], this.vertices[4]],
            [this.vertices[1], this.vertices[5]],
            [this.vertices[2], this.vertices[6]],
            [this.vertices[3], this.vertices[7]]
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
     * @type {Cube}
     */
    cube = new Cube(0.5);

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
        this.renderCube();
        requestAnimationFrame((timestamp) => this.render(timestamp));
    }

    /**
     * @param {DOMHighResTimeStamp} delta
     */
    update(delta) {
        const velocity = 0.0007;
        this.cube.roll += delta * velocity;
        this.cube.pitch += delta * velocity;
        this.cube.yaw += delta * velocity;
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

    /**
     * @param {!Vector} vertex
     * @return {!Vector}
     */
    viewProject(vertex) {
        vertex = vertex.depthProject(2);
        vertex= vertex.scaleAll(200);
        vertex = vertex.translate(this.canvasElement.width / 2, this.canvasElement.height / 2);
        return vertex;
    }

    renderCube() {
        // Drawing the vertices
        for (let vertex of this.cube.vertices) {
            vertex = vertex.rotate(this.cube.yaw, this.cube.pitch, this.cube.roll);
            vertex = this.viewProject(vertex);

            this.ctx.fillRect(vertex.x() - 2, vertex.y() - 2, 4, 4);
        }

        // Drawing the edges
        this.ctx.beginPath();
        for (const edge of this.cube.edges) {
            let first = true;
            for (let vertex of edge) {
                vertex = vertex.rotate(this.cube.yaw, this.cube.pitch, this.cube.roll);
                vertex = this.viewProject(vertex);

                if (first === true) {
                    this.ctx.moveTo(vertex.x(), vertex.y());
                } else {
                    this.ctx.lineTo(vertex.x(), vertex.y());
                }
                first = false;
            }
        }
        this.ctx.stroke();
    }
}

const canvasElement = document.querySelector('#canvas');
new Renderer(canvasElement);
