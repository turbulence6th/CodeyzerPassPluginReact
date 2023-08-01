import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "..";
import { Skeleton } from "primereact/skeleton";
import { BlockUI } from 'primereact/blockui';

interface YukleniyorProps {
    children: JSX.Element | JSX.Element[]
    height?: string
    width?: string
    className?: string
    tip: 'iskelet' | 'engelle'
}

const Yukleniyor = ({ children, height, width, tip, className }: YukleniyorProps) => {
    const yukleniyor = useSelector((state: RootState) => state.codeyzerHafizaReducer.yukleniyor);

    let icerik = children;
    if (yukleniyor) {
        if (tip === 'iskelet') {
            icerik = <Skeleton className="w-full h-full"></Skeleton>;
        } else if (tip === 'engelle') {
            icerik = <BlockUI blocked={true} containerClassName="w-full h-full"> {children} </BlockUI>
        }
    }
    
    return (
        <div style={{ height: height, width: width }} className={className}>
            { icerik }
        </div>
    );
};

export default Yukleniyor;