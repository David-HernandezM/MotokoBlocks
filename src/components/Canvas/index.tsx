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
    console.log("Cambiando nuevas coordenadas: ");
    console.log(newCoords);
    let dataBlock = blocks.find(item => item.blockId === blockId);

    if (!dataBlock) return;

    dataBlock.coords = newCoords;

    setBlocks(blocks);

    
    
    
    // let blockUpdated: Array<VariableDataElement> = blocks.slice();
    // blockUpdated = blockUpdated.map(item => {
    //   if (item.blockId === blockId) {
    //     item.coords = newCoords;
    //   }
    //   return item;
    // });
    // setBlocks(blockUpdated);
    // console.log("Lista con bloque actualizado:");
    // console.log(blockUpdated);
    // console.log("Lista en el state");
    // console.log(blocks);
  };


  return (
    <div className='maindiv'>
      <button onClick={addVariable}>Create Variable</button>
      <button onClick={() => {
        console.log("Datos en la lista");
        console.log(blocks);
        console.log("Terminado de enseñas los bloques en la lista!")
      }}>
        Mostrar Bloques en editor.
      </button>
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
              />
            )
          })}
      </svg>
    </div>
  );
}

export default Canvas;



  // const moveToFirstPositionById = (blockId: string) => {
  //   console.log("Lista actual:");
  //   console.log(blocks);
  //   let indexOfBlock: number = blocks.findIndex(item => item.blockId === blockId);
  //   if (indexOfBlock == -1) {
  //     console.log(`Element with id: ${blockId} does not exist`);
  //     return;
  //   }
  //   let elementToChange = blocks[indexOfBlock];
  //   let updatedListBlocks = blocks.filter(item => item.blockId);
  //   updatedListBlocks.push(elementToChange);
  //   console.log("Lista actualizada con id primero: " + blockId);  
  //   console.log(updatedListBlocks);
  //   setBlocks(updatedListBlocks);  
  //   console.log("Lista en el state");
  //   console.log(blocks);
  // };
