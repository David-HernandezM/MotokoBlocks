import { Path } from "@dfinity/agent/lib/cjs/canisterStatus";
import { Type } from "@dfinity/candid/lib/cjs/idl";
import { ReactNode } from "react";

export type IntVal = {
    IntVal: number;
};

export type NatVal = {
    NatVal: number;
};

export type FloatVal = {
    FloatVar: number;
};

export type StringVal = {
    StringVal: string;
};

export type BooleanVal = {
    BooleanVal: boolean
};

export type SideSilhouette = "top" | "bottom" | "left";

export enum VariableTypes {
    Int,
    Nat,
    Float,
    String,
    Boolean,
    UnitValue
}

export interface VariableData {
    variableName: string;
    isStable: boolean;
    isMutable: boolean;
    varValue: any;
    varType: VariableTypes;
    isParameter: boolean;
};

export enum TypeOfBlock {
    Variable,
    If,
    None,
}

export function blockSilhouette(coords: {x: number; y: number}, sizeBlock: number, typeBlock: TypeOfBlock, side: SideSilhouette): ReactNode {
    let positiony = 0;
    let positionx = 0;
    switch (typeBlock) {
        case (TypeOfBlock.Variable):
            switch (side) {
                case ("top"):
                    positiony = 35;
                case ("bottom"):
                    positiony = sizeBlock;
            }
            return (
                <path 
                    d="M 0 4 C 1 0, 0 1, 4 0 L 15 0 V 6 h 20 V 0 H 140 c 0 0, 5.5 1, 4 4 v 25 H 35 v 6 h -20 v -6 h -11 c 0 0, 0 0, -4 -4 Z"  
                    transform={`translate(${positionx},${positiony})`}
                    fill="#80808094"
                />
            );
        default:
            return null;
    }
}