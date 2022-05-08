import React from 'react';

import { useMousePos } from '../../../../.storybook/decorators';
import { Position } from '../../../RenderFrame.types';

type SideLabel = 'top' | 'right' | 'bottom' | 'left';

export function useApproximateSide(): [Position, SideLabel] {
  const [x, y] = useMousePos();

  return [{x, y}, 'top'];
}