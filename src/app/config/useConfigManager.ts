"use client";

import { useState, useEffect, useCallback } from "react";
import type { UnifiedConfig, Simulation, AgentType } from "./types";

/**
 * Hook managing fetching, CRUD operations, and dialog state for configurations
 * and simulations.
 *
 * @param baseUrl Base URL of the backend API
 */
export function useConfigManager(baseUrl: string) {
  const [configList, setConfigList] = useState<UnifiedConfig[]>([]);
  const [simList, setSimList] = useState<Simulation[]>([]);
  const [availableModels, setAvailableModels] = useState<
    { id: string; name: string }[]
  >([]);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const [editingConfig, setEditingConfig] = useState<UnifiedConfig | null>(
    null
  );
  const [isDialogOpen, setDialogOpen] = useState(false);

  const fetchConfigurations = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/configuration/`);
      if (!res.ok) throw new Error(res.statusText || "Fetch failed");
      setConfigList(await res.json());
    } catch (err) {
      console.error("useConfigManager: fetchConfigurations", err);
      setStatusMessage("Failed to fetch configurations");
    }
  }, [baseUrl]);

  const fetchSimulations = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/simulation/`);
      if (!res.ok) throw new Error(res.statusText || "Fetch failed");
      const data = await res.json();
      setSimList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("useConfigManager: fetchSimulations", err);
      setStatusMessage("Failed to fetch simulations");
      setSimList([]);
    }
  }, [baseUrl]);

  const fetchAvailableModels = useCallback(async () => {
    try {
      const r = await fetch(`${baseUrl}/configuration/models`);
      if (!r.ok) throw new Error("fetch failed");
      const data = await r.json();
      setAvailableModels(data);
    } catch (e) {
      console.error("Failed to fetch available models", e);
      return [];
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchConfigurations();
    fetchSimulations();
    fetchAvailableModels();
  }, [fetchConfigurations, fetchSimulations, fetchAvailableModels]);

  /** Open the add/edit configuration dialog. */
  const openDialog = (cfg?: UnifiedConfig) => {
    setEditingConfig(cfg ?? null);
    setDialogOpen(true);
  };

  /** Close the configuration dialog and reset editing state. */
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
  };

  /** Create or update a configuration via the API. */
  const saveConfig = async (
    name: string,
    agents: AgentType[],
    worldState: UnifiedConfig["settings"]["world"]
  ) => {
    if (!name.trim()) {
      alert("Please provide a configuration name.");
      return;
    }
    try {
      const payload: UnifiedConfig = {
        id: editingConfig?.id || Date.now().toString(),
        name,
        agents,
        settings: { world: worldState },
      };
      const res = await fetch(`${baseUrl}/configuration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText || "Save failed");
      await fetchConfigurations();
      setStatusMessage(`Configuration '${name}' saved.`);
      closeDialog();
    } catch (err) {
      console.error("useConfigManager: saveConfig", err);
      setStatusMessage("Error saving configuration");
    }
  };

  /** Launch a simulation based on a configuration name. */
  const launchConfig = async (name: string) => {
    try {
      const res = await fetch(
        `${baseUrl}/orchestrator/initialize/${encodeURIComponent(name)}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(res.statusText || "Initialize failed");
      const data = await res.json();
      const simId = data.simulation_id || data.id;
      if (!simId) throw new Error("No simulation ID returned");
      await fetchSimulations();
      window.open(`/simulation/${simId}`, "_blank");
    } catch (err) {
      console.error("useConfigManager: launchConfig", err);
      setStatusMessage("Error launching simulation");
    }
  };

  /** Delete a saved configuration. */
  const deleteConfig = async (name: string) => {
    try {
      const res = await fetch(
        `${baseUrl}/configuration/${encodeURIComponent(name)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || res.statusText);
      await fetchConfigurations();
      setStatusMessage(data.message || `Configuration '${name}' deleted.`);
    } catch (err) {
      console.error("useConfigManager: deleteConfig", err);
      setStatusMessage("Error deleting configuration");
    }
  };

  /** Open an existing simulation in a new tab. */
  const openSimulation = (id: string) => {
    window.open(`/simulation/${id}`, "_blank");
  };

  /** Delete an active simulation. */
  const deleteSimulation = async (id: string) => {
    try {
      const res = await fetch(
        `${baseUrl}/simulation/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || res.statusText);
      await fetchSimulations();
      setStatusMessage(data.message || `Simulation '${id}' deleted.`);
    } catch (err) {
      console.error("useConfigManager: deleteSimulation", err);
      setStatusMessage("Error deleting simulation");
    }
  };

  return {
    configList,
    availableModels,
    simList,
    statusMessage,
    editingConfig,
    isDialogOpen,
    openDialog,
    closeDialog,
    saveConfig,
    launchConfig,
    deleteConfig,
    openSimulation,
    deleteSimulation,
    fetchConfigurations,
    fetchSimulations,
  };
}
