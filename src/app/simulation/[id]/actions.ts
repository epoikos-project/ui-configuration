"use server";

export async function startSimulation(id: string) {
  await fetch(`http://localhost:8000/simulation/${id}/start`, {
    method: "POST",
  });
}
export async function stopSimulation(id: string) {
  await fetch(`http://localhost:8000/simulation/${id}/stop`, {
    method: "POST",
  });
}
