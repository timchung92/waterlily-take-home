import { fullName, isNullUndefinedOrEmpty, logError, maxOf, SupportProviderContribution, SupportProviderType, } from "@shared";
import { Node, Edge, MarkerType } from "reactflow";

export function createGraph(client: Client, supportProviderSet: SupportProviderSet) {
  const { clientId } = client;
  const { supportProviders } = supportProviderSet;
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  let x: number = 50;
  let y: number = 0;

  if (isNullUndefinedOrEmpty(supportProviders)) {
    return { nodes, edges };
  }

  const nodesPerLevel: ObjectMap<number> = {};
  let maxCareLevel = 0;

  supportProviders.forEach(({ supportProviderCareLevel }) => {
    if(supportProviderCareLevel > maxCareLevel) {
      maxCareLevel = supportProviderCareLevel
    }
    nodesPerLevel[ supportProviderCareLevel ] = (nodesPerLevel[ supportProviderCareLevel ] ?? 0) + 1;
  });

  const maxNodesInOneCareLevel = maxOf(Object.values(nodesPerLevel));
  let xByIndex: number[];

  switch (maxNodesInOneCareLevel) {
    case 1:
      xByIndex = [ 0.5 ];
      break;

    case 2:
      xByIndex = [ 0.33, 0.66 ];
      break

    case 3:
    default: // we can't fit more and I've never seen a structure with more than 2 nodes per level
      xByIndex = [ 0.25, 0.5, 0.75 ];
      break;
  }

    nodes.push({
    id: "node00",
    position: { x: 0.5, y: 0 },
    type: "mainNode",
    data: {
      supportProviderId: 'node00',
      supportProviderName: fullName(client),
      supportProviderCareLevel: 0,
      supportProviderType: SupportProviderType.self,
      supportProviderContribution: SupportProviderContribution.physicalCaregiver,
      clientId,
    } as SupportProvider,
  } as Node);

  const yStep = 1 / (maxCareLevel + 1);

  let currentcareLevel = 0;
  let currentNodeInLevel = 0;

  supportProviders.forEach(supportProvider => {

    const { supportProviderCareLevel: careLevel } = supportProvider;

    if (careLevel === currentcareLevel) {
      x = xByIndex[++currentNodeInLevel];
    } else {
      currentNodeInLevel = 0;
      x = xByIndex[currentNodeInLevel];
      y += yStep;
      currentcareLevel = careLevel;
    }

    nodes.push({
      id: `node${ careLevel }${ currentNodeInLevel }`,
      position: { x, y },
      data: supportProvider,
      type: careLevel % 2 === 0 ? "alternateNode" : "childNode",
    } as Node);
    let edgeId = `edge-${ careLevel }${ currentNodeInLevel }-${ careLevel - 1 }0`;
    edges.push({
      id: edgeId,
      source: `node${ careLevel }${ currentNodeInLevel }`,
      target: `node${ careLevel - 1 }0`,
      type: "step",
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  });

  return { nodes, edges };
}