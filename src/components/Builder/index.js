import React, { useEffect } from "react";
import G6 from "@antv/g6";
import {
  ACCEPTANCE_STATE_NAME,
  INITIAL_STATE_NAME,
} from "../../enums/automata";
import { baseAutomataData } from "./data";

const nodeMenu = new G6.Menu({
  offsetX: 10,
  offsetY: 20,
  itemTypes: ["node"],
  getContent(event) {
    const isInicialState = event.item.getModel().isInitial;
    const isAcceptanceState = event.item.getModel().isAcceptance;

    const outDiv = document.createElement("div");
    outDiv.style.width = "180px";
    outDiv.innerHTML = `<ul class="builder__menu">
        <li><button value="setAsInitial">Definir como${
          isInicialState ? " não " : " "
        }inicial</button></li>
        <li><button value="setAsAcceptance">Definir como estado${
          isAcceptanceState ? " não " : " "
        }final
        </button></li>
        <li><button value="remove">Remover</button></li>
      </ul>`;
    return outDiv;
  },
  handleMenuClick(button, node, graph) {
    return {
      setAsInitial: (node, graph) => {
        const isInitialAlready = node.getModel().isInitial;
        const currentInitialNode = graph.find(
          "node",
          (node) => node.getModel().isInitial
        );

        if (currentInitialNode) {
          graph.updateItem(currentInitialNode, {
            ...currentInitialNode.getModel(),
            isInitial: false,
          });

          currentInitialNode.setState("isInitial", false);
        }

        if (isInitialAlready) return;

        const nodeModel = node.getModel();

        node.setState("isInitial", true);
        graph.updateItem(node, {
          ...nodeModel,
          isInitial: true,
        });
      },
      setAsAcceptance: (node, graph) => {
        const stateName = "isAcceptance";

        node.setState(stateName, !node.hasState(stateName));

        const nodeModel = node.getModel();

        graph.updateItem(node, {
          ...nodeModel,
          isAcceptance: !nodeModel.isAcceptance,
        });
      },
      remove: (node, graph) => {
        graph.removeItem(node);
      },
    }[button.value](node, graph);
  },
});

const edgeMenu = new G6.Menu({
  offsetX: 10,
  offsetY: 20,
  itemTypes: ["edge"],
  getContent() {
    const outDiv = document.createElement("div");
    outDiv.style.width = "180px";
    outDiv.innerHTML = `<ul class="builder__menu">
        <li><button value="edit">Editar</button></li>
        <li><button value="remove">Remover</button></li>
      </ul>`;
    return outDiv;
  },
  handleMenuClick(button, edge, graph) {
    return {
      edit: (edge, graph) => {
        const newLabel = prompt("Transition", "ε");
        graph.updateItem(edge, { ...edge.getModel(), label: newLabel });
      },
      remove: (edge, graph) => {
        graph.removeItem(edge);
      },
    }[button.value](edge, graph);
  },
});

G6.registerNode(
  "state-node",
  {
    // Response the states
    setState(name, value, item) {
      const group = item.getContainer();
      const size = item.getModel().size;

      if (name === "isAcceptance") {
        const acceptanceRingId = "acceptance-ring";

        const acceptanceRing = group.findById(acceptanceRingId);

        if (value) {
          if (acceptanceRing) return;

          group.addShape("circle", {
            attrs: {
              r: size / 2 - 5,
              stroke: "#5F95FF",
            },
            name: "circle-shape",
            id: acceptanceRingId,
          });
        } else {
          if (acceptanceRing) {
            group.removeChild(acceptanceRing);
          }
        }
      }

      if (name === "isInitial") {
        const initialArrowId = "initial-arrow";

        const initialArrow = group.findById(initialArrowId);

        if (value) {
          if (initialArrow) return;
          const radio = size / 2;
          const xPadding = -5;
          const arrowLineThickness = 3;
          const arrowLineSize = 4;
          const arrowHeadWidth = 2;
          group.addShape("polygon", {
            attrs: {
              points: [
                [-arrowLineSize * radio + xPadding, arrowLineThickness],
                [-arrowHeadWidth * radio + xPadding, arrowLineThickness],

                [-arrowHeadWidth * radio + xPadding, radio * 0.75],
                [-radio + xPadding, 0],
                [-arrowHeadWidth * radio + xPadding, -radio * 0.75],

                [-arrowHeadWidth * radio + xPadding, -arrowLineThickness],
                [-arrowLineSize * radio + xPadding, -arrowLineThickness],
              ],
              fill: "red",
            },
            name: "polygon-shape",
            id: initialArrowId,
          });
        } else {
          if (initialArrow) group.removeChild(initialArrow);
        }
      }
    },
  },
  "circle"
);

// TODO: Handle touch devices
G6.registerBehavior("click-add-node", {
  getEvents() {
    return {
      "canvas:click": "onClick",
    };
  },
  // Click event
  onClick(ev) {
    const self = this;
    const graph = self.graph;

    graph.addItem("node", {
      x: ev.canvasX,
      y: ev.canvasY,
      id: `node-${graph.cfg.nodes.length + 1}`,
      label: `q${graph.cfg.nodes.length + 1}`,
      type: "state-node",
    });
  },
});

export default function AutomataBuilder() {
  const ref = React.useRef(null);
  let graph = null;

  function hasDuplicatedEdge(edge) {
    const siblings = edge.getSource().getOutEdges();
    const edgeModel = edge.getModel();
    const edgeLabel = edgeModel.label;

    return siblings?.some((sibling) => {
      const siblingModel = sibling.getModel();
      const sameEdge = siblingModel.id === edgeModel.id;
      if (sameEdge) return false;

      const sameLabel = siblingModel.label === edgeLabel;
      const sameTarget =
        sibling.getTarget().getID() === edge.getTarget().getID();

      return sameLabel && sameTarget;
    });
  }

  useEffect(() => {
    if (!graph) {
      graph = new G6.Graph({
        container: ref.current,
        // width: 500,
        height: 900,
        modes: {
          default: [
            { type: "drag-canvas" },
            { type: "zoom-canvas" },
            { type: "drag-node" },
            { type: "create-edge" },
            { type: "click-add-node" },
          ],
        },
        layout: {
          type: "dagre",
          rankdir: "LR", // Direction: Left to right
          nodesep: 200, // PX between nodes
          ranksep: 100,
          preventOverlap: true,
        },
        defaultNode: {
          type: "state-node",
          size: 42,
        },
        defaultEdge: {
          type: "quadratic",
          labelCfg: {
            refY: 10,
            style: {
              fill: "#f2f0f0",
              fontWeight: "bold",
            },
          },
          style: {
            stroke: "#ffb203",
            lineWidth: 3,
            endArrow: {
              path: G6.Arrow.triangle(6, 6, 12),
              d: 12,
              stroke: "red",
              fill: "red",
            },
          },
        },
        plugins: [nodeMenu, edgeMenu],
      });
    }

    graph.on("aftercreateedge", ({ edge }) => {
      const label = prompt("Transition", "ε");
      graph.updateItem(edge, { label });

      if (hasDuplicatedEdge(edge)) {
        setTimeout(() => {
          graph.removeItem(edge);
        }, 0);
        return;
      }

      const edges = graph.save().edges;
      G6.Util.processParallelEdges(edges, 42);

      graph.getEdges().forEach((edge, i) => {
        graph.updateItem(edge, {
          curveOffset: edges[i].curveOffset,
          curvePosition: edges[i].curvePosition,
        });
      });
    });

    graph.data({
      nodes: baseAutomataData.nodes,
      edges: baseAutomataData.edges.map((edge) => ({
        ...edge,
        type: edge.source === edge.target ? "loop" : edge.type || "quadratic",
      })),
    });

    graph.render();

    // Set node state for styling
    graph.getNodes().forEach((node) => {
      const nodeModel = node.getModel();

      if (nodeModel.isInitial) node.setState("isInitial", true);
      if (nodeModel.isAcceptance) node.setState("isAcceptance", true);
    });
  }, []);

  return (
    <>
      <div ref={ref}></div>
      <button onClick={() => console.log(graph.save())}>Save</button>
    </>
  );
}
