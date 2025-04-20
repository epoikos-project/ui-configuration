"use client";

import { useState } from "react";

export default function Test() {
  const [counter, setCounter] = useState(0);

  const increaseCounter = () => {
    setCounter(counter + 1);
  };

  return (
    <div>
      <div>{counter}</div>
      <button onClick={increaseCounter} style={{ cursor: "pointer" }}>
        Increase
      </button>
    </div>
  );
}
