# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of mini-projects designed for rapid prototyping and experimentation. Each project is self-contained and independent from others to enable parallel development without conflicts.

## Architecture Principles

1. **Independence**: Each mini-project is completely isolated with no cross-dependencies
2. **HTML-First**: All projects use plain HTML as the base for fast loading
3. **Parallel Development**: Multiple ideas can be implemented simultaneously without collision
4. **Simple Structure**: Each project lives in its own directory under `/projects/`

## Project Structure

```
/
├── index.html          # Main landing page listing all projects
├── CLAUDE.md          # This file
└── projects/          # Container for all mini-projects
    ├── project-1/
    │   └── index.html
    ├── project-2/
    │   └── index.html
    └── ...
```

## Development Commands

Since this is a static HTML project collection, no build process is required. Simply:
- Create new projects by adding a directory under `/projects/`
- Each project should have its own `index.html` as the entry point
- Update the main `index.html` to link to new projects

## Adding New Projects

When creating a new mini-project:
1. Create a new directory under `/projects/` with a descriptive name
2. Add an `index.html` file as the entry point
3. Keep all project assets (CSS, JS, images) within the project directory
4. Add a link to the project in the main `index.html`

## Key Conventions

- Use semantic HTML5 elements
- Inline critical CSS for faster initial rendering
- Keep JavaScript minimal and scoped to individual projects
- Use data attributes for dynamic behavior rather than complex frameworks