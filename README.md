# RMDify

A modern, minimalist markdown editor built with React and TypeScript. Create, edit, and export markdown documents with a clean, distraction-free interface.

## Features

- Real-time markdown preview with syntax highlighting
- Auto-save functionality with local storage persistence
- Export to multiple formats: Markdown, TXT, HTML, and PDF
- Document management with starring and organization
- Responsive design for desktop and mobile devices
- Dark and light theme support
- Offline-first architecture

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TADSTech/rmdify.git

# Navigate to the project directory
cd rmdify

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

## Usage

### Creating Documents

1. Click "New Document" from the sidebar
2. Enter your markdown content in the editor
3. Toggle between Editor and Preview tabs to see your formatted output
4. Documents auto-save every 3 seconds

### Managing Documents

- Star important documents for quick access
- View recent documents sorted by last modified date
- Delete documents with confirmation dialog
- Open existing markdown files from your system

### Exporting

1. Click the "Export" button
2. Choose your desired format (MD, TXT, HTML, or PDF)
3. Enter a filename and confirm

## Technology Stack

- React 19 with TypeScript
- Vite for build tooling
- React Router for navigation
- Framer Motion for animations
- react-markdown for rendering
- react-syntax-highlighter for code blocks
- jsPDF for PDF generation
- Tailwind CSS v4 for styling

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Preview production build
npm run preview
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request for any improvements or bug fixes. You can also send me an email to be added as a **Collaborator** at motrenewed@gmail.com

