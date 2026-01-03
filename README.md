# Grid Playground

An interactive playground for learning and experimenting with CSS Grid layouts using Tailwind CSS. Visual building, code generation, and advanced grid controls.

## Features

- **Interactive Grid System**: Drag and drop blocks to position them within the grid.
- **Multi-Selection**: Select multiple blocks via Shift+Click or by dragging a selection area. Group drag and delete operations supported.
- **Customizable Layout**: Adjust columns (up to 12), rows, and gutter sizes visually.
- **Resizing**: Intuitive resize handles on blocks to modify column and row spans.
- **Code Generation**:
  - **Tailwind CSS**: Instant utility class generation.
  - **CSS/HTML**: Standard CSS Grid and HTML export option.
- **Persistent State**: Your grid layout and settings are automatically saved to local storage.
- **Responsive Design**: Mobile-friendly interface with touch support.
- **Dark Mode**: Sleek, modern dark UI.

## Technologies Used

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Drag & Drop**: [@dnd-kit/core](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/) primitives & custom components.
- **State Management**: React Hooks + Local Storage persistence.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd grid-app
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

### Development

Start the development server:

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage Guide

1. **Add Blocks**: Click the "+" button in the toolbar to add new blocks (auto-placed in available space).
2. **Selection**:
   - **Single**: Click a block.
   - **Multi**: Shift+Click multiple blocks or drag a selection box across the grid background.
3. **Move**: Drag selected blocks to reposition them. Moved blocks snap to the grid.
4. **Resize**: Drag the corner handles on a selected block to change its span.
5. **Edit**: Use the "Edit" button (for single blocks) to manually input col/row values.
6. **Code Export**: Click the "Code" button to view generated code. Toggle between **Tailwind** and **CSS** modes.
7. **Settings**: Adjust grid columns, rows, and gap size via the "Grid" settings panel.

## Project Structure

- `app/`: Next.js App Router structure.
- `components/`:
  - `grid-playground.tsx`: Core logic (state, dnd sensors, layout).
  - `grid-block.tsx`: Block component with resize handles and drag listeners.
  - `grid-selection-area.tsx`: Logic for drag-to-select functionality.
  - `grid-settings.tsx`: Grid configuration UI.
  - `code-panel.tsx`: Code export viewer (Tailwind/CSS).
  - `toolbar.tsx`: Actions for adding/deleting blocks.
  - `ui/`: Shared UI components.
- `hooks/`: Custom hooks (e.g., `usePersistentState`).

## License

MIT License
