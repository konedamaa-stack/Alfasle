"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: number;
}

interface ShowToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ShowToastOptions) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (titleOrMessage: string, message?: string, duration?: number) => string;
    error: (titleOrMessage: string, message?: string, duration?: number) => string;
    warning: (titleOrMessage: string, message?: string, duration?: number) => string;
    info: (titleOrMessage: string, message?: string, duration?: number) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "success", title, message, duration = 4000 }: ShowToastOptions): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const toast = useMemo(
    () => ({
      success: (titleOrMessage: string, message?: string, duration?: number) => {
        if (!message) {
          return showToast({
            type: "success",
            title: "Succès",
            message: titleOrMessage,
            duration,
          });
        }
        return showToast({
          type: "success",
          title: titleOrMessage,
          message,
          duration,
        });
      },
      error: (titleOrMessage: string, message?: string, duration?: number) => {
        if (!message) {
          return showToast({
            type: "error",
            title: "Erreur",
            message: titleOrMessage,
            duration,
          });
        }
        return showToast({
          type: "error",
          title: titleOrMessage,
          message,
          duration,
        });
      },
      warning: (titleOrMessage: string, message?: string, duration?: number) => {
        if (!message) {
          return showToast({
            type: "warning",
            title: "Attention",
            message: titleOrMessage,
            duration,
          });
        }
        return showToast({
          type: "warning",
          title: titleOrMessage,
          message,
          duration,
        });
      },
      info: (titleOrMessage: string, message?: string, duration?: number) => {
        if (!message) {
          return showToast({
            type: "info",
            title: "Information",
            message: titleOrMessage,
            duration,
          });
        }
        return showToast({
          type: "info",
          title: titleOrMessage,
          message,
          duration,
        });
      },
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé au sein d'un ToastProvider");
  }
  return context;
}
