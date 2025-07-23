# Atomic - Minimalist Task Manager Browser Extension

Atomic is a productivity-focused browser extension that transforms your new tab page into a clean, elegant task manager. Built with a minimalist design philosophy, it helps you organize daily tasks efficiently while maintaining a distraction-free interface.

> **Note**: This project is a fork of [NewTab-Todo](https://github.com/mraza007/NewTab-Todo), extensively redesigned and enhanced with modern features and a refined user experience.

## ✨ Features

### Core Functionality
- **New Tab Replacement**: Seamlessly replaces your browser's new tab page
- **Task Management**: Add, edit, delete, and mark tasks as complete
- **Real-time Clock**: Live date and time display
- **Persistent Storage**: Tasks are automatically saved locally

### Enhanced User Experience
- **Drag & Drop Reordering**: Intuitive task reordering with dedicated drag handles
- **Smart Task Editing**: Click to edit with optimized cursor positioning and keyboard shortcuts
- **Focus Mode**: 12-task limit encourages prioritization and reduces overwhelm
- **Batch Operations**: Clear all completed tasks with one click
- **Minimalist Design**: Clean green-themed interface with subtle animations

### Technical Features
- **Spell Check Disabled**: No distracting red underlines in task text
- **Single-click Interactions**: Checkboxes work immediately, even during editing
- **Responsive Design**: Works seamlessly across different screen sizes
- **No External Dependencies**: Lightweight and fast-loading

## 📦 Installation

### Firefox
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" → "Load Temporary Add-on"
4. Select any file from the extension directory
5. The extension will be active immediately

### Chrome
1. Download or clone this repository
2. Run the build script: `./scripts/build.sh`
3. Open Chrome and navigate to `chrome://extensions`
4. Enable "Developer mode" (toggle in the top-right)
5. Click "Load unpacked" and select the `dist/chrome` directory
6. The extension will be active immediately

### Building for Distribution
1. Run the build script: `./scripts/build.sh`
2. Find the distribution packages in the `dist` directory:
   - `atomic-firefox-v1.0.zip` for Firefox
   - `atomic-chrome-v1.0.zip` for Chrome

## 🚀 Usage

### Getting Started
1. **Open a new tab** - Atomic will automatically load
2. **Add tasks** - Type in the input field and press Enter
3. **Mark complete** - Click the circular checkbox next to any task
4. **Edit tasks** - Click on task text to edit inline
5. **Reorder tasks** - Drag tasks using the dots (⋮⋮) on the left
6. **Delete tasks** - Hover over a task and click the × button
7. **Clear completed** - Use the "clear completed" link when it appears

### Keyboard Shortcuts
- **Enter** - Save changes when editing
- **Escape** - Cancel editing and revert changes
- **Double-click** - Select all text in a task for quick replacement

### Task Management Tips
- **Prioritize**: The 12-task limit encourages you to focus on what matters most
- **Complete regularly**: Mark tasks as done to maintain momentum
- **Edit efficiently**: Click anywhere in task text to start editing
- **Organize**: Drag tasks to arrange by priority or category

## 🛠️ Technical Details

### Built With
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - No frameworks, maximum performance
- **Web Extensions API** - Browser storage and new tab override

### Browser Compatibility
- ✅ **Firefox** (Manifest v2)
- ✅ **Chrome/Edge** (Manifest v3)

The build system automatically generates compatible versions for each browser.

### File Structure
```
atomic-task-manager/
├── src/                # Source files
│   ├── index.html      # Main interface
│   ├── styles.css      # All styling and animations
│   └── script.js       # Core functionality
├── manifests/          # Browser-specific manifests
│   ├── manifest.firefox.json # Firefox-specific manifest (v2)
│   └── manifest.chrome.json  # Chrome-specific manifest (v3)
├── scripts/           # Build and utility scripts
│   └── build.sh       # Build script for creating distributions
├── icons/             # Extension icons
├── dist/              # Generated distribution packages
├── .gitignore         # Git ignore file
├── README.md          # Documentation
└── LICENSE            # MIT License
```

## 🎨 Design Philosophy

Atomic follows a **minimalist design philosophy** with these principles:

- **Focus First**: Limited to 12 tasks to prevent overwhelm
- **Clean Interface**: Distraction-free environment with subtle green accents
- **Intuitive Interactions**: Every action should feel natural and immediate
- **Performance**: Lightweight and fast, no unnecessary dependencies

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Maintain the minimalist design philosophy
- Test across different screen sizes
- Ensure accessibility standards
- Keep code clean and well-commented
- Update documentation for new features

## 🐛 Issues & Support

If you encounter any issues or have suggestions:

1. Check existing [Issues](../../issues)
2. Create a new issue with detailed description
3. Include browser version and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Original Project**: [NewTab-Todo](https://github.com/mraza007/NewTab-Todo) by [@mraza007](https://github.com/mraza007)
- **Font**: [Montserrat](https://fonts.google.com/specimen/Montserrat) by Google Fonts
- **Inspiration**: Modern productivity tools and minimalist design principles. Specially [MinimaList](https://apps.apple.com/us/app/to-do-list-minimalist-widget/id993066159).

## 📈 Roadmap

- [x] Manifest V3 compatibility for Chrome
- [ ] Dark mode toggle
- [ ] Export/import functionality
- [ ] Sync across devices
- [ ] Pomodoro Timer

---

**Atomic** - *Stay organized, stay productive.*

Made with ❤️ for productivity enthusiasts
