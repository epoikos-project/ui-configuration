"use client"

import Head from "next/head";
import dynamic from "next/dynamic";


const AppWithoutSSR = dynamic(() => import("./app"), { ssr: false });
const NatsSubscriber = dynamic(() => import("./NatsSubscriber"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>Phaser Nextjs Template</title>
                <meta name="description" content="A Phaser 3 Next.js project template that demonstrates Next.js with React communication and uses Vite for bundling." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <NatsSubscriber/>
                <AppWithoutSSR />
            </main>
        </>
    );
}

