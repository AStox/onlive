export class Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  map: number[];
  vertex = require("./shaders/vertexShader.glsl");
  fragment = require("./shaders/fragmentShader.glsl");

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.canvas.setAttribute("width", `${width}`);
    this.canvas.setAttribute("height", `${height}`);
    this.gl = this.canvas.getContext("webgl");
    // console.log(this.gl);
  }

  run() {
    const gl = this.gl;
    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.fragment);
    var program = this.createProgram(gl, vertexShader, fragmentShader);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    console.log(colorAttributeLocation);
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const count = 100000;

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.setRectangles(count)), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.setColors(count)), gl.STATIC_DRAW);

    // Draw the rectangles.
    gl.drawArrays(gl.TRIANGLES, 0, count * 6);
  }

  createShader(gl: WebGLRenderingContext, type: number, source: string) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    const canvasToDisplaySizeMap = new Map([[this.canvas, [300, 300]]]);
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const dpr = window.devicePixelRatio;
    const { width, height } = canvas.getBoundingClientRect();
    let displayWidth = Math.round(width * dpr);
    let displayHeight = Math.round(height * dpr);
    // Get the size the browser is displaying the canvas in device pixels.
    [displayWidth, displayHeight] = canvasToDisplaySizeMap.get(canvas);

    // Check if the canvas is not the same size.
    const needResize = canvas.width != displayWidth || canvas.height != displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  }

  // Returns a random integer from 0 to range - 1.
  randomInt(range: number) {
    return Math.floor(Math.random() * range);
  }

  setColors(count: number) {
    const colors = [];
    for (let ii = 0; ii < count; ++ii) {
      const color = Math.random();
      colors.push(color, color, color, 1);
      colors.push(color, color, color, 1);
      colors.push(color, color, color, 1);
      colors.push(color, color, color, 1);
      colors.push(color, color, color, 1);
      colors.push(color, color, color, 1);
    }
    return colors;
  }

  // Fills the buffer with the values that define a rectangle.
  setRectangles(count: number) {
    const vertexArray = [];
    for (let i = 0; i < count; i++) {
      const x = this.randomInt(300);
      const y = this.randomInt(300);
      const width = this.randomInt(300);
      const height = this.randomInt(300);
      var x1 = x;
      var x2 = x + width;
      var y1 = y;
      var y2 = y + height;
      vertexArray.push(x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2);
    }
    return vertexArray;
  }
}
