export default function copyLinkAddress() {
  const link = getSelectedLinkAddress();
  if (link === null) return;
  navigator.clipboard
    .writeText(link)
    .then(
      () => console.debug(`Successfully copied '${link}!'`),
      () => console.debug(`Failed to copy '${link}'`)
    );
}

function getSelectedLinkAddress() {
  const fragmentChildren = window
    .getSelection()
    .getRangeAt(0)
    .cloneContents().children;
  for (var i = -1; ++i < fragmentChildren.length; ) {
    const child = fragmentChildren[i];
    if (child.tagName === "A" && child.href) {
      return child.href;
    }
  }
  return null;
}
