import React from "react";

export default function RestoreButton({ count, onClick }) {
  return (
    <div class="inline-block padding-top-larger padding-bottom-medium">
      <div
        onClick={onClick}
        class="pointer underline-on-hover font-size-small font-weight-bold line-height-small winager-primary"
      >
        Restore all {count} items
      </div>
    </div>
  );
}
