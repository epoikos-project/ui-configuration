"use client"
import { useRef } from 'react';
import { IRefPhaserGame, PhaserSimulation } from './game/PhaserSimulation';


function App()
{

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <PhaserSimulation ref={phaserRef}/>
        </div>
    )
}

export default App
