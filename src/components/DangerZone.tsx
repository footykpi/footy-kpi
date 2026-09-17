import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteMyAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [checked, setChecked] = useState(false);

  const resetConfirmation = () => {
    setConfirmText("");
    setChecked(false);
  };

  const remove = useMutation({
    mutationFn: () => removeAccount({}),
    onSuccess: async () => {
      setOpen(false);
      resetConfirmation();
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

  const canDelete = confirmText.trim() === "DELETE" && checked && !remove.isPending;

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
          resetConfirmation();
          setOpen(true);
        }}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
      >
        <Trash2 className="h-4 w-4" />
        Delete account
      </button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) resetConfirmation();
        }}
      >
        <DialogContent aria-describedby="delete-account-description">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete your account?</DialogTitle>
            <DialogDescription id="delete-account-description">
              This permanently erases everything on your Footy KPI account, including uploaded
              photos and videos. You will not be able to recover this data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <p>
                <strong>This action cannot be undone.</strong> Your profile, stats, game log,
                highlights, and coach links will be permanently removed.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="delete-confirm" className="text-sm font-medium text-foreground">
                Type DELETE to confirm
              </label>
              <input
                id="delete-confirm"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
              />
              <p className="text-xs text-muted-foreground">
                Please type <span className="font-semibold text-foreground">DELETE</span> in all
                caps to continue.
              </p>
            </div>

            <label className="flex items-start gap-3 text-sm text-foreground">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
                aria-label="I understand that my account and data will be permanently deleted"
              />
              <span className="leading-snug">
                I understand that deleting my account is permanent and all of my data will be
                removed.
              </span>
            </label>
          </div>

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
              disabled={!canDelete}
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
