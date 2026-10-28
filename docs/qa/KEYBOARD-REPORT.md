# Mobile keyboard follow-up — 27 October 2026

Reviewed the user's recording: the native keyboard covered the composer, and the conversation did not remain aligned with the latest message when the available height changed.

Implemented:

- Mobile chat fills the measured visual viewport and follows its vertical pan offset.
- Requested interactive-widget=resizes-content in the viewport metadata for supporting Android browsers.
- Input focus activates a compact layout without the secondary disclosure/booking rows; mobile bottom navigation is hidden while the chat is open.
- Keyboard resize/scroll events update geometry directly. The conversation is pinned to its bottom after focus, viewport changes and new messages using its own scrollTop, rather than scrolling the document with scrollIntoView.
- Long drafts scroll horizontally to keep an end-of-text caret visible, without forcing users editing an earlier part of the draft to the end.
- Touch-device embedded previews that never report a keyboard resize use a conservative half-height fallback after the keyboard animation delay. This is a heuristic for overlay-only previews; actual keyboard dimensions are used whenever available.
- Normal navigation returns when the chat closes.

Verification:

- Production build passes; npm test reports 36 passing tests.
- Six geometry tests cover visual-only resizing, layout resizing, panning, embedded-overlay fallback, dismissal and small screens.
- Eight production-browser cases pass at 390px width and 400, 320, 568 and 780px heights in actual light and dark themes. Checks include input bounds, retained draft, focus, end caret, horizontal draft scroll, latest reply visibility and conversation scroll position.
- Actual sequential typing in the browser also keeps the newest draft text visible at 390×400.
- A live Groq reply was loaded for the conversation checks. No browser warning/error logs were recorded.
- Mobile navigation is restored after closing the chat.

Limits: The browser tests simulate reduced viewport height; they do not control the physical Android keyboard shown in the recording. The overlay fallback is tested as pure geometry logic. Reload the mobile preview to replace its cached client code before checking the native keyboard again.

Evidence:

- [Light-mode draft and latest reply](keyboard-draft-light.png)
- [Dark-mode draft and latest reply](keyboard-draft-dark.png)
- [Production geometry measurements](keyboard-viewport-results.json)
