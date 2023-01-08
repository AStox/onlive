import { TerrainMap } from "./map";
import config from "./config.json";

export class Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  map: TerrainMap;
  vertex = require("./shaders/vertexShader.glsl");
  fragment = require("./shaders/fragmentShader.glsl");
  erosionFragment = require("./shaders/erosionFragment.glsl");

  constructor(width: number, height: number, map: TerrainMap) {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.canvas.setAttribute("width", `${width}`);
    this.canvas.setAttribute("height", `${height}`);
    this.gl = this.canvas.getContext("webgl");
    this.map = map;
  }

  run() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let noise = this.drawNoise();

    const randomX = Math.random() * gl.canvas.width;
    const randomY = Math.random() * gl.canvas.height;

    let flow: WebGLTexture = null;
    let i = 0;
    // for (let i = 0; i < 2; i++) {
    flow = this.erode(noise, flow, randomX, randomY);
    let interval = setInterval(() => {
      if (i === 100) {
        clearInterval(interval);
      }
      flow = this.erode(noise, flow, -1.0, -1.0);
      // flow = this.erode(noise, flow, i === 0 ? randomX : -1.0, i === 0 ? randomY : -1.0);
      i++;
    }, 100);
  }

  drawNoise() {
    const gl = this.gl;

    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.fragment);

    var program = this.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    let vertexArray = this.setRectangle(0, 0, this.canvas.width, this.canvas.height);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

    // Render to a framebuffer
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
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
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    console.log("draw noise");

    let pixels = new Uint8Array(4 * gl.canvas.width * gl.canvas.height);
    gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log("NOISE TEXTURE:", pixels);

    return texture;
  }

  erode(noise: WebGLTexture, flow: WebGLTexture | null, randomX: number, randomY: number) {
    const gl = this.gl;
    let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertex);
    let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.erosionFragment);

    var program = this.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    var randomPosUniformLocation = gl.getUniformLocation(program, "randomPos");
    gl.uniform2f(randomPosUniformLocation, randomX, randomY);

    var mapSizeUniformLocation = gl.getUniformLocation(program, "mapSize");
    gl.uniform2f(mapSizeUniformLocation, this.map.width, this.map.height);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    let vertexArray = this.setRectangle(0, 0, this.canvas.width, this.canvas.height);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, noise);

    const noiseLocation = gl.getUniformLocation(program, "noiseTexture");
    gl.uniform1i(noiseLocation, 1);

    if (flow === null) {
      console.log("creating new blank flow texture");
      flow = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, flow);
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
    } else {
      console.log("using existing flow texture");
      // log texture data
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, flow);
      // let pixels = new Uint8Array(4 * gl.canvas.width * gl.canvas.height);
      // gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      // console.log("FLOW TEXTURE:", pixels);
    }

    const flowLocation = gl.getUniformLocation(program, "flowTexture");
    gl.uniform1i(flowLocation, 0);

    // Attach the texture to the framebuffer as the rendering target
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, flow, 0);

    // gl.activeTexture(gl.TEXTURE1);
    // gl.bindTexture(gl.TEXTURE_2D, flow);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
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
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // let pixels = new Uint8Array(4 * gl.canvas.width * gl.canvas.height);
    // gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // console.log("SCREEN TEXTURE:", pixels);

    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, flow, 0);
    // create seperate framebuffer and an empty texture on unit 1 to render to
    // const fbo = gl.createFramebuffer();
    // gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    // const texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, flow);
    // gl.texImage2D(
    //   gl.TEXTURE_2D,
    //   0,
    //   gl.RGBA,
    //   gl.canvas.width,
    //   gl.canvas.height,
    //   0,
    //   gl.RGBA,
    //   gl.UNSIGNED_BYTE,
    //   null
    // );
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const debugLocation = gl.getUniformLocation(program, "u_debug");
    gl.uniform1i(debugLocation, 1); // Set the value of u_myBoolean to true

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    console.log("erode");

    return texture;
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
      console.log("compiled shader");
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
