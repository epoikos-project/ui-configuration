"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";

type Attribute = { name: string; value: number };

export default function ConfigPage() {
  // Basic configuration
  const [simulationName, setSimulationName] = useState("");
  const [numAgents, setNumAgents] = useState(100);
  const [globalAssumptions, setGlobalAssumptions] = useState("");

  // Generation mode: "uniform", "override", or "normal"
  const [generationMode, setGenerationMode] = useState<"uniform" | "override" | "normal">("uniform");

  // Uniform configuration: traits, IQ, and other attributes
  const [uniformTraits, setUniformTraits] = useState<string[]>([]);
  const [agentIQ, setAgentIQ] = useState(100);
  const [uniformAttributes, setUniformAttributes] = useState<Attribute[]>([]);

  // Normal distribution configuration for IQ
  const [iqMean, setIqMean] = useState(100);
  const [iqStdDev, setIqStdDev] = useState(15);

  // Override configuration: separate settings for one agent
  const [overrideTraits, setOverrideTraits] = useState<string[]>([]);
  const [overrideIQ, setOverrideIQ] = useState(100);
  const [overrideAttributes, setOverrideAttributes] = useState<Attribute[]>([]);

  // Handlers for uniform traits
  const addUniformTrait = () => setUniformTraits([...uniformTraits, ""]);
  const updateUniformTrait = (i: number, value: string) => {
    const newTraits = [...uniformTraits];
    newTraits[i] = value;
    setUniformTraits(newTraits);
  };
  const removeUniformTrait = (i: number) => setUniformTraits(uniformTraits.filter((_, idx) => idx !== i));

  // Handlers for uniform attributes
  const addUniformAttribute = () => setUniformAttributes([...uniformAttributes, { name: "", value: 0 }]);
  const updateUniformAttributeName = (i: number, name: string) => {
    const newAttrs = [...uniformAttributes];
    newAttrs[i].name = name;
    setUniformAttributes(newAttrs);
  };
  const updateUniformAttributeValue = (i: number, value: number) => {
    const newAttrs = [...uniformAttributes];
    newAttrs[i].value = value;
    setUniformAttributes(newAttrs);
  };
  const removeUniformAttribute = (i: number) => setUniformAttributes(uniformAttributes.filter((_, idx) => idx !== i));

  // Handlers for override traits
  const addOverrideTrait = () => setOverrideTraits([...overrideTraits, ""]);
  const updateOverrideTrait = (i: number, value: string) => {
    const newTraits = [...overrideTraits];
    newTraits[i] = value;
    setOverrideTraits(newTraits);
  };
  const removeOverrideTrait = (i: number) => setOverrideTraits(overrideTraits.filter((_, idx) => idx !== i));

  // Handlers for override attributes
  const addOverrideAttribute = () => setOverrideAttributes([...overrideAttributes, { name: "", value: 0 }]);
  const updateOverrideAttributeName = (i: number, name: string) => {
    const newAttrs = [...overrideAttributes];
    newAttrs[i].name = name;
    setOverrideAttributes(newAttrs);
  };
  const updateOverrideAttributeValue = (i: number, value: number) => {
    const newAttrs = [...overrideAttributes];
    newAttrs[i].value = value;
    setOverrideAttributes(newAttrs);
  };
  const removeOverrideAttribute = (i: number) => setOverrideAttributes(overrideAttributes.filter((_, idx) => idx !== i));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const config = {
      simulationName,
      numAgents,
      globalAssumptions,
      generationMode,
      uniform: {
        traits: uniformTraits,
        IQ: agentIQ,
        attributes: uniformAttributes,
      },
      normalIQ: {
        mean: iqMean,
        stdDev: iqStdDev,
      },
      override: {
        traits: overrideTraits,
        IQ: overrideIQ,
        attributes: overrideAttributes,
      },
    };
    console.log(config);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen p-8 pb-20 gap-16 sm:p-16 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold">Simulation Configuration</h1>
        <Image src="/simulation-logo.svg" alt="Simulation Logo" width={100} height={50} />
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          {/* Basic Configuration */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Simulation Name</label>
            <input
              type="text"
              value={simulationName}
              onChange={(e) => setSimulationName(e.target.value)}
              placeholder="Enter simulation name"
              className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Number of Agents</label>
            <input
              type="number"
              value={numAgents}
              onChange={(e) => setNumAgents(parseInt(e.target.value))}
              min="1"
              className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Global Assumptions</label>
            <textarea
              value={globalAssumptions}
              onChange={(e) => setGlobalAssumptions(e.target.value)}
              placeholder="Enter global assumptions"
              rows={3}
              className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Agent Generation Mode */}
          <div>
            <label className="font-semibold">Agent Generation Mode</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="uniform"
                  checked={generationMode === "uniform"}
                  onChange={(e) => setGenerationMode(e.target.value as "uniform" | "override" | "normal")}
                />
                Uniform
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="override"
                  checked={generationMode === "override"}
                  onChange={(e) => setGenerationMode(e.target.value as "uniform" | "override" | "normal")}
                />
                Single Override
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="normal"
                  checked={generationMode === "normal"}
                  onChange={(e) => setGenerationMode(e.target.value as "uniform" | "override" | "normal")}
                />
                Normal Distribution
              </label>
            </div>
          </div>

          {/* Uniform & Override: Default Agent Configuration */}
          {(generationMode === "uniform" || generationMode === "override") && (
            <fieldset className="border p-4 rounded">
              <legend className="font-semibold">Default Agent Configuration</legend>
              {/* Uniform Traits */}
              <div>
                <p className="font-semibold">Traits (Text)</p>
                {uniformTraits.map((trait, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={trait}
                      onChange={(e) => updateUniformTrait(index, e.target.value)}
                      placeholder={`Trait ${index + 1}`}
                      className="flex-1 rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeUniformTrait(index)}
                      className="text-red-600 hover:underline"
                      aria-label="Remove trait"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addUniformTrait}
                  className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <span className="text-xl">+</span> Add Trait
                </button>
              </div>

              {/* IQ for Uniform/Override mode */}
              {generationMode !== "normal" && (
                <div className="flex flex-col mt-4">
                  <label className="mb-1 font-semibold">Agent IQ</label>
                  <input
                    type="number"
                    value={agentIQ}
                    onChange={(e) => setAgentIQ(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Additional Attributes for Uniform/Override */}
              <div className="mt-4">
                <p className="font-semibold">Additional Attributes (Numeric)</p>
                {uniformAttributes.map((attr, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => updateUniformAttributeName(index, e.target.value)}
                      placeholder="Attribute name"
                      className="flex-1 rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={attr.value}
                      onChange={(e) =>
                        updateUniformAttributeValue(index, parseFloat(e.target.value))
                      }
                      placeholder="Value"
                      className="w-24 rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeUniformAttribute(index)}
                      className="text-red-600 hover:underline"
                      aria-label="Remove attribute"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addUniformAttribute}
                  className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <span className="text-xl">+</span> Add Attribute
                </button>
              </div>
            </fieldset>
          )}

          {/* Normal Distribution IQ Configuration */}
          {generationMode === "normal" && (
            <fieldset className="border p-4 rounded">
              <legend className="font-semibold">IQ Configuration (Normal Distribution)</legend>
              <div className="flex flex-col mt-2">
                <label className="mb-1 font-semibold">IQ Mean</label>
                <input
                  type="number"
                  value={iqMean}
                  onChange={(e) => setIqMean(parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col mt-4">
                <label className="mb-1 font-semibold">IQ Standard Deviation</label>
                <input
                  type="number"
                  value={iqStdDev}
                  onChange={(e) => setIqStdDev(parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </fieldset>
          )}

          {/* Override Configuration Section */}
          {generationMode === "override" && (
            <fieldset className="border p-4 rounded">
              <legend className="font-semibold">Override Agent Configuration</legend>
              {/* Override Traits */}
              <div>
                <p className="font-semibold">Traits (Text)</p>
                {overrideTraits.map((trait, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={trait}
                      onChange={(e) => updateOverrideTrait(index, e.target.value)}
                      placeholder={`Trait ${index + 1}`}
                      className="flex-1 rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOverrideTrait(index)}
                      className="text-red-600 hover:underline"
                      aria-label="Remove trait"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOverrideTrait}
                  className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <span className="text-xl">+</span> Add Trait
                </button>
              </div>
              {/* Override IQ */}
              <div className="flex flex-col mt-4">
                <label className="mb-1 font-semibold">Override Agent IQ</label>
                <input
                  type="number"
                  value={overrideIQ}
                  onChange={(e) => setOverrideIQ(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {/* Override Additional Attributes */}
              <div className="mt-4">
                <p className="font-semibold">Additional Attributes (Numeric)</p>
                {overrideAttributes.map((attr, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => updateOverrideAttributeName(index, e.target.value)}
                      placeholder="Attribute name"
                      className="flex-1 rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={attr.value}
                      onChange={(e) =>
                        updateOverrideAttributeValue(index, parseFloat(e.target.value))
                      }
                      placeholder="Value"
                      className="w-24 rounded border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOverrideAttribute(index)}
                      className="text-red-600 hover:underline"
                      aria-label="Remove attribute"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOverrideAttribute}
                  className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <span className="text-xl">+</span> Add Attribute
                </button>
              </div>
            </fieldset>
          )}

          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save Configuration
          </button>
        </form>

        {/* Preview */}
        <div className="w-full mt-8">
          <h2 className="text-xl font-semibold mb-2">Current Configuration:</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs font-mono">
            {JSON.stringify(
              {
                simulationName,
                numAgents,
                globalAssumptions,
                generationMode,
                uniform: {
                  traits: uniformTraits,
                  IQ: agentIQ,
                  attributes: uniformAttributes,
                },
                normalIQ: {
                  mean: iqMean,
                  stdDev: iqStdDev,
                },
                override: {
                  traits: overrideTraits,
                  IQ: overrideIQ,
                  attributes: overrideAttributes,
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-center items-center py-4 w-full border-t">
        <p className="text-sm text-gray-500">
          &copy; 2025 Simulation Project. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
