const listeners = new Set();

export function emitProgressChanged(reason = 'unknown') {
  listeners.forEach((listener) => {
    try {
      listener(reason);
    } catch (error) {
      console.error('Error in progress listener:', error);
    }
  });
}

export function subscribeToProgressChanges(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}