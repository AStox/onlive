import { TerrainMap } from "./map";
import config from "./config.json";
import { Recorder } from "./recorder";

export class Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  map: TerrainMap;
  vertex = require("./shaders/vertexShader.glsl");
  noiseFragment = require("./shaders/noiseFragment.glsl");
  flowFragment = require("./shaders/flowFragment.glsl");
  flowStartFragment = require("./shaders/flowStartFragment.glsl");
  paintNoiseFragment = require("./shaders/paintNoiseFragment.glsl");
  debugFragment = require("./shaders/debugFragment.glsl");
  iteration = 0;
  flowResolution = 50;

  constructor(width: number, height: number, map: TerrainMap) {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.canvas.setAttribute("width", `${width}`);
    this.canvas.setAttribute("height", `${height}`);
    this.gl = this.canvas.getContext("webgl2");
    this.map = map;
  }

  run() {
    // new Recorder(this.canvas).record();
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const fbo = gl.createFramebuffer();
    let noise: WebGLTexture = null;
    let flow: WebGLTexture = null;
    let alteredNoise: WebGLTexture = null;
    noise = this.renderNoise();

    const randomX = Math.random() * gl.canvas.width;
    const randomY = Math.random() * gl.canvas.height;
    this.erode(noise, flow, alteredNoise, randomX, randomY);
  }

  renderNoise() {
    const gl = this.gl;

    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.noiseFragment);

    var program = this.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    this.setupVertexShader(gl, program);

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Render to a framebuffer
    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    const noiseTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.canvas.width,
      gl.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, noiseTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    console.log("draw noise");

    let pixels = new Uint8Array(4 * gl.canvas.width * gl.canvas.height);
    gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log("NOISE TEXTURE:", pixels);

    return noiseTexture;
  }

  renderFlowStart() {
    // renders the initial state for each droplet
    const gl = this.gl;
    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.flowStartFragment);

    var program = this.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    this.setupVertexShader(gl, program);

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, this.flowResolution, this.flowResolution);

    var granularityUniformLocation = gl.getUniformLocation(program, "u_granularity");
    gl.uniform1f(granularityUniformLocation, gl.canvas.width);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    const renderTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.canvas.width,
      gl.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.viewport(0, 0, this.flowResolution, this.flowResolution);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return renderTexture;
  }

  renderFlow(noise: WebGLTexture, flow: WebGLTexture) {
    const gl = this.gl;
    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.flowFragment);

    var program = this.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    this.setupVertexShader(gl, program);

    // var randomPosUniformLocation = gl.getUniformLocation(program, "randomPos");
    // gl.uniform2f(randomPosUniformLocation, randomX, randomY);

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    var mapSizeUniformLocation = gl.getUniformLocation(program, "mapSize");
    gl.uniform2f(mapSizeUniformLocation, this.map.width, this.map.height);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noise);

    const noiseLocation = gl.getUniformLocation(program, "noiseTexture");
    gl.uniform1i(noiseLocation, 0);

    console.log("using existing flow texture");
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, flow);

    const flowLocation = gl.getUniformLocation(program, "flowTexture");
    gl.uniform1i(flowLocation, 1);

    let renderTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.canvas.width,
      gl.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return renderTexture;
  }

  renderPaintedNoise(
    noise: WebGLTexture | null,
    flow: WebGLTexture | null,
    alteredNoiseTexture: WebGLTexture | null
  ) {
    const gl = this.gl;
    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.paintNoiseFragment);
    var program = this.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    this.setupVertexShader(gl, program);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noise);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    const noiseLocation = gl.getUniformLocation(program, "noiseTexture");
    gl.uniform1i(noiseLocation, 0);

    const flowResolutionLocation = gl.getUniformLocation(program, "u_flowResolution");
    gl.uniform2f(flowResolutionLocation, this.flowResolution, this.flowResolution);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, flow);

    const flowLocation = gl.getUniformLocation(program, "flowTexture");
    gl.uniform1i(flowLocation, 1);

    if (alteredNoiseTexture === null) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, noise);
    } else {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, alteredNoiseTexture);
    }
    const alteredNoiseLocation = gl.getUniformLocation(program, "alteredNoiseTexture");
    gl.uniform1i(alteredNoiseLocation, 2);

    const renderTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.canvas.width,
      gl.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return renderTexture;
  }

  renderDebug(flow: WebGLTexture) {
    const gl = this.gl;
    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.debugFragment);
    var program = this.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    this.setupVertexShader(gl, program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, flow);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const textureLocation = gl.getUniformLocation(program, "u_texture");
    gl.uniform1i(textureLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // let pixels = new Uint8Array(4 * gl.canvas.width * gl.canvas.height);
    // gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // console.log("NOISE TEXTURE:", pixels);
  }

  erode(
    noise: WebGLTexture,
    flow: WebGLTexture,
    alteredNoise: WebGLTexture,
    randomX: number,
    randomY: number
  ) {
    // noise = this.renderNoise();
    // let newFlow: WebGLTexture | null;
    // let newAlteredNoiseTexture: WebGLTexture | null;
    if (this.iteration >= 20) {
      return;
    }
    if (this.iteration == 0) {
      console.log("Render flow start");
      flow = this.renderFlowStart();
    }
    const newFlow = this.renderFlow(noise, flow);
    const newAlteredNoiseTexture = this.renderPaintedNoise(noise, newFlow, alteredNoise);
    this.renderDebug(newAlteredNoiseTexture);

    requestAnimationFrame(() =>
      setTimeout(() => this.erode(noise, newFlow, newAlteredNoiseTexture, -1, -1), 1000 / 24)
    );
    this.iteration++;
  }

  setupVertexShader(gl: WebGLRenderingContext, program: WebGLProgram) {
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    let vertexArray = this.setRectangle(0, 0, this.canvas.width, this.canvas.height);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
  }

  // Save the pixels to a 1D array.
  savePixels(gl: WebGLRenderingContext): Uint8Array {
    const buffer = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
    gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);

    return buffer;
  }

  createShader(gl: WebGLRenderingContext, type: number, source: string) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      // console.log("compiled shader");
      return shader;
    } else {
      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }

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
    } else {
      console.log(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }

    gl.deleteProgram(program);
  }

  resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    const canvasToDisplaySizeMap = new Map([[this.canvas, [0, 0]]]);
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

  setColor(colors: number[], r: number, g: number, b: number, a: number) {
    // do six times (2 triangles per rect)
    colors.push(r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a);
  }

  setRectangle(x: number, y: number, width: number, height: number) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    return [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
  }
}

function printUniform(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
  // Get the location of the uniform variable in the shader
  var location = gl.getUniformLocation(program, name);

  // Get the value of the uniform variable
  var value = gl.getUniform(program, location);

  // Print the value to the browser console
  console.log(name + " = " + value);
}

function printAttribute(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
  // Get the location of the uniform variable in the shader
  var location = gl.getAttribLocation(program, name);

  // Get the value of the uniform variable
  var value = gl.getActiveAttrib(program, location);

  // Print the value to the browser console
  console.log(name + " = " + value);
}
