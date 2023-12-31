import { Dispatch, SetStateAction, useEffect, useReducer, useRef, useState } from "react";
import useDragger from "../../../hooks/useDragger";
import { VariableData, TypeOfBlock, blockSilhouette, SideSilhouette } from "../BlocksTypes/Utils";
import './Variable.scss';

interface VariableProps {
    data: VariableData;
    isDraggable: boolean;
    blockId: string;
    changeDataOfBlock: (typoBlock: TypeOfBlock, newCoords?: {x: number, y: number}) => void;
    setIsHolding: Dispatch<SetStateAction<boolean>>;
    isHolding: boolean;
    initialCoords: {x: number; y: number};
    updateCoords: (newCoords: {x: number; y: number}, blockId: string) => void;
}

const Variable = ({ data, isDraggable, blockId, changeDataOfBlock, setIsHolding, isHolding, initialCoords, updateCoords }: VariableProps) => {
    const [coords, setCoords] = useState({x: initialCoords.x, y: initialCoords.y});
    const [showSilhouette, setshowSilhouette] = useState(false);
    const [side, setSide] = useState<SideSilhouette>("top");
    const [userWasDragging, setUserWasDragging] = useState(false);

    const actualHeight = 35;

    const setNewCoords = (newCoords: {x: number, y: number}) => {
        setCoords(newCoords);
        console.log("TestIsHolding");
        console.log(isHolding);
    };

    const setHolding = (holding: boolean) => {
        setIsHolding(last => holding);
    };

    if (isDraggable) useDragger({blockId, setNewCoords, setHolding, isHolding, initialCoords});

    const handleOnMouseEnter = () => {
        console.log(isHolding);
        if (!isHolding) return;
        console.log("Is holding!!");
        
        setshowSilhouette(true);
    };

    return (
        <g 
            id={blockId} 
            transform={`translate(${initialCoords.x},${initialCoords.y}) scale(0.68)`} 
            className="g_container"
        >
            {showSilhouette && blockSilhouette(coords, actualHeight, TypeOfBlock.Variable, side)}
            <path 
                d="M 0 4 C 1 0, 0 1, 4 0 L 15 0 V 6 h 20 V 0 H 140 c 0 0, 5.5 1, 4 4 v 25 H 35 v 6 h -20 v -6 h -11 c 0 0, 0 0, -4 -4 Z" 
                stroke="black" 
                fill="#2473b8"
            />

        </g>
    );
};

export default Variable;












            // {/* <rect 
            //     width="40" 
            //     height="40" 
            //     stroke="black"
            //     transform={`translate(0,${-40})`}  
            //     // onMouseEnter={() => {
            //     //     handleOnMouseEnter();
            //     //     setSide("top");
            //     //     console.log("conexion!");
                    
            //     // }}
            //     onMouseMove={() => console.log("moviendoes")}
            //     onMouseLeave={() => setshowSilhouette(false)}
            // /> */}
            //             {/* <rect 
            //     width="40" 
            //     height="40" 
            //     stroke="black" 
            //     transform={`translate(0,${actualHeight})`} 
            //     // onMouseEnter={() => {
            //     //     handleOnMouseEnter();
            //     //     setSide("bottom");
            //     //     console.log("conexion!");
            //     // }}
            //     onMouseOverCapture={() => {
            //         handleOnMouseEnter();
            //         setSide("bottom");
            //         console.log("conexion!");
            //     }}
            //     onMouseLeave={() => setshowSilhouette(false)}
                
            // /> */}