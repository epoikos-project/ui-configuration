"use server";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function startSimulation(id: string) {
  await fetch(`${BASEURL}/orchestrator/start/${id}`, { method: 'POST' });
}
export async function stopSimulation(id: string) {
  await fetch(`${BASEURL}/orchestrator/stop/${id}`, { method: 'POST' });
}

export async function tickSimulation(id: string) {
  await fetch(`${BASEURL}/orchestrator/tick/${id}`, { method: 'POST' });
}
