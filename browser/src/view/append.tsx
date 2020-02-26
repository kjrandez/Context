import React, {ReactElement} from 'react';
import {Store} from '../store';
import {DropNode} from './dragDrop';

export default function AppendButton(props: {store: Store, path: number[]}): ReactElement {
    return(
        <DropNode append={true} {...props}>
            <div className="element"> {/* for consistency only */}
                <div className="element-content leaf">
                    <button style={{marginLeft: "0px"}}>+ Insert</button>
                </div>
            </div>
        </DropNode>
    )
}
