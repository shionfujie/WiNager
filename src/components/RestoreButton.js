import React from "react";

export default function RestoreButton({ count, onClick }) {
  return (
    <div class="inline-block padding-top-medium padding-bottom-small">
      <div
        onClick={onClick}
        class="pointer underline-on-hover font-size-medium font-weight-medium line-height-medium winager-primary"
      >
        Restore all {count} items
      </div>
    </div>
  );
}
