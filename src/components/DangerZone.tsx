import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteMyAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DangerZone() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const removeAccount = useServerFn(deleteMyAccount);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const remove = useMutation({
    mutationFn: () => removeAccount({}),
    onSuccess: async () => {
      setOpen(false);
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      if (typeof window !== "undefined") window.sessionStorage.clear();
      toast.success("Your account and all of its data have been deleted.");
      navigate({ to: "/", replace: true });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not delete your account.");
    },
  });

  return (
    <section className="rounded-2xl border border-destructive/40 bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-foreground">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        ACCOUNT MANAGEMENT
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Deleting your account permanently removes your profile, stats, game log, achievements,
        highlights, uploaded photos and videos, and coach invites. This can't be undone.
      </p>
      <button
        type="button"
        onClick={() => {
          setConfirmText("");
          setOpen(true);
        }}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
      >
        <Trash2 className="h-4 w-4" />
        Delete account
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently erases everything on your Footy KPI account, including uploaded
              photos and videos. Type DELETE below to confirm.
            </DialogDescription>
          </DialogHeader>
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="DELETE"
            aria-label="Type DELETE to confirm"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
          />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={confirmText.trim() !== "DELETE" || remove.isPending}
              onClick={() => remove.mutate()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {remove.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete forever
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
