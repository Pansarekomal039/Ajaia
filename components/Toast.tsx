'use client';
import { useCallback, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; err: boolean } | null>(null);
  const show = useCallback((msg: string, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3500);
  }, []);
  const node = toast ? <div className={`toast ${toast.err ? 'err' : ''}`} role="status">{toast.msg}</div> : null;
  return { show, node };
}
