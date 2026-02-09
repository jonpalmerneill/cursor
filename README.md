# Personal Portfolio Website

A minimalist, single-page portfolio website built with vanilla HTML and CSS. Features a clean black-and-white design focused purely on typography and content.

## What This Project Is

This is a personal portfolio website designed to showcase:
- **Hero section**: Introduction with name and tagline
- **Projects section**: Display of 4 recent works with descriptions and links
- **About section**: Personal bio and background
- **Contact section**: Links to Twitter and LinkedIn

## Features

- **Pure HTML/CSS**: No frameworks, build tools, or JavaScript dependencies (except a small script to update the copyright year)
- **Responsive design**: Mobile-first approach with CSS Grid and Flexbox
- **Minimalist aesthetic**: Black and white color scheme, text-only design
- **Semantic HTML**: Proper use of semantic elements for accessibility
- **Google Fonts**: Uses Inter font family for modern typography

## Project Structure

```
.
├── index.html      # Main HTML file with all sections
├── styles.css      # All styling and responsive design
└── README.md       # This file
```

## How to Run Locally

### Option 1: Simple HTTP Server (Recommended)

Using Python (if installed):

```bash
# Navigate to the project directory
cd /path/to/cursor

# Start a local server
python3 -m http.server 8000

# Open your browser and visit:
# http://localhost:8000/index.html
```

### Option 2: Using Node.js `serve`

If you have Node.js installed:

```bash
# Navigate to the project directory
cd /path/to/cursor

# Install serve globally (if not already installed)
npm install -g serve

# Or use npx to run without installing
npx serve .

# Follow the URL shown in the terminal (usually http://localhost:3000)
```

### Option 3: Direct File Opening

You can also open `index.html` directly in your browser, though some features (like loading Google Fonts) may work better with a local server.

## Customization

To personalize this portfolio:

1. **Update `index.html`**:
   - Replace "Your Name" with your actual name
   - Update the tagline in the hero section
   - Add your project details (titles, descriptions, tech stacks, links)
   - Write your bio in the About section
   - Update Twitter and LinkedIn links in the Contact section

2. **Update `styles.css`** (optional):
   - Adjust typography sizes
   - Modify spacing and layout
   - Change the color scheme (currently black and white)

## Deployment

This static site can be deployed to any static hosting service:

- **GitHub Pages**: Enable Pages in your repository settings
- **Netlify**: Drag and drop the folder or connect via Git
- **Vercel**: Connect your Git repository or use the CLI

No build step required—just upload the files!

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- Flexbox
- CSS Custom Properties (for future enhancements)

## License

This project is open source and available for personal use.
