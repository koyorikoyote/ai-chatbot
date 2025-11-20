# Chat Widget Usage Guide

## Building the Widget

To build the widget for embedding:

```bash
cd ai-chatbot/frontend
npm run build
```

This will generate:

- `dist/chat-widget.umd.cjs` - The widget JavaScript bundle
- `dist/style.css` - The widget styles
- `dist/chat-widget.umd.cjs.map` - Source map for debugging

## Embedding the Widget

### Basic Usage

Include the widget in your HTML page:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Include the widget styles -->
    <link rel="stylesheet" href="path/to/dist/style.css" />
  </head>
  <body>
    <!-- Your page content -->

    <!-- Include the widget script -->
    <script src="path/to/dist/chat-widget.umd.cjs"></script>
    <script>
      // Initialize the widget
      window.ChatWidget.init({
        apiEndpoint: "http://localhost:3000",
        position: "bottom-right",
        primaryColor: "#007bff",
        title: "Chat Support",
      });
    </script>
  </body>
</html>
```

### Configuration Options

The `ChatWidget.init()` function accepts the following configuration options:

| Option         | Type   | Required | Default                   | Description                                          |
| -------------- | ------ | -------- | ------------------------- | ---------------------------------------------------- |
| `apiEndpoint`  | string | Yes      | -                         | The backend API endpoint URL                         |
| `position`     | string | No       | `'bottom-right'`          | Widget position: `'bottom-right'` or `'bottom-left'` |
| `primaryColor` | string | No       | `'#007bff'`               | Primary color for the widget theme                   |
| `title`        | string | No       | `'Chat Support'`          | Title displayed in the chat dialog header            |
| `containerId`  | string | No       | `'chat-widget-container'` | ID for the widget container element                  |

### Example Configurations

#### Minimal Configuration

```javascript
window.ChatWidget.init({
  apiEndpoint: "https://api.example.com",
});
```

#### Custom Styling

```javascript
window.ChatWidget.init({
  apiEndpoint: "https://api.example.com",
  position: "bottom-left",
  primaryColor: "#ff6b6b",
  title: "Help Center",
});
```

#### Production Configuration

```javascript
window.ChatWidget.init({
  apiEndpoint: "https://chat-api.yourcompany.com",
  position: "bottom-right",
  primaryColor: "#667eea",
  title: "Customer Support",
  containerId: "my-chat-widget",
});
```

## Style Isolation

The widget uses Shadow DOM to isolate its styles from the host page. This ensures:

- No style conflicts with your existing CSS
- Widget styles won't affect your page
- Your page styles won't affect the widget

## Destroying the Widget

To remove the widget from the page:

```javascript
window.ChatWidget.destroy();
```

This will:

- Unmount the React component
- Remove the widget container from the DOM
- Clean up all event listeners

## Testing Locally

1. Build the widget:

   ```bash
   npm run build
   ```

2. Open the demo page:

   ```bash
   # Open demo.html in your browser
   # Or use a local server:
   npx serve .
   ```

3. The demo page will load at `http://localhost:3000` (or the port shown)

## Browser Support

The widget supports all modern browsers:

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Troubleshooting

### Widget doesn't appear

- Check that both the CSS and JS files are loaded correctly
- Verify the `apiEndpoint` is correct and accessible
- Check browser console for errors

### Styles look broken

- Ensure the `style.css` file is included before the script
- Check that the CSS file path is correct

### API connection fails

- Verify the backend server is running
- Check CORS configuration on the backend
- Ensure the `apiEndpoint` URL is correct

## Production Deployment

For production deployment:

1. Build the widget with production settings
2. Host the `dist/` files on a CDN or static file server
3. Update the script and CSS URLs in your HTML
4. Configure CORS on your backend to allow requests from your domain

Example CDN usage:

```html
<link
  rel="stylesheet"
  href="https://cdn.yourcompany.com/chat-widget/style.css"
/>
<script src="https://cdn.yourcompany.com/chat-widget/chat-widget.umd.cjs"></script>
```
