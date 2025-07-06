import { Agent } from "@/types/Agent";
import type { Metadata } from "next";
import Wrapper from "./wrapper";

export const metadata: Metadata = {
  title: "Epoikos Simulation",
  description:
    "Epoikos is a simulation platform for creating and running agent-based simulations.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await fetch(`http://localhost:8000/simulation/${id}`);
  const worldData = await fetch(`http://localhost:8000/simulation/${id}/world`);
  const agentsData = await fetch(
    `http://localhost:8000/simulation/${id}/agent`,
    { next: { tags: ["agents"] } }
  );
  const sim = await data.json();
  const world = await worldData.json();
  const agents: Agent[] = await agentsData.json();

  return (
    <main>
      <Wrapper
        world={world.world_data}
        resources={world.resources_data}
        simulation={sim}
        agents={agents}
      />
    </main>
  );
}
