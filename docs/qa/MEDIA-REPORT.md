# Media Library verification

Implemented without a database. Original files and JSON metadata are stored under `.data/media/`.

- 54 automated tests pass, including media validation, ordering, draft/publish changes, deletion, anonymous API rejection, cross-origin mutation rejection, draft byte privacy, published reads and byte-range responses.
- Production build passes.
- Browser upload of a JPG as draft succeeded. Anonymous list excluded the draft and its direct URL returned 404. Publishing made the image available in the customer Lookbook; the image loaded successfully. Customer view exposed no media management controls.
- Customer gallery checked at 390px: no horizontal overflow and no upload controls.
- Test upload removed after verification. Owner library is empty and ready for real uploads.

Accepted: JPG, PNG, WebP (8 MB) and MP4, WebM (30 MB). All uploads start as drafts. Server checks owner sessions for writes and draft reads, validates MIME/signatures, uses generated filenames and limits request bytes. Videos use native controls and byte-range serving.

Deploy on a single application server with persistent writable storage. Back up the entire `.data/media` directory, including `library.json`. No database or third-party media service is required. Media file signature validation does not transcode uploaded content; browser playback requires a supported video codec.
