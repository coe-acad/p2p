import { Zap, ZapOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            {/* Energy glyph: a live bolt for info/success, a cut bolt for errors. */}
            <span
              aria-hidden
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                props.variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
              }`}
            >
              {props.variant === "destructive" ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4 fill-current" strokeWidth={0} />}
            </span>
            <div className="grid flex-1 gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
