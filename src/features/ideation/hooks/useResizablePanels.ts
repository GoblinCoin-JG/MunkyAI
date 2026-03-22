import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants';

export function useResizablePanels() {
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.leftWidth);
    return saved ? Number.parseInt(saved, 10) : 256;
  });

  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.rightWidth);
    return saved ? Number.parseInt(saved, 10) : 320;
  });

  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const startResizingLeft = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizingLeft(true);
  }, []);

  const startResizingRight = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizingRight(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  const resize = useCallback(
    (event: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = event.clientX;
        if (newWidth > 160 && newWidth < 480) {
          setLeftWidth(newWidth);
        }
      }

      if (isResizingRight) {
        const newWidth = window.innerWidth - event.clientX;
        if (newWidth > 200 && newWidth < 600) {
          setRightWidth(newWidth);
        }
      }
    },
    [isResizingLeft, isResizingRight],
  );

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingLeft, isResizingRight, resize, stopResizing]);

  return {
    leftWidth,
    rightWidth,
    isResizingLeft,
    isResizingRight,
    startResizingLeft,
    startResizingRight,
    setLeftWidth,
    setRightWidth,
  };
}
