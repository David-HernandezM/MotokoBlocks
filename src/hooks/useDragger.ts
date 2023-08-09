import React, { useEffect, useRef } from "react";
import { TypeOfBlock } from "../components/Blocks/BlocksTypes/Utils";

type CoordsType = {
    startX: number,
    startY: number,
    lastX: number,
    lastY: number
}

interface UseDraggerProps {
    blockId: string;
    setNewCoords: (setCoords: {x: number, y: number}) => void;
    setIsHolding: (holding: boolean) => void;
    initialCoords: {x: number; y: number};
    mouseEnterInVariable: (enter: boolean) => void;
    isHolding: boolean;
}

function useDragger({blockId, setNewCoords, setIsHolding, isHolding, initialCoords, mouseEnterInVariable}: UseDraggerProps): void {
    const isClicked = useRef<boolean>(false);

    const coords = useRef<CoordsType>({
      startX: initialCoords.x, 
      startY: initialCoords.y,
      lastX: initialCoords.x,
      lastY: initialCoords.y
    });
  
    useEffect(() => {
        const target = document.getElementById(blockId);
        let nextX = initialCoords.x;
        let nextY = initialCoords.y;

        if (!target) throw new Error("Element with given id " + blockId + "doesn't exist")

        const container = target.parentElement;

        if (!container) throw new Error("Target element must have a parent");

        const onMouseDown = (e: MouseEvent) => {
            isClicked.current = true;
            coords.current.startX = e.clientX;
            coords.current.startY = e.clientY;
            setIsHolding(true);
        };

        const onMouseUp = (e: MouseEvent) => {
            isClicked.current = false;
            coords.current.lastX = nextX;
            coords.current.lastY = nextY;
            setIsHolding(false);
            setNewCoords ({
                x: nextX,
                y: nextY
            });
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isClicked.current) return;
            if (isHolding) {
                console.log("Already holding!!");
                return;
            };
            nextX = e.clientX - coords.current.startX + coords.current.lastX;
            nextY = e.clientY - coords.current.startY + coords.current.lastY;
            target.setAttribute("transform", `translate(${nextX},${nextY}) scale(0.68)`);
        };

        const onMouseEnter = () => {
            mouseEnterInVariable(true);
        }

        target.addEventListener('mousedown', onMouseDown);
        target.addEventListener('mouseup', onMouseUp);
        target.addEventListener('mouseenter', onMouseEnter);
        
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseUp);

        const cleanup = () => {
        target.removeEventListener('mousedown', onMouseDown);
        target.removeEventListener('mouseup', onMouseUp);
        target.removeEventListener('mouseenter', onMouseEnter);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mousemove', onMouseUp);
    };

        return cleanup;
    }, [blockId]);
}

export default useDragger;