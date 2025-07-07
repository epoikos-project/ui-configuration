import React, { useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAgent } from "../hooks/useAgent";
import { useSimulation } from "../hooks/useSimulation";

export function RelationshipGraph() {
  const { agent } = useAgent();
  const { simulation } = useSimulation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    async function fetchGraph() {
      const params = new URLSearchParams();
      params.set("agent_id", agent.id);
      const url = `http://localhost:8000/simulation/${simulation.id}/relationship_graph?${params}`;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data: {
          nodes: Array<{ id: string; label: string }>;
          edges: Array<{ source: string; target: string; sentiment: number; count: number }>;
        } = await res.json();
        // simple circular layout
        const radius = 150;
        const cx = 150;
        const cy = 150;
        const total = data.nodes.length;
        const newNodes = data.nodes.map((n, i) => ({
          id: n.id,
          position: {
            x: cx + radius * Math.cos((2 * Math.PI * i) / total),
            y: cy + radius * Math.sin((2 * Math.PI * i) / total),
          },
          data: { label: n.label },
        }));
        const newEdges = data.edges.map((e) => ({
          id: `e-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: `s:${e.sentiment}, c:${e.count}`,
        }));
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error(err);
      }
    }
    fetchGraph();
  }, [simulation.id, simulation.tick, agent.id, setNodes, setEdges]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        colorMode="dark"
      />
    </div>
  );
}
