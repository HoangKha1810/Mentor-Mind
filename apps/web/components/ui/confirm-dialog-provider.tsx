'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CircleAlert, Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motionDuration, motionEase } from '@/lib/motion-system';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type ConfirmDialogOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'info' | 'warning' | 'danger';
};

type PendingConfirmation = ConfirmDialogOptions & {
  id: number;
  opener: HTMLElement | null;
  outcome?: boolean;
  settled: boolean;
  resolve: (accepted: boolean) => void;
};

type ConfirmDialog = (options: ConfirmDialogOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmDialog | null>(null);

const toneStyles = {
  info: {
    Icon: Info,
    icon: 'border-secondary/25 bg-secondary/10 text-secondary',
    action: '',
  },
  warning: {
    Icon: AlertTriangle,
    icon: 'border-warning/25 bg-warning/10 text-warning',
    action: '',
  },
  danger: {
    Icon: CircleAlert,
    icon: 'border-danger/25 bg-danger/10 text-danger',
    action:
      'border-danger/70 bg-danger bg-none text-white shadow-[0_14px_30px_rgba(239,68,68,0.22)] hover:bg-danger/90 hover:shadow-[0_18px_42px_rgba(239,68,68,0.3)]',
  },
} as const;

let nextConfirmationId = 0;

function resolveOnce(request: PendingConfirmation, accepted: boolean) {
  if (request.settled) return;
  request.settled = true;
  request.resolve(accepted);
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());
  const [active, setActive] = useState<PendingConfirmation | null>(null);
  const activeRef = useRef<PendingConfirmation | null>(null);
  const closingRef = useRef<PendingConfirmation | null>(null);
  const queueRef = useRef<PendingConfirmation[]>([]);
  const transitioningRef = useRef(false);
  const mountedRef = useRef(true);
  const previousPathnameRef = useRef(pathname);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmDialog>((options) => {
    return new Promise<boolean>((resolve) => {
      if (!mountedRef.current) {
        resolve(false);
        return;
      }

      const request: PendingConfirmation = {
        ...options,
        id: ++nextConfirmationId,
        opener:
          activeRef.current?.opener ??
          closingRef.current?.opener ??
          (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null),
        settled: false,
        resolve,
      };

      if (activeRef.current || transitioningRef.current) {
        queueRef.current.push(request);
        return;
      }

      activeRef.current = request;
      setActive(request);
    });
  }, []);

  const settleActive = useCallback((accepted: boolean) => {
    const request = activeRef.current;
    if (!request) return;

    transitioningRef.current = true;
    activeRef.current = null;
    request.outcome = accepted;
    closingRef.current = request;
    setActive(null);
  }, []);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null;
    const closing = closingRef.current;
    closingRef.current = null;
    transitioningRef.current = false;

    if (!next && closing?.opener?.isConnected) {
      closing.opener.focus({ preventScroll: true });
    }

    if (closing) {
      resolveOnce(closing, closing.outcome ?? false);
    }

    if (next && mountedRef.current) {
      activeRef.current = next;
      setActive(next);
    } else if (next) {
      resolveOnce(next, false);
    }
  }, []);

  const cancelAll = useCallback(() => {
    for (const request of queueRef.current.splice(0)) {
      resolveOnce(request, false);
    }
    if (closingRef.current) {
      closingRef.current.outcome = false;
    }
    settleActive(false);
  }, [settleActive]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (activeRef.current) resolveOnce(activeRef.current, false);
      if (closingRef.current) resolveOnce(closingRef.current, false);
      for (const request of queueRef.current.splice(0)) {
        resolveOnce(request, false);
      }
    };
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      cancelAll();
    }
  }, [cancelAll, pathname]);

  const tone = active?.tone ?? 'warning';
  const { Icon, icon, action } = toneStyles[tone];
  const panelInitial = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 };
  const panelExit = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 8 };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) settleActive(false);
        }}
      >
        <AnimatePresence initial={false} onExitComplete={showNext}>
          {active ? (
            <AlertDialog.Portal forceMount key={active.id}>
              <AlertDialog.Overlay forceMount asChild>
                <motion.div
                  data-testid="confirm-dialog-overlay"
                  className="confirm-dialog-overlay fixed inset-0 z-[var(--layer-dialog)] bg-slate-950/[0.72] backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : motionDuration.fast,
                    ease: motionEase.standard,
                  }}
                />
              </AlertDialog.Overlay>
              <AlertDialog.Content
                forceMount
                asChild
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                  cancelButtonRef.current?.focus({ preventScroll: true });
                }}
                onCloseAutoFocus={(event) => event.preventDefault()}
              >
                <motion.div
                  data-testid="confirm-dialog"
                  className="confirm-dialog-content theme-adaptive fixed inset-0 z-[calc(var(--layer-dialog)+1)] m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),32rem)] overflow-y-auto rounded-xl border border-foreground/10 bg-surface/[0.98] text-foreground shadow-[0_28px_100px_rgba(2,8,23,0.52),inset_0_1px_0_rgba(255,255,255,0.08)] outline-none backdrop-blur-2xl"
                  initial={panelInitial}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={panelExit}
                  transition={{
                    duration: reduceMotion ? 0 : motionDuration.standard,
                    ease: motionEase.expressive,
                  }}
                >
                  <div className="flex items-start gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                    <span
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border',
                        icon,
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 pt-0.5 [overflow-wrap:anywhere]">
                      <AlertDialog.Title className="text-lg font-semibold leading-7 tracking-normal">
                        {active.title}
                      </AlertDialog.Title>
                      <AlertDialog.Description className="mt-2 text-sm leading-6 text-mutedText">
                        {active.description}
                      </AlertDialog.Description>
                    </div>
                  </div>

                  <div className="grid gap-2 border-t border-foreground/10 bg-foreground/[0.025] px-5 py-4 sm:flex sm:justify-end sm:px-6">
                    <AlertDialog.Cancel asChild>
                      <Button
                        ref={cancelButtonRef}
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => settleActive(false)}
                      >
                        {active.cancelLabel ?? 'Hủy'}
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <Button
                        type="button"
                        className={cn('w-full sm:w-auto', action)}
                        onClick={() => settleActive(true)}
                      >
                        {active.confirmLabel ?? 'Xác nhận'}
                      </Button>
                    </AlertDialog.Action>
                  </div>
                </motion.div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          ) : null}
        </AnimatePresence>
      </AlertDialog.Root>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const confirm = useContext(ConfirmDialogContext);
  if (!confirm) {
    throw new Error('useConfirmDialog must be used inside ConfirmDialogProvider');
  }
  return confirm;
}
