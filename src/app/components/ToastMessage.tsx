'use client';

import { useEffect, useRef } from "react";
import { ToastProps } from "@/types/CriarContaInput";
import type { Toast as BsToast } from "bootstrap";

export default function ToastMessage({ id, message, type = "primary" }: ToastProps) {
    const toastRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!toastRef.current) return;

        let instance: BsToast | null = null;

        if (typeof window !== "undefined") {
            import("bootstrap").then(({ Toast }) => {
                instance = Toast.getOrCreateInstance(toastRef.current!, {
                    autohide: true,
                    delay: 3000,
                });
                instance?.show();
            })
        }
        return () => {
            if (instance) instance.dispose();
        };
}, [message]);


    return (
        <div className="toast-container position-fixed top-0 end-0 p-3">
            <div
                id={id}
                ref={toastRef}
                className={`toast align-items-center text-bg-${type} border-0`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div className="d-flex">
                    <div className="toast-body">{message}</div>
                    <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"
                        aria-label="Close"
                    ></button>
                </div>
            </div>
        </div>
    );
}
