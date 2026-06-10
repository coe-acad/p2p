import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  /** Action button label. Defaults to "Proceed". */
  proceedLabel?: string;
  /** Cancel button label. Defaults to "Cancel". */
  cancelLabel?: string;
  /** When true, the action button uses destructive styling. */
  destructive?: boolean;
  /** True while the action is in flight. Disables both buttons + shows spinner. */
  loading?: boolean;
  onProceed: () => void;
}

/**
 * Standard "Are you sure?" popup used before irreversible actions.
 * Two buttons: Cancel + Proceed. The Proceed button uses Atria green by default,
 * or destructive red when `destructive` is set.
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  proceedLabel = "Proceed",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onProceed,
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-[400px] gap-3 p-6">
        <AlertDialogHeader className="space-y-1.5 text-left">
          <AlertDialogTitle className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 flex-row gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="m-0 flex-1 border-border hover:bg-secondary"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onProceed();
            }}
            className={
              destructive
                ? "flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            }
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : proceedLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
