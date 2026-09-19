---
name: Page Architecture (Chunking)
description: Rules for building new page views and keeping components under 100 lines.
---

# Page Architecture Rule

When building new page views or massive components:

1. **Folder Structure**: Always create a `page/` folder inside the relevant feature directory (e.g., `src/features/{feature}/page/`).
2. **File Size Limit**: No `.tsx` file should exceed ~100 lines.
3. **Component Chunking**: Break down the UI into logical, single-responsibility components (e.g., Header, Form, Modal, Footer).
4. **Export**: Export the main page container via an `index.tsx` or `index.ts` file in the `page/` folder.
5. **State Management**: Lift state up to the parent container only when necessary. Use RTK Query hooks directly inside the smaller components when possible to keep props drilling minimal.
