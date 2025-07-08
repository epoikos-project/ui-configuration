import React, { useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAgent } from "../hooks/useAgent";
import { useSimulation } from "../hooks/useSimulation";
import {
  Button,
} from "@mui/material";

import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

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
        const newNodes = data.nodes.map((n) => ({
          id: n.id,
          data: { label: n.label },
        }));
        const newEdges = data.edges.map((e) => ({
          id: `e-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: `s:${e.sentiment.toFixed(2)}, c:${e.count}`,
        }));
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          newNodes,
          newEdges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        console.error(err);
      }
    }
    fetchGraph();
  }, [simulation.id, simulation.tick, agent.id, setNodes, setEdges]);

  const onLayout = useCallback(
    (direction: "TB" | "LR") => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    [nodes, edges, setNodes, setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        colorMode="dark"
        fitView
      >
        <Panel position="top-right">
          <Button className="xy-theme__button" onClick={() => onLayout("TB")}>vertical layout</Button>
          <Button className="xy-theme__button" onClick={() => onLayout("LR")}>horizontal layout</Button>
        </Panel>
        <Background />
      </ReactFlow>
    </div>
  );
}
