import { useEffect, useRef } from "react";
import styled from "styled-components";

const Screen = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #000;
  position: relative;
  overflow: hidden;
`;

const Moon = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  width: 100vw;
  height: 100vh;
`;

const Earth = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  width: 100vw;
  height: 100vh;
`;

const scale = 0.0000016;
const timeScale = 60 * 60 * 8;

const fps = 50;

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
    name: 'Earth',
    color: '#58f',

    params: {
      radius: 6378100,
      mass: 5.9742 * Math.pow(10, 24),
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
    name: 'Moon',
    color: '#ccc',

    params: {
      radius: 1737100,
      mass: 7.36 * Math.pow(10, 22),
    },

    position: {
      x: - 3.84 * Math.pow(10, 8),
      y: 0,
      z: 0
    },

    speed: {
      x: 0,
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

    this.node.style.width = width * scale + 'px';
    this.node.style.height = width * scale + 'px';
    
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

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
      const multiplier = e.deltaY ? e.deltaY < 1 ? - e.deltaY / 100 : 1 / (e.deltaY / 100) : 1;

      currentScale = currentScale * multiplier;
      console.log(currentScale)
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

    const interval = setInterval(() => {
      nodes.forEach(i => {
        const gOffset = ({ x: 0, y: 0, z: 0 });
        // i.affect({ x: 400, y: -80, z: 0 });

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
          
          const deltaV = G * j.params.mass / Math.pow(absoluteDistance, 2) * (timeScale / fps) / 8;

          const deltaSpeed: Coords = {
            x: deltaV * (distance.x * 10 / absoluteDistance),
            y: deltaV * (distance.y * 10 / absoluteDistance),
            z: 0,
          }

          i.gravitate(deltaSpeed);
        });
      });

      nodes.forEach(i => {
        console.log(i);
        i.affect(timeScale / fps);
        i.draw(currentScale, { x: ref.current!.clientWidth / 2 + offset.x, y: ref.current!.clientHeight / 2 + offset.y, z: 0 });
      });
    }, 1000 / fps);

    return () => {
      clearInterval(interval);
      ref.current?.removeEventListener('scroll', setScale);
      ref.current?.removeEventListener('mousedown', startDrag);
    }
  }, []);

  return (
    <Screen ref={ref} />
  );
}

export default App;
