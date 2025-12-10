"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type FeedbackType = "improvement" | "bug";

type FeedbackButtonProps = {
  placement?: "fixed" | "inline";
  className?: string;
};

export function FeedbackButton({
  placement = "fixed",
  className,
}: FeedbackButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("improvement");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const wrapperClass =
    placement === "fixed"
      ? cn("fixed bottom-6 right-6 z-50", className)
      : cn(className);

  const subject = useMemo(
    () => `[${type === "bug" ? "Bug" : "Improvement"}] PrepST feedback`,
    [type]
  );

  const handleFileChange = (file: File | null) => {
    setAttachment(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to send feedback.");
      return;
    }

    setSending(true);

    try {
      let attachmentUrl: string | null = null;

      if (attachment) {
        const path = `user-${user.id}/${Date.now()}-${attachment.name}`;
        const { error: uploadError } = await supabase.storage
          .from("feedback-attachments")
          .upload(path, attachment, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Attachment upload failed", uploadError);
          toast.error("Upload failed. Sending without attachment.");
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("feedback-attachments")
            .getPublicUrl(path);
          attachmentUrl = publicUrlData?.publicUrl || null;
        }
      }

      const { error: insertError } = await supabase.from("feedback").insert({
        type,
        details: details || "(no details provided)",
        page_url:
          typeof window !== "undefined" ? window.location.href : "unknown",
        attachment_url: attachmentUrl,
        user_id: user.id,
        user_email: user.email,
        subject,
      });

      if (insertError) {
        console.error("Feedback insert failed", insertError);
        throw insertError;
      }

      toast.success("Feedback sent. Thank you!");
      setDetails("");
      setAttachment(null);
      setType("improvement");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={wrapperClass}>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          className="shadow-lg"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Give Feedback
        </Button>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share feedback</DialogTitle>
            <DialogDescription>
              Tell us about a bug or an improvement idea. We’ll store it for the
              team to review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as FeedbackType)}
                className="grid grid-cols-2 gap-2"
              >
                <Label
                  htmlFor="improvement"
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer"
                >
                  <RadioGroupItem id="improvement" value="improvement" />
                  Improvement
                </Label>
                <Label
                  htmlFor="bug"
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer"
                >
                  <RadioGroupItem id="bug" value="bug" />
                  Bug
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                placeholder="What happened? What should change?"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attach a screenshot (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachment"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null)
                  }
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {attachment && (
                <p className="text-xs text-muted-foreground">
                  {attachment.name} • {(attachment.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={sending}>
              {sending ? "Sending..." : "Send feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
