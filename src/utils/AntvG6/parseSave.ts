import { GraphData } from "@antv/g6";

function parseSave(payload: GraphData) {
  return {
    nodes: (payload.nodes || []).map(
      ({ id, isInitial = false, isAcceptance = false, label }) => ({
        id,
        isInitial,
        isAcceptance,
        label,
      })
    ),
    edges: (payload.edges || []).map(({ id, source, target, label }) => ({
      id,
      source,
      target,
      label,
    })),
  };
}

export { parseSave };
