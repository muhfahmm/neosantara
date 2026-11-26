'use client';

export interface AidDeliveryPathRequest {
  pathId: string;
  senderCountry: string;
  targetCountry: string;
  resourceKey: string;
  amount: number;
}

export function dispatchAidDeliveryPath(request: AidDeliveryPathRequest): boolean {
  if (typeof window === 'undefined') {
    console.error('[AidDeliveryPath] Cannot dispatch an aid route outside the browser.');
    return false;
  }

  if (
    !request.pathId.trim() ||
    !request.senderCountry.trim() ||
    !request.targetCountry.trim() ||
    !request.resourceKey.trim() ||
    !Number.isFinite(request.amount) ||
    request.amount <= 0
  ) {
    console.error('[AidDeliveryPath] Invalid aid route request.', request);
    return false;
  }

  window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
    detail: {
      pathId: request.pathId,
      kind: 'aid-delivery',
      senderCountry: request.senderCountry,
      targetCountry: request.targetCountry,
      resourceKey: request.resourceKey,
      amount: request.amount,
    },
  }));
  return true;
}
