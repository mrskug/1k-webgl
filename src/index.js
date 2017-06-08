// cheap way of doing AA
c.width = 800, c.height = 480; // 16:9 aspect ratio

f = new AudioContext();
a = f.createScriptProcessor(4096*4,1,1);
a.connect(f.destination);

numSample = 0;

// onload
with(c.getContext('webgl')) {
  P = createProgram();

  // NOTE: 2nd argument to drawArrays used to be 0, but undefined works
  r = time => drawArrays(6,  // TRIANGLE_FAN = 6
    // Send resolution and time to shader
    uniform3f(getUniformLocation(P, 'a'), c.width, c.height, time / 1e4, requestAnimationFrame(r)),
    3,

    // music
    a.onaudioprocess = e =>
    {
      q = e.outputBuffer.getChannelData(0);

      for(i=q.length;i--;)
      {
        //t = Math.floor(f.sampleRate * e.playbackTime + i);
        t = numSample + i;

        if (!i) console.log(e.playbackTime, 'start', t);
        if (i===16383) console.log(e.playbackTime, 'end', t);
        //q[i] = Math.sin(t / 23) * 128;

        // drum beat thing
        //q[i] += ((((u=t&0x3fff)&0+((u+1<<(18+(t>>12&1*6)))/u)&255)/(u>>8))&240-128);

        // melody thing
        //q[i] += ((t*("36364689"[t>>13&7]&15))/12&128)+(((((t>>12)^(t>>12)-2)%11*t)/4|t>>13)&127)

        // melody thing 2
        q[i] = (((3e3/(y=t&16383))&1)*35) +
               (x=t*("3346"[t>>16&3]&15)/24&127)*y/4e4 +
               ((t>>8^t>>10|t>>14|x)&63)

        // kick
        //q[i] += (((1e4/(y=t&16383*1.5))&1)*35)

        // beep thing
        //q[i] += (((1e4/(t&16383*2+8000))&2)*10)

        // bass
        //q[i] += (x=t*('9754'[t>>16&3]&15)/24&100)*y/5e4

        //q[i] += ((t>>8^t>>10|t>>14|x)&63)

        /*
        with(Math) {
          q[i] += ((a=(1-((t&0xfff)/0xfff)))&0)+Math.max(Math.min( (( (sin((y=([0.25,0.30,0.17,0.20][(t>>12)&3]))*  (z=0.313)*t)+sin(y*z*t*1.001)+sin(y*z*t*1.003)+sin(y*z*t*1.005))) )*(sin(t*0.0001)+1.1)*44*a,63),-64)*Math.min(t/0x1ffff,1)+Math.max(Math.min( ((((sin((t&0xfff)*0.07*a*a*a)*64))))*  ((0x55355535>>(t>>12&31))&1)*a*2.2 +((d=(sin((t^0x1ffff)*0.1*t*a)*64)*a))*((0xb4446444>>((t>>12)  &31))&1)*a*0.9 +((a*d*((t>>10&3)==0)&0xff))*a*0.04 ,63),-64)*(t>0x3ffff)
        }
        */

        q[i] /= 1000;

        // limit volume while testing
        q[i] = Math.max(-0.125, Math.min(0.125, q[i]));
      }

      numSample += q.length;
    }
  );

  // vertex shader
  shaderSource(S=createShader(35633), require('./vertex.glsl')); // VERTEX_SHADER = 35633
  compileShader(S);attachShader(P,S);

  // fragment shader
  shaderSource(S=createShader(35632), require('./fragment.glsl')); // FRAGMENT_SHADER = 35632
  compileShader(S);attachShader(P,S);

  // Log compilation errors
  // if (!getShaderParameter(S, 35713)) { // COMPILE_STATUS = 35713
  //   throw getShaderInfoLog(S);
  // }

  bindBuffer(34962, createBuffer(c.parentElement.style.margin = 0)); // ARRAY_BUFFER = 34962
  // 1st argument to enableVertexAttribArray used to be 0, but undefined works
  // 1st argument to vertexAttribPointer used to be 0, but undefined works
  vertexAttribPointer(
    enableVertexAttribArray(
      bufferData(34962, Int8Array.of(-3, 1, 1, -3, 1, 1), 35044) // 35044 = gl.STATIC_DRAW
    ),
  2, 5120, r(c.style.height = '100vh'), linkProgram(P), useProgram(P)); // BYTE = 5120
}

/*
// generate music
for(var t=0,S='RIFF_oO_WAVEfmt '+atob('EAAAAAEAAQAcRwAAHEcAAAEACABkYXRh')+'data';++t<1e5;)S+=String.fromCharCode(eval(

// formula
'((((u=t&0x3fff)&0+((u+1<<(18+(t>>12&1*6)))/u)&255)/(u>>8))&240-128)'

// failsafe thing
+ '&255'
));

// play music
new Audio( 'data:audio/wav;base64,'+btoa(S) ).play();
*/
/*
a = new AudioContext();

dly = a.createDelay();
osc1env = a.createGain();
osc1 = a.createOscillator();
lfo = a.createOscillator();

osc1.type = 'sawtooth';
osc1.frequency.value = 40;

lfo.type = 'sawtooth';
lfo.frequency.value = 2;
lfo.connect(osc1env.gain);

dly.delayTime.value = 2 / 3;

osc1.connect(osc1env);
osc1env.connect(a.destination);
osc1env.connect(dly);
dly.connect(a.destination);

lfo.start();
osc1.start();
*/
