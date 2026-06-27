"use client";

import { AppIcon } from "@/lib/icons";
import { formatMessageParty } from "@/lib/messaging";
import type { Message } from "@/lib/types";

interface MessageCardProps {
  message: Message;
  perspective: "inbox" | "sent";
  onOpen?: (id: string) => void;
  expanded?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageCard({
  message,
  perspective,
  onOpen,
  expanded = false,
}: MessageCardProps) {
  const isUnread = perspective === "inbox" && !message.procitanoAt;
  const party =
    perspective === "inbox"
      ? formatMessageParty(message, "from")
      : formatMessageParty(message, "to");

  return (
    <article
      className={`ht-panel-bordered p-5 sm:p-6 ${
        isUnread ? "border-l-[3px] border-l-ht-gold bg-ht-cream/20" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen?.(message.id)}
        className="touch-target w-full text-left"
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
              <AppIcon name="mail" className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-ht-muted">
                {perspective === "inbox" ? "Od:" : "Za:"} {party}
              </p>
              <h3 className="ht-display text-lg text-ht-navy">{message.naslov}</h3>
            </div>
          </div>
          <div className="text-right">
            <time className="text-xs text-ht-muted" dateTime={message.createdAt}>
              {formatDate(message.createdAt)}
            </time>
            {isUnread && (
              <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-ht-gold">
                Novo
              </span>
            )}
          </div>
        </div>

        {!expanded && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ht-muted">
            {message.tekst}
          </p>
        )}
      </button>

      {expanded && (
        <div className="mt-4 border-t border-ht-border-light pt-4">
          <p className="text-base leading-relaxed text-ht-text">{message.tekst}</p>
        </div>
      )}
    </article>
  );
}
