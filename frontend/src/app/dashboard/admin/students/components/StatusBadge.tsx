import React from "react";
import clsx from "classnames";

export function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  const isActive = status === "Active";

  return (
    <span
      className={clsx(
        "px-3 py-1 rounded-full text-sm font-medium",
        isActive
          ? "bg-status-active/20 text-status-active"
          : "bg-status-inactive/20 text-status-inactive"
      )}
    >
      {status}
    </span>
  );
}
