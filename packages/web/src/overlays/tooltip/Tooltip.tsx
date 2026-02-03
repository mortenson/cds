import React, { cloneElement, useCallback, useMemo, useRef } from 'react';

import { Popover } from '../popover/Popover';

import { TooltipContent } from './TooltipContent';
import type { TooltipProps } from './TooltipProps';
import { useTooltipState } from './useTooltipState';

const preventMouseDown = (event: React.MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

export const Tooltip = ({
  children,
  content,
  elevation,
  placement = 'top',
  gap = 1,
  disablePortal,
  testID,
  zIndex,
  tooltipId: tooltipIdDefault,
  visible,
  invertColorScheme = true,
  disableTypeFocus,
  focusTabIndexElements,
  respectNegativeTabIndex,
  autoFocusDelay = 20,
}: TooltipProps) => {
  const { isOpen, handleOnMouseEnter, handleOnMouseLeave, handleOnFocus, handleOnBlur, tooltipId } =
    useTooltipState(tooltipIdDefault);
  const tooltipContentRef = useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = useCallback(
    ({ target }: React.MouseEvent) => {
      const node = tooltipContentRef.current;

      // to prevent flicker, don't open tooltip if enter event originates from tooltip content
      if (target instanceof Node && node?.parentNode !== target && !node?.contains(target)) {
        handleOnMouseEnter();
      }
    },
    [handleOnMouseEnter],
  );

  const handleBlur = useCallback(
    (event?: React.FocusEvent) => {
      const relatedTarget = event?.relatedTarget as Node | null;
      const tooltipContent = tooltipContentRef.current;

      // Don't trigger blur if focus is moving to an element inside the tooltip content
      // This prevents the tooltip from closing when focus moves to interactive elements (links, buttons) inside it
      if (relatedTarget && tooltipContent?.contains(relatedTarget)) {
        return;
      }

      handleOnBlur();
    },
    [handleOnBlur],
  );

  const clonedChild = useMemo(() => {
    return cloneElement(children, {
      'aria-describedby': tooltipId,
    });
  }, [children, tooltipId]);

  const contentPosition = useMemo(
    () => ({
      placement,
    }),
    [placement],
  );

  const isVisible = useMemo(() => visible !== false && isOpen, [visible, isOpen]);

  return (
    <Popover
      autoFocusDelay={autoFocusDelay}
      content={
        <TooltipContent
          ref={tooltipContentRef}
          content={content}
          elevation={elevation}
          gap={gap}
          placement={placement}
          testID={testID}
          tooltipId={tooltipId}
          zIndex={zIndex}
        />
      }
      contentPosition={contentPosition}
      disablePortal={disablePortal}
      disableTypeFocus={disableTypeFocus}
      focusTabIndexElements={focusTabIndexElements}
      invertColorScheme={invertColorScheme}
      onBlur={handleBlur}
      onFocus={handleOnFocus}
      onMouseDown={preventMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      respectNegativeTabIndex={respectNegativeTabIndex}
      visible={isVisible}
    >
      {clonedChild}
    </Popover>
  );
};
