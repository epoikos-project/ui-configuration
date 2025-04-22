import React, { useCallback } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useAgent } from "../hooks/useAgent";

export function RelationshipGraph() {
  const { agent } = useAgent();
  const initialNodes = [
    { id: agent.id, position: { x: 75, y: 75 }, data: { label: agent.name } },
    { id: "2", position: { x: 75, y: 150 }, data: { label: "Sophie" } },
  ];
  const initialEdges = [{ id: "e1-2", source: agent.id, target: "2" }];
  return (
    <div style={{ width: 300, height: 300 }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} colorMode="dark" />
    </div>
  );
}
