import Head from "next/head";

import { Agent } from "@/types/Agent";
import Wrapper from "./wrapper";

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
  );
  const sim = await data.json();
  const world = await worldData.json();
  const agents: Agent[] = await agentsData.json();

  return (
    <>
      <Head>
        <title>Phaser Nextjs Template</title>
        <meta
          name="description"
          content="A Phaser 3 Next.js project template that demonstrates Next.js with React communication and uses Vite for bundling."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main>
        <Wrapper world={world.world_data} simulation={sim} agents={agents} />
      </main>
    </>
  );
}
