import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Screen = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #000;
  position: relative;
  overflow: hidden;
  overscroll-behavior: none;
`;

const scale = 16.6294577802732605e-8;
const timeScale = 10000; // * 60 * 60 * 24 * 100;

const fps = 60;

const G = 6.67430 * Math.pow(10, -11)

interface Attributes {
  radius: number;
  mass: number;
}

type Coords = {
  x: number;
  y: number;
  z: number;
}

type Position = Coords;
type Speed = Coords;

interface Planet {
  name: string;
  color: string;
  params: Attributes;
  position: Position;
  speed: Speed;
}

const objects: Planet[] = [
  {
    name: 'Sun',
    color: '#fca',

    params: {
      radius: 695500000,
      mass: 1.989e30,
    },

    speed: {
      x: 0,
      y: -126778,
      z: 0
    },

    position: {
      x: 0,
      y: 0,
      z: 0
    }
  },
  {
    name: 'Sun2',
    color: '#fca',

    params: {
      radius: 695500000,
      mass: 1.989e30,
    },

    speed: {
      x: 0,
      y: 126778,
      z: 0
    },

    position: {
      x: 3695500000,
      y: 0,
      z: 0
    }
  },
  {
    name: 'Mercury',
    color: '#a85',

    params: {
      radius: 2439700,
      mass: 3.285e23,
    },

    speed: {
      x: 56000,
      y: 0,
      z: 0
    },

    position: {
      x: 0,
      y: 45910000000,
      z: 0
    }
  },
  {
    name: 'Venus',
    color: '#fb7',

    params: {
      radius: 6051800,
      mass: 4.87e24,
    },

    speed: {
      x: 35000,
      y: 0,
      z: 0
    },

    position: {
      x: 0,
      y: 108000000000,
      z: 0
    }
  },
  {
    name: 'Earth',
    color: '#adf',

    params: {
      radius: 6378100,
      mass: 5.9742 * Math.pow(10, 24),
    },

    speed: {
      x: 29780,
      y: 0,
      z: 0
    },

    position: {
      x: 0,
      y: 149597870700,
      z: 0
    }
  },
  {
    name: 'Moon',
    color: '#888',

    params: {
      radius: 1737100,
      mass: 7.36 * Math.pow(10, 22),
    },

    position: {
      x: - 3.84 * Math.pow(10, 8),
      y: 149597870700,
      z: 0
    },

    speed: {
      x: 30000,
      y: -1020, // m per sec
      z: 0
    }
  },
  {
    name: 'Mars',
    color: '#f55',

    params: {
      radius: 3389500,
      mass: 6.41693e23,
    },

    speed: {
      x: 26500,
      y: 0,
      z: 0
    },

    position: {
      x: 0,
      y: 225000000000,
      z: 0
    }
  },

  // ...(new Array(200).fill(true).map(i => ({
  //   name: i + 'i',
  //   color: '#fff',

  //   params: {
  //     radius: Math.random() * 10000000,
  //     mass: Math.random() * 6.41693e24,
  //   },

  //   speed: {
  //     x: Math.random() * 30000,
  //     y: 0,
  //     z: 0
  //   },

  //   position: {
  //     x: 0,
  //     y: 225000000000 - Math.random() * 100000000000,
  //     z: 0
  //   }
  // }))),

  // ...(new Array(200).fill(true).map(i => ({
  //   name: i + 'ii',
  //   color: '#fff',

  //   params: {
  //     radius: Math.random() * 10000000,
  //     mass: Math.random() * 6.41693e24,
  //   },

  //   speed: {
  //     x: - Math.random() * 30000,
  //     y: 0,
  //     z: 0
  //   },

  //   position: {
  //     x: 0,
  //     y: - 225000000000 + Math.random() * 100000000000,
  //     z: 0
  //   }
  // })))
];

class PlanetObject {
  readonly node: HTMLDivElement;
  public hidden: boolean = false;

  constructor(readonly name: string, readonly color: string, readonly params: Attributes, readonly position: Position, readonly speed: Speed) {
    this.node = document.createElement('div');
    this.node.style.borderRadius = "50%";
    this.node.style.position = "absolute";
    this.node.style.backgroundColor = color;
  }

  public draw = (scale: number, offset: Coords) => {
    const width = this.params.radius * 2;
    const height = this.params.radius * 2;
    const depth = this.params.radius * 2;

    const x = offset.x + this.position.x - width / 2;
    const y = offset.y + this.position.y - height / 2;
    const z = offset.z + this.position.z - depth / 2;

    this.node.style.top = offset.y + "px";
    this.node.style.left = offset.x + "px";

    this.node.style.width = Math.max(2, width * scale) + 'px';
    this.node.style.height = Math.max(2, width * scale) + 'px';
    
    this.node.style.transform = `translate3d(${x * scale}px, ${y * scale}px, ${z * scale}px)`;
  }

  public gravitate = (speed: Coords) => {
    this.speed.x += speed.x;
    this.speed.y += speed.y;
  }

  public affect = (scale: number) => {
    this.position.x += this.speed.x * scale;
    this.position.y += this.speed.y * scale;
  }

  public show = () => {
    this.hidden = false;
    this.node.style.display = 'block';
  }

  public hide = () => {
    this.hidden = true;
    this.node.style.display = 'none';
  }
}

const sum = (a: Coords, b: Coords) => {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

const roots = (A: number, B: number, C: number) => {
  const D = Math.pow(B, 2) - 4 * A * C;

  if (!D) {
    return [- B / (2 * A)];
  } else if (D < 0) {
    return;
  } else {
    return [(- B + Math.sqrt(D)) / (2 * A), (- B - Math.sqrt(D)) / (2 * A)]
  }
}

function App() {
  const flow = useRef<string>();
  const date = useRef<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !cameraRef.current) {
      return;
    }

    // var img = document.getElementById("your-image");
    // create and customize the canvas
    var canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    canvas.width = 2000;
    canvas.height = 2000;

    for (var i = 0; i < 100; i ++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${i % 10 ? 0.2 : 0.5})`;
      ctx.beginPath();
      ctx.moveTo(0, i * 20);
      ctx.lineTo(2000, i * 20);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${i % 10 ? 0.2 : 0.5})`;
      ctx.beginPath();
      ctx.moveTo(i * 20, 0);
      ctx.lineTo(i * 20, 2000);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const pngUrl = canvas.toDataURL();

    ref.current.style.backgroundImage = `url(${pngUrl})`;



    let currentScale = scale;

    const nodes: PlanetObject[] = [];

    const offset = {
      x: 0,
      y: 0
    };



    objects.forEach(i => {
      const node = new PlanetObject(i.name, i.color, i.params, i.position, i.speed);

      nodes.push(node);
      node.draw(currentScale, { x: ref.current!.clientWidth / 2, y: ref.current!.clientHeight / 2, z: 0 });

      ref.current?.appendChild(node.node);
    })

    const move = (e: Event & Partial<MouseEvent>) => {
      offset.x += e.movementX ?? 0;
      offset.y += e.movementY ?? 0;
    }

    const setScale = (e: Event & Partial<WheelEvent>) => {
      const multiplier = e.deltaY ? e.deltaY < 1 ? 0.96 : 1.04 : 1;

      currentScale = currentScale * multiplier;

      offset.x = offset.x * multiplier;
      offset.y = offset.y * multiplier;
      // console.log(currentScale)
    }

    const stopDrag = () => {
      ref.current!.removeEventListener('mousemove', move);
      ref.current!.removeEventListener('mouseup', stopDrag);
    }

    const startDrag = () => {
      ref.current!.addEventListener('mousemove', move);
      ref.current!.addEventListener('mouseup', stopDrag);
    }

    ref.current.addEventListener('mousewheel', setScale);
    ref.current.addEventListener('mousedown', startDrag);

    const startDate = new Date().valueOf();



    cameraRef.current.width = 320;
    cameraRef.current.height = 240;

    const context = cameraRef.current.getContext("2d");
    const width = cameraRef.current.width;
    const height = cameraRef.current.height;

    let rays: Coords[] = [];

    const xAngle = 40; // 45;
    const yAngle = 30; // 30;

    const cameraPos = {
      x: 0,
      y: 0,
      z: 10_000_000_000
    };

    const cameraDirection = {
      x: 0,
      y: Math.sqrt(2) / 2,
      z: Math.sqrt(2) / 2
    }

    

    const interval = setInterval(() => {
      date.current += 1000 * timeScale / fps;
      dateRef.current!.innerHTML = new Date(startDate + date.current).toLocaleString()
      ref.current!.style.backgroundPosition = `calc(50% + ${offset.x}px) calc(50% + ${offset.y}px)`;

      // scale bg
      const zeroScale = Math.pow(10, Math.floor(Math.log10(currentScale)));
      ref.current!.style.backgroundSize = (currentScale / zeroScale > 5 ? 30 * currentScale / zeroScale : 60 * currentScale / zeroScale) + '%';

      // console.log(currentScale / zeroScale > 5);

      nodes.forEach(i => {
        nodes.forEach(j => {
          if (j === i) {
            return;
          }

          const distance: Coords = {
            x: j.position.x - i.position.x,
            y: j.position.y - i.position.y,
            z: j.position.z - i.position.z,
          }


          const absoluteDistance = Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2) + Math.pow(distance.z, 2));
          
          const deltaV = G * j.params.mass / Math.pow(absoluteDistance, 2) * (timeScale / fps);

          const deltaSpeed: Coords = {
            x: deltaV * (distance.x / absoluteDistance),
            y: deltaV * (distance.y / absoluteDistance),
            z: 0,
          }

          i.gravitate(deltaSpeed);
        });
      });

      // console.log(1 / currentScale);

      nodes.forEach(i => {
        i.affect(timeScale / fps);

        // const left = (offset.x - ref.current!.clientWidth / 2) / currentScale;
        // const top = (offset.y - ref.current!.clientHeight / 2) / currentScale;
        // const right = (offset.x + ref.current!.clientWidth / 2) / currentScale;
        // const bottom = (offset.y + ref.current!.clientHeight / 2) / currentScale;

        i.draw(currentScale, { x: ref.current!.clientWidth / 2 + offset.x, y: ref.current!.clientHeight / 2 + offset.y, z: 0 });

        // const inScreen = i.position.x > left && i.position.x < right && i.position.x > top && i.position.y < bottom;
        // const notFar = 1 / currentScale < i.params.radius * 1000;
        // console.log(i.params);

        const needDraw = true; // inScreen; // && notFar;

        if (needDraw) {
          if (i.hidden) {
            i.show();
          }
        } else {
          if (!i.hidden) {
            i.hide();
          }
        }

        // console.log(flow);
        if (flow.current === i.name) {
          offset.x = - i.position.x * currentScale;
          offset.y = - i.position.y * currentScale;
        }
      });

      

      // 3d engine

      let pixels: boolean[] = [];

      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          const angleFromCenterX = - xAngle * (x - width / 2) / width;
          const angleFromCenterY = - yAngle * (y - height / 2) / height;

          // const xLen = Math.sin(angleFromCenterX * Math.PI / 180);
          // const yLen = Math.sin(angleFromCenterY * Math.PI / 180);
          // const zLen = Math.sqrt(1 - Math.pow(xLen, 2) - Math.pow(yLen, 2));


          const X = Math.tan(angleFromCenterX * Math.PI / 180);
          const Y = Math.tan(angleFromCenterY * Math.PI / 180);
          const Z = - 1;

          // console.log(X, Y, Z);

          const sum = Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2) + Math.pow(Z, 2));

          const xDir = X / sum;
          const yDir = Y / sum;
          const zDir = Z / sum;

          const xLen = Math.cos(Math.acos(xDir));
          const yLen = Math.cos(Math.acos(yDir));
          const zLen = Math.cos(Math.acos(zDir));

          // const angleVector: Coords = { x: xLen, y: yLen, z: zLen };

          let isPainted = false;

          nodes.forEach(i => {
            const A = 1; // Math.pow(xLen, 2) + Math.pow(yLen, 2) + Math.pow(zLen, 2);
            const B = 2 * (cameraPos.x - i.position.x) * xLen + 2 * (cameraPos.y - i.position.y) * yLen + 2 * (cameraPos.z - i.position.z) * zLen;
            const C = Math.pow(cameraPos.x - i.position.x, 2) + Math.pow(cameraPos.y - i.position.y, 2) + Math.pow(cameraPos.z - i.position.z, 2) - Math.pow(i.params.radius, 2);

            if (!isPainted) {
              isPainted = !!roots(A, B, C);
            }
          });

          pixels.push(isPainted)
        }
      }



      // draw 3d on canvas engine

      var imageData = context!.getImageData(0,0, width, height);

      for (var i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = pixels[i / 4] ? 255 : 0;  // установка серого цвета
        imageData.data[i + 1] = pixels[i / 4] ? 255 : 0;
        imageData.data[i + 2] = pixels[i / 4] ? 255 : 0;
        imageData.data[i + 3] = 255;
      }
        
      context!.putImageData(imageData, 0, 0);
    }, 1000 / fps);

    return () => {
      clearInterval(interval);
      ref.current?.removeEventListener('scroll', setScale);
      ref.current?.removeEventListener('mousedown', startDrag);
    }
  }, []);

  return (
    <>
      <Screen ref={ref}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <select value={flow.current} onChange={e => flow.current = e.target.value}>
            <option />

            {objects.map(i => (
              <option value={i.name}>{i.name}</option>
            ))}
          </select>

          <span style={{ color: "#fff", fontSize: "12px", fontFamily: "monospace" }} ref={dateRef} />
        </div>
      </Screen>

      <canvas style={{ filter: "blur(1px)", opacity: 0.8, position: "fixed", bottom: "16px", right: "16px", border: "1px solid #ccc" }} ref={cameraRef} />
    </>
  );
}

export default App;
