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

const scale = 2.6294577802732605e-9;
const timeScale = 60 * 60 * 24 * 30;

const fps = 100;

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
      y: 0,
      z: 0
    },

    position: {
      x: 0,
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
      x: 30000,
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
  }
];

class PlanetObject {
  public node: HTMLDivElement;

  constructor(readonly name: string, readonly color: string, readonly params: Attributes, readonly position: Position, readonly speed: Speed) {
    this.node = document.createElement('div');
    this.node.style.borderRadius = "50%";
    this.node.style.position = "absolute";
    this.node.style.backgroundColor = color;
  }

  public draw = (scale: number, offset: Coords) => {
    const width = this.params.radius;
    const height = this.params.radius;
    const depth = this.params.radius;

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
}

function App() {
  const flow = useRef<string>();
  const date = useRef<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
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

    for (var i = 0; i < 20; i ++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${i % 10 ? 0.2 : 0.5})`;
      ctx.beginPath();
      ctx.moveTo(0, i * 100);
      ctx.lineTo(2000, i * 100);
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${i % 10 ? 0.2 : 0.5})`;
      ctx.beginPath();
      ctx.moveTo(i * 100, 0);
      ctx.lineTo(i * 100, 2000);
      ctx.lineWidth = 1;
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

    const interval = setInterval(() => {
      date.current += 1000 * timeScale / fps;
      dateRef.current!.innerHTML = new Date(startDate + date.current).toLocaleString()
      ref.current!.style.backgroundPosition = `calc(50% + ${offset.x}px) calc(50% + ${offset.y}px)`;

      // scale bg
      const zeroScale = Math.pow(10, Math.floor(Math.log10(currentScale)));
      ref.current!.style.backgroundSize = currentScale / zeroScale * 35 + '%';

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

      nodes.forEach(i => {
        i.affect(timeScale / fps);
        i.draw(currentScale, { x: ref.current!.clientWidth / 2 + offset.x, y: ref.current!.clientHeight / 2 + offset.y, z: 0 });
        // console.log(flow);
        if (flow.current === i.name) {
          offset.x = - i.position.x * currentScale;
          offset.y = - i.position.y * currentScale;
        }
      });
    }, 1000 / fps);

    return () => {
      clearInterval(interval);
      ref.current?.removeEventListener('scroll', setScale);
      ref.current?.removeEventListener('mousedown', startDrag);
    }
  }, []);

  useEffect(() => {

  }, [dateRef]);

  return (
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
  );
}

export default App;
