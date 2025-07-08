"use server";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function startSimulation(id: string) {
  await fetch(`${BASEURL}/orchestrator/start/${id}`, { method: "POST" });
}
export async function stopSimulation(id: string) {
  await fetch(`${BASEURL}/orchestrator/stop/${id}`, { method: "POST" });
}

export async function tickSimulation(id: string) {
  await fetch(`${BASEURL}/orchestrator/tick/${id}`, { method: "POST" });
}

export async function getAgent(simulation_id: string, id: string) {
  const response = await fetch(
    `${BASEURL}/simulation/${simulation_id}/agent/${id}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) {
    console.error(
      `Failed to fetch agent ${id} for simulation ${simulation_id}:`,
      response.statusText
    );
    throw new Error("Failed to fetch agent");
  }
  return response.json();
}

export async function moveAgent(
  simulation_id: string,
  agent_id: string,
  x: number,
  y: number
) {
  await fetch(`${BASEURL}/simulation/${simulation_id}/agent/${agent_id}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ x_coord: x, y_coord: y }),
  });
}
