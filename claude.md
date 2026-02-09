# Project Context & Architecture

## Project Overview

This is a minimalist personal portfolio website built with vanilla HTML and CSS. The design philosophy emphasizes simplicity, typography, and content over visual decoration.

## Architecture

### Tech Stack

- **Markup**: Plain HTML5 with semantic elements (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`, `<article>`)
- **Styling**: Vanilla CSS with no preprocessors or frameworks
- **Fonts**: Inter from Google Fonts (weights: 400, 500, 700)
- **JavaScript**: Minimal - only a small inline script to update the copyright year
- **Build Tools**: None - this is a pure static site with no build step
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel)

### File Structure

```
.
├── index.html      # Single-page application with all sections
├── styles.css      # All styles in one file, organized by section
├── README.md       # Project documentation
└── claude.md       # This file - context for AI assistants
```

### Page Structure

The site is a single-page scroll layout with four main sections:

1. **Hero** (`#hero`): Full-height viewport introduction with name, tagline, and CTA buttons
2. **Projects** (`#projects`): Grid of 4 project cards showcasing recent work
3. **About** (`#about`): Personal bio and background information
4. **Contact** (`#contact`): Links to Twitter and LinkedIn

Navigation uses anchor links (`#hero`, `#projects`, etc.) for smooth scrolling between sections.

## Design Philosophy

### Visual Style

- **Color Scheme**: Strictly black and white only (`#000000` and `#ffffff`)
- **No Visual Decorations**: No images, borders, shadows, gradients, or decorative shapes
- **Typography-First**: Design relies entirely on typography, spacing, and layout
- **Minimalist Aesthetic**: Clean, uncluttered, focused on content

### Layout Principles

- **Mobile-First**: Responsive design starts with mobile and enhances for larger screens
- **Content Width**: Constrained to `max-width: 960px` with centered container
- **Consistent Spacing**: Uses a consistent spacing scale (rem units)
- **Vertical Rhythm**: Sections have consistent top/bottom padding

## Code Style Preferences

### HTML

- **Semantic Elements**: Always use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- **Accessibility**: Include `aria-label` attributes where appropriate, proper heading hierarchy (`h1` → `h2` → `h3`)
- **External Links**: Always include `target="_blank"` and `rel="noopener noreferrer"` for external links
- **Indentation**: 2 spaces
- **Comments**: Use HTML comments to mark major sections (`<!-- Hero Section -->`)

### CSS

- **Naming Convention**: BEM-like naming with component prefixes:
  - `.site-header`, `.site-nav`, `.site-footer` (site-wide components)
  - `.hero-*`, `.project-*`, `.about-*`, `.contact-*` (section-specific)
  - `.btn`, `.container`, `.section` (utility classes)
- **Organization**: Group styles by component/section with clear comments (`/* Header */`, `/* Hero */`, etc.)
- **Properties Order**: 
  1. Layout (display, position, flex/grid properties)
  2. Spacing (margin, padding)
  3. Typography (font-*, line-height, text-*)
  4. Visual (color, background, border)
  5. Effects (transition, transform)
- **Responsive Design**: Use mobile-first media queries (`@media (min-width: 768px)`)
- **Units**: Prefer `rem` for spacing and typography, `px` only when necessary
- **Indentation**: 2 spaces
- **No Shorthand**: Avoid shorthand properties when clarity is more important (e.g., prefer explicit `margin-top` over `margin`)

### JavaScript

- **Minimal Usage**: Only use JavaScript when absolutely necessary
- **Inline Scripts**: Small utility scripts can be inline in HTML
- **Vanilla JS**: No frameworks or libraries
- **IIFE Pattern**: Wrap scripts in immediately invoked function expressions when appropriate

## Responsive Breakpoints

- **Mobile**: Default (no media query) - single column layouts
- **Tablet**: `@media (min-width: 640px)` - footer layout changes
- **Desktop**: `@media (min-width: 700px)` - projects grid becomes 2 columns
- **Large Desktop**: `@media (min-width: 768px)` - hero layout changes, section padding increases

## Key Design Decisions

1. **No Build Tools**: Chosen for simplicity - no webpack, no npm, no build step
2. **Single CSS File**: All styles in one file for easy maintenance and no build complexity
3. **No Images**: Design is text-only to emphasize content and reduce dependencies
4. **Sticky Header**: Navigation stays visible while scrolling for easy section access
5. **Full-Height Hero**: Hero section uses `min-height: calc(100vh - 64px)` for impactful first impression
6. **Hover Effects**: Subtle hover effects on project cards (background color inversion) for interactivity without decoration

## Future Considerations

- **No Dark Mode**: Current design is light mode only (white background, black text)
- **No Animations**: Avoid animations unless they add meaningful UX value
- **No JavaScript Frameworks**: Keep it vanilla - if interactivity is needed, use plain JavaScript
- **Content Management**: If projects need to be dynamic, consider a simple JSON file or markdown files rather than a CMS

## Common Patterns

### Container Pattern
```css
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

### Section Pattern
```css
.section {
  padding: 4rem 0;
}

@media (min-width: 768px) {
  .section {
    padding: 5rem 0;
  }
}
```

### Button Pattern
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  text-decoration: underline;
}
```

## Development Workflow

1. **Local Development**: Use `python3 -m http.server 8000` or `npx serve .`
2. **Testing**: Open in browser, test responsive design using DevTools
3. **Version Control**: Git repository connected to GitHub
4. **Deployment**: Push to GitHub, deploy via GitHub Pages or connect to Netlify/Vercel

## Important Notes for AI Assistants

- **Keep It Simple**: Resist the urge to add frameworks, build tools, or complexity
- **Maintain Design Constraints**: Strictly black and white, no images, no borders, no decorative elements
- **Preserve Semantics**: Always use semantic HTML elements
- **Mobile-First**: Write CSS for mobile first, then enhance for larger screens
- **Accessibility**: Always consider accessibility (ARIA labels, keyboard navigation, focus states)
- **No Breaking Changes**: When making changes, ensure the site still works without JavaScript
- **Consistent Naming**: Follow the established naming convention (component-prefix pattern)
