import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

// source: https://devtrium.com/posts/how-keyboard-shortcut

/**
 * @param {string[]} keys
 * @param {(event: KeyboardEvent) => void} callback
 * @return {void}
 */
function useKeyPress(keys, callback, node = null) {
  // implement the callback ref pattern
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // handle what happens on key press
  const handleKeyPress = useCallback(
    (/** @type {KeyboardEvent} */ event) => {
      // check if one of the keys is part of the ones we want
      if (keys.some((key) => event.code === key)) {
        event.preventDefault();
        callbackRef.current(event);
      }
    },
    [keys],
  );

  useEffect(() => {
    // target is either the provided node or the document
    const targetNode = node ?? document;
    // attach the event listener
    targetNode && targetNode.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () =>
      targetNode && targetNode.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress, node]);
}

export { useKeyPress };
