import p5 from "p5";

const circleCount = 100000;

const sketch = (s: p5) => {
  s.setup = function () {
    s.createCanvas(1000, 1000);
  };

  s.draw = function () {
    s.background(120);
    s.frameRate(24);

    for (let i = 0; i < circleCount; i++) {
      s.circle(s.random(s.width), s.random(s.height), 10);
    }
  };
};

new p5(sketch);
