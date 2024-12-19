import { MouseEvent } from 'react';

const mouseEventTypes = new Set([
  'click',
  'dblclick',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'wheel'
]);

export function isMouseEvent<TElement extends HTMLElement>(event: MouseEvent<TElement> | unknown): event is MouseEvent<TElement> {
  return mouseEventTypes.has((event as MouseEvent)?.type);
}
