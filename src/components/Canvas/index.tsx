import React, { useRef, useEffect, useState } from 'react';
import  Draggable, { DraggableCore } from 'react-draggable';
import './Canvas.scss';
import useDragger from '../../hooks/useDragger';
import { Variable } from '../Blocks';
import { VariableData, VariableTypes, TypeOfBlock } from '../Blocks/BlocksTypes/Utils';


const test: VariableData = {
  variableName: 'test',
  isStable: false,
  isMutable: false,
  varValue: 3,
  varType: VariableTypes.Int,
  isParameter: false
};

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

type VariableDataElement = {
  blockId: string,
  coords: {x: number; y: number},
  variableType: TypeOfBlock
}

const Canvas = () => {
  const [blocks, setBlocks] = useState<Array<VariableDataElement>>([]);
  const [typeSelected, setTypeSelected] = useState<TypeOfBlock>(TypeOfBlock.None);
  const [blockIdSelected, setBlockIdSelected] = useState("");
  const [holdingBlock, setHoldingBlock] = useState<boolean>(false);

  const addVariable = () => {
    setBlocks([
      ...blocks,
      {
        blockId: generateUUID(),
        coords: {x: 398, y: 123},
        variableType: TypeOfBlock.Variable
      }
    ]);
    console.log("Nuevo variable agragado:");
    console.log(blocks);
  }

  const updateBlockCoords = (newCoords: {x: number; y: number}, blockId: string) => {
    let blockUpdated: Array<VariableDataElement> = blocks.slice();
    blockUpdated = blockUpdated.map(item => {
      if (item.blockId === blockId) {
        item.coords = newCoords;
      }
      return item;
    });
    setBlocks(blockUpdated);
    console.log("Lista con bloque actualizado:");
    console.log(blockUpdated);
    console.log("Lista en el state");
    console.log(blocks);
  };

  const moveToFirstPositionById = (blockId: string) => {
    console.log("Lista actual:");
    console.log(blocks);
    let indexOfBlock: number = blocks.findIndex(item => item.blockId === blockId);
    if (indexOfBlock == -1) {
      console.log(`Element with id: ${blockId} does not exist`);
      return;
    }
    let elementToChange = blocks[indexOfBlock];
    let updatedListBlocks = blocks.filter(item => item.blockId);
    updatedListBlocks.push(elementToChange);
    console.log("Lista actualizada con id primero: " + blockId);  
    console.log(updatedListBlocks);
    setBlocks(updatedListBlocks);  
    console.log("Lista en el state");
    console.log(blocks);
  };

  return (
    <div className='maindiv'>
      <button onClick={addVariable}>Create Variable</button>
      <svg className='container'>
        <path d='M 200 0 V 500' stroke='black' />
        {blocks.map((block, index) => {
            return (
              <Variable 
                key={block.blockId} 
                data={test} 
                isDraggable={true} 
                blockId={block.blockId} 
                changeDataOfBlock={setTypeSelected}
                setIsHolding={setHoldingBlock}
                isHolding={holdingBlock}
                initialCoords={block.coords}
                updateCoords={updateBlockCoords}
                mouseEnter={moveToFirstPositionById}
              />
            )
          })}
      </svg>
    </div>
  );
}

export default Canvas;


/*
const divRef = useRef<HTMLDivElement>();
    <>
    <div className='EditorSpace'>
      <Draggable handle='.handle' bounds="parent">
        <div className='test'>
          <div className='child handle'></div>
        </div>
      </Draggable>
    </div>
    
    </>
<svg className="EditorSpace">
      <g className='svgTest'>
        <Draggable bounds="parent">
          <path 
              d="M 0 4 C 1 0, 0 1, 4 0 L 15 0 V 6 h 20 V 0 H 190 c 0 0, 5.5 1, 4 4 v 25 H 35 v 6 h -20 v -6 h -11 c 0 0, 0 0, -4 -4 Z" 
              onClick={() => {
                  console.log("Path was clicked!");
              }}
          />
        </Draggable>
      </g>
    </svg>
*/







/*
import React, { useRef, useEffect } from 'react';
import './Canvas.scss';

const Canvas = ({height = 350, width = 350}) => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  function stopAnimation() {
    cancelAnimationFrame(frameRef.current);
  }
  
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current
    const context = canvas.getContext('2d');
    if (!context) return;
    let frameCount = 0;

    context.canvas.height = height;
    context.canvas.width = width;

    //Our draw came here
    const render = () => {
      frameCount++;
      draw(context);
      console.log(frameCount);
      frameRef.current = requestAnimationFrame(render);
    };

    // Code that need animation, goes after the render function call.

    // render();

    let circle = new Circle(150, 150, 50, 'red');
    circle.draw(context);
    
    return () => {
      console.log("Animation was canceled");
      cancelAnimationFrame(frameRef.current);
    }
  }, [draw])
  
  return (
    <div>
      <button 
        id='cancelButton'
        onClick={stopAnimation}
      >
        Stop animation
      </button>
      <canvas 
        ref={canvasRef}
        className='EditorSpace'
        onClick={(e) => {
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;  
            console.log(`x: ${x} y: ${y}`);
                      
          }
          
        }}
      />
    </div>
  );
};

export default Canvas;
*/




/*
class Circle {
  xpos : number;
  ypos : number;
  radius : number;
  speed: number;
  color : string;
  text : string;
  dx: number;
  dy: number;

  constructor(xpos : number, ypos : number, radius : number, speed: number, color : string, text = "text") {
      this.xpos = xpos;
      this.ypos = ypos;
      this.radius = radius;
      this.speed = speed;
      this.color = color;
      this.text = text;

      this.dx = 1 * this.speed;
      this.dy = 1 * this.speed;
  }

  draw(context : CanvasRenderingContext2D) {
    context.beginPath();

    context.strokeStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillText(this.text, this.xpos, this.ypos);
    // context.strokeText(this.text, this.xpos, this.ypos);

    context.lineWidth = 3;
    context.arc(this.xpos, this.ypos, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  update(context : CanvasRenderingContext2D) {
    this.draw(context);
    
    if ((this.xpos + this.radius) > context.canvas.width) {
      this.dx = -this.dx;
    }
    if ((this.xpos - this.radius) < 0) {
      this.dx = -this.dx;
    }
    if ((this.ypos + this.radius) > context.canvas.height) {
      this.dy = -this.dy;
    }
    if ((this.ypos - this.radius) < 0) {
      this.dy = -this.dy;
    }

    this.xpos += this.dx;
    this.ypos += this.dy;
  }

}


function getDistance(xpos1: number, ypos1: number, xpos2: number, ypos2: number) {
  let result = Math.sqrt(Math.pow(xpos2 - xpos1, 2) + Math.pow(ypos2 - ypos1, 2));
  return result;
}

function createCircle(circle : Circle, context : CanvasRenderingContext2D) {
  circle.draw(context);
}



  let all_circles = [];

  let random_x = Math.random() * height;
  let random_y = Math.random() * width;
  let my_circle1 = new Circle(40, 70, 30, 3, "black", "A");
  let my_circle2 = new Circle(150, 150, 70, 0, "black", "B");

  createCircle(my_circle1, context);
  createCircle(my_circle2, context);


    const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (getDistance(circles[0].xpos, circles[0].ypos, circles[1].xpos, circles[1].ypos) < (circles[0].radius + circles[1].radius)) {
      circles[1].color = "red";
    } else {
      circles[1].color = "black";
    }
  };

*/



// export default function Canvas({ height = 500, width = 500 }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const frameRef = useRef<number>(0);

//   const draw = (context: CanvasRenderingContext2D, drawFunc: (context: CanvasRenderingContext2D) => void) => {
//     drawFunc(context);
//   }

//   useEffect(() => {
//     function draw_circle(context: CanvasRenderingContext2D, drawFunc: (context : CanvasRenderingContext2D) => void) {
//       if (context) {
//         // context.fillStyle = "red";
//         // context.fillRect(0, 0, height, width);

//         drawFunc(context);

//         frameRef.current = requestAnimationFrame(() => draw_circle(context, drawFunc));
//       } 
//     }

//     function createCircle(circle : Circle, context : CanvasRenderingContext2D) {
//       circle.draw(context);
//     }

//     if (canvasRef.current) {
//       const context = canvasRef.current.getContext("2d");

//       if (context) {
//         context.canvas.height = height;
//         context.canvas.width = width;

//         let all_circles = [];
//         let circle_counter = 1;

//         let random_x = Math.random() * height;
//         let random_y = Math.random() * width;
//         let my_circle = new Circle(random_x, random_y, 30, 1, "black", circle_counter.toString());
//         createCircle(my_circle, context);



//         // for (let numbers = 0; numbers < 1; numbers ++) {
//         //   let random_x = Math.random() * height;
//         //   let random_y = Math.random() * width;
//         //   let my_circle = new Circle(random_x, random_y, 50, 1, "black", circle_counter.toString());
//         //   all_circles.push(my_circle);
//         //   createCircle(all_circles[numbers], context);
//         //   circle_counter += 1;
//         // }
//         // console.log(all_circles);
        
//         frameRef.current = requestAnimationFrame(() => draw_circle(context, my_circle.update));
//       }
//     }
//     // return () => cancelAnimationFrame(frameRef.current); // Tener en cuenta
//   }, [draw]); //[height, width]);

//   return <canvas ref={canvasRef} />;
// }











// import { useEffect, useRef } from "react";

// export default function Canvas({ height = 500, width = 500 }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const frameRef = useRef<number>(0);

//   useEffect(() => {


//     if (canvasRef.current) {
//       const context = canvasRef.current.getContext("2d");

//       const draw = (context: CanvasRenderingContext2D, drawFunc: (context: CanvasRenderingContext2D) => void) => {
//         drawFunc(context);
//       };

//       if (context) {
//         context.canvas.height = height;
//         context.canvas.width = width;

//         let all_circles = [];
//         let circle_counter = 1;

//         let random_x = Math.random() * height;
//         let random_y = Math.random() * width;
//         let my_circle = new Circle(random_x, random_y, 30, 1, "black", circle_counter.toString());

        

//         createCircle(my_circle, context);
//         frameRef.current = requestAnimationFrame(() => draw_circle(context, my_circle.update));
//       }
//     }
//   }, [draw]);

//   return <canvas ref={canvasRef} />;
// }







