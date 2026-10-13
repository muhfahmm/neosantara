type MapPosition = number[];
type MapRing = MapPosition[];

interface WorldMapFeature {
  properties?: Record<string, unknown>;
  geometry?: {
    type: string;
    coordinates: unknown;
  } | null;
}

function mergeCountryRings(first: MapRing, second: MapRing): MapRing {
  const pendingEdges = new Map<string, number>();
  const edgeKey = (from: MapPosition, to: MapPosition) =>
    `${from.join(',')}|${to.join(',')}`;

  [first, second].forEach(ring => {
    for (let index = 1; index < ring.length; index += 1) {
      const from = ring[index - 1];
      const to = ring[index];
      const key = edgeKey(from, to);
      const reverseKey = edgeKey(to, from);
      const reverseCount = pendingEdges.get(reverseKey) || 0;

      if (reverseCount > 0) {
        pendingEdges.set(reverseKey, reverseCount - 1);
      } else {
        pendingEdges.set(key, (pendingEdges.get(key) || 0) + 1);
      }
    }
  });

  const remainingEdges: Array<{ from: MapPosition; to: MapPosition }> = [];
  pendingEdges.forEach((count, key) => {
    if (count === 0) return;
    const [from, to] = key.split('|').map(position =>
      position.split(',').map(Number)
    );
    for (let index = 0; index < count; index += 1) {
      remainingEdges.push({ from, to });
    }
  });

  const outgoingEdges = new Map<string, { from: MapPosition; to: MapPosition }>();
  remainingEdges.forEach(edge => {
    const key = edge.from.join(',');
    if (outgoingEdges.has(key)) {
      throw new Error(`Cannot merge country borders: ambiguous boundary at ${key}.`);
    }
    outgoingEdges.set(key, edge);
  });

  const firstEdge = remainingEdges[0];
  if (!firstEdge) throw new Error('Cannot merge country borders: no exterior edges remain.');

  const mergedRing: MapRing = [firstEdge.from];
  let currentEdge: typeof firstEdge | undefined = firstEdge;
  while (currentEdge) {
    mergedRing.push(currentEdge.to);
    outgoingEdges.delete(currentEdge.from.join(','));
    if (currentEdge.to.join(',') === mergedRing[0].join(',')) break;

    currentEdge = outgoingEdges.get(currentEdge.to.join(','));
    if (mergedRing.length > remainingEdges.length + 1) {
      throw new Error('Cannot merge country borders: exterior boundary contains a loop.');
    }
  }

  if (
    !currentEdge ||
    outgoingEdges.size > 0 ||
    mergedRing.length !== remainingEdges.length + 1
  ) {
    throw new Error('Cannot merge country borders: exterior boundary is not a closed ring.');
  }

  return mergedRing;
}

function getPolygonCoordinates(feature: WorldMapFeature): MapRing[] {
  if (feature.geometry?.type !== 'Polygon' || !Array.isArray(feature.geometry.coordinates)) {
    throw new Error('Cannot merge country borders: expected Polygon geometry.');
  }

  const coordinates = feature.geometry.coordinates as unknown[];
  const rings = coordinates.map(ring => {
    if (
      !Array.isArray(ring) ||
      !ring.every(position =>
        Array.isArray(position) &&
        position.length >= 2 &&
        position.every(coordinate => typeof coordinate === 'number')
      )
    ) {
      throw new Error('Cannot merge country borders: invalid polygon ring.');
    }
    return ring as MapRing;
  });

  if (!rings[0]) throw new Error('Cannot merge country borders: polygon has no exterior ring.');
  return rings;
}

export function mergeClaimedTerritories(features: WorldMapFeature[]): WorldMapFeature[] {
  const territoryPairs = [
    { country: 'Somalia', territory: 'Somaliland' },
    { country: 'Morocco', territory: 'Western Sahara' },
  ];
  const removedFeatures = new Set<WorldMapFeature>();

  territoryPairs.forEach(({ country, territory }) => {
    const countryFeature = features.find(feature => feature.properties?.ADMIN === country);
    const territoryFeature = features.find(feature => feature.properties?.ADMIN === territory);

    if (!countryFeature || !territoryFeature) {
      throw new Error(`Cannot merge ${territory} into ${country}: map feature is missing.`);
    }

    const countryRings = getPolygonCoordinates(countryFeature);
    const territoryRings = getPolygonCoordinates(territoryFeature);
    const exteriorRing = mergeCountryRings(countryRings[0], territoryRings[0]);

    countryFeature.geometry = {
      type: 'Polygon',
      coordinates: [
        exteriorRing,
        ...countryRings.slice(1),
        ...territoryRings.slice(1),
      ],
    };
    removedFeatures.add(territoryFeature);
  });

  return features.filter(feature => !removedFeatures.has(feature));
}
