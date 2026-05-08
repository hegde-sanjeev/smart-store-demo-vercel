'use client';
import { useEffect } from 'react';

export default function DragScroll() {
  useEffect(() => {
    let isDown = false;
    let startY = 0;
    let scrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      startY = e.pageY - window.scrollY;
      scrollTop = window.scrollY;
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const onMouseUp = () => {
      isDown = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const y = e.pageY - window.scrollY;
      const walk = (startY - y) * 1.5; // 1.5 = scroll speed multiplier
      window.scrollTo({ top: scrollTop + walk });
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return null;
}
