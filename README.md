# Atomic Browser Extension

Atomic is a productivity-focused browser extension that replaces your new tab page with a clean, elegant task manager. It allows you to organize your daily tasks efficiently while providing a distraction-free interface to boost your productivity.

![Atomic Extension Screenshot](https://i.ibb.co/HNYSzHN/Screenshot-2024-09-30-at-5-14-13-PM.png)

## Features

- Replace new tab page with a task manager
- Add, edit, and delete tasks seamlessly
- Mark tasks as completed with visual feedback
- Clean, minimalist design focused on productivity
- Real-time date and time display
- Persistent storage - your tasks are saved locally
- Drag and drop task reordering with intuitive handle
- Maximum 8 tasks limit for focused productivity
- Smart editing with cursor positioning and keyboard shortcuts

## Installation

1. Clone this repository or download the source code.
2. Open your browser's extension page:
   - For Firefox: Navigate to `about:addons`
3. Enable "Developer mode" (usually a toggle in the top right corner).
4. Click `Load Temporary Add-on` (Firefox).
5. Select the directory containing the extension files.

## Usage

1. Open a new tab in your browser.
2. You'll see the current date and time at the top of the page.
3. To add a new task, type it into the input field and press Enter.
4. To mark a task as completed, click the circle next to the task.
5. To edit a task, click on the task text to start editing.
6. To delete a task, hover over the task and click the `×` button.
7. To reorder tasks, drag them using the drag handle (dots) on the left.
8. To clear all completed tasks, click the "clear completed" link at the top right.

## File Structure

- `index.html`: The main HTML structure of the new tab page
- `styles.css`: CSS styles for the task manager and overall layout
- `script.js`: JavaScript code for task management functionality
- `manifest.json`: Extension manifest file

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Browser Storage API

## Browser Compatibility

This extension is designed to work with:

- Mozilla Firefox

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request to help improve Atomic.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Atomic** - Stay organized, stay productive.
