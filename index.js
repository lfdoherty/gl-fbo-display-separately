var triangle = require('a-big-triangle')
var glslify  = require('glslify')
var WMap     = typeof WeakMap === 'undefined'
  ? require('weakmap')
  : WeakMap

module.exports = display

var canvasCache = new WMap();

function display(fbo, scale) {

  var canvas = canvasCache.get(fbo)
  if (!canvas){
      canvas = document.createElement('canvas')
      document.body.appendChild(canvas);
      canvasCache.set(fbo, canvas)
  }
  let tex = fbo.color[0]
  canvas.width  = tex.shape[0]
  canvas.height = tex.shape[1]
  var ctx       = canvas.getContext('2d')
  let gl        = fbo.gl;

  let pixels;
  let pixelSize = tex.shape[0]*tex.shape[1];
  let manyComponents = 1;
  if(tex.format === gl.RGB) manyComponents = 3;
  else if(tex.format === gl.RGBA) manyComponents = 4;
  if(tex.type === gl.FLOAT){
    pixels = new Float32Array(pixelSize * manyComponents);
  }else{
    pixels = new Uint8Array(pixelSize * manyComponents)
  }
  fbo.bind()
  fbo.gl.readPixels(0, 0, tex.shape[0], tex.shape[1], tex.format, tex.type, pixels);

  let imageDataBuffer = new Uint8ClampedArray(pixelSize * 4);
  let offset = 0;
  let inputOffset = 0;
  function readValue(offset){
    if(tex.type === gl.FLOAT){
      return pixels[offset] * 255;
    }else{
      return pixels[offset];
    }
  }
  for(let i=0;i<pixelSize;++i){
    imageDataBuffer[offset++] = readValue(inputOffset++);
    if(manyComponents === 1){
      imageDataBuffer[offset++] = 0
      imageDataBuffer[offset++] = 0
      imageDataBuffer[offset++] = 1
    }else if(manyComponents === 3){
      imageDataBuffer[offset++] = readValue(inputOffset++);
      imageDataBuffer[offset++] = readValue(inputOffset++);
      imageDataBuffer[offset++] = 1      
    }else{
      imageDataBuffer[offset++] = readValue(inputOffset++);
      imageDataBuffer[offset++] = readValue(inputOffset++);
      imageDataBuffer[offset++] = readValue(inputOffset++);
    }
  }
  let imgData = new ImageData(imageDataBuffer, canvas.width, canvas.height);
  ctx.putImageData(imgData, 0, 0)  
  return canvas;
}
