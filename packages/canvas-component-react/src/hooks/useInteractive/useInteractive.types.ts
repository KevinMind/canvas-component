import { Position, InteractionEvent } from "@canvas-component/core";

export interface InteractiveConfig {
  /**
   * Unique identifier for this interactive region.
   * If not provided, one will be generated.
   */
  id?: string;

  /**
   * The points defining the interactive polygon region.
   */
  points: Position[];

  /**
   * Called when the shape is clicked.
   */
  onClick?: (event: InteractionEvent) => void;

  /**
   * Called when pointer enters the shape.
   */
  onPointerEnter?: (event: InteractionEvent) => void;

  /**
   * Called when pointer leaves the shape.
   */
  onPointerLeave?: (event: InteractionEvent) => void;

  /**
   * Called when pointer moves within the shape.
   */
  onPointerMove?: (event: InteractionEvent) => void;

  /**
   * Called when pointer is pressed down on the shape.
   */
  onPointerDown?: (event: InteractionEvent) => void;

  /**
   * Called when pointer is released on the shape.
   */
  onPointerUp?: (event: InteractionEvent) => void;

  // ARIA accessibility props
  /**
   * Accessible label for the shape (aria-label).
   */
  ariaLabel?: string;

  /**
   * ARIA role for the shape. Defaults to "button" if onClick is provided.
   */
  role?: "button" | "link" | "checkbox" | "radio" | "switch" | "menuitem" | "option" | "tab" | "treeitem";

  /**
   * Whether the shape is disabled (aria-disabled).
   */
  disabled?: boolean;

  /**
   * Whether the shape is currently selected/pressed (aria-pressed for toggle buttons).
   */
  pressed?: boolean;

  /**
   * Whether the shape is checked (for checkboxes/radios).
   */
  checked?: boolean;

  /**
   * Tab index for keyboard navigation. Defaults to 0 for interactive elements.
   */
  tabIndex?: number;
}

export interface InteractiveHandle {
  /**
   * The unique ID of this interactive region.
   */
  id: string;

  /**
   * Focus the accessible element for this shape.
   */
  focus: () => void;

  /**
   * Update the points of the interactive region.
   */
  updatePoints: (points: Position[]) => void;
}
