# Integration Guide

## Getting Started with AI Chatbot Widget

### Quick Start

Integrating our chatbot widget into your website is simple and takes just a few minutes.

### Step 1: Get Your API Key

1. Log in to your account dashboard
2. Navigate to Settings > API Keys
3. Click "Generate New API Key"
4. Copy your API key and keep it secure

### Step 2: Add the Widget Script

Add the following script tag to your website's HTML, just before the closing `</body>` tag:

```html
<script src="https://cdn.aichatbot.com/widget.js"></script>
<script>
  ChatWidget.init({
    apiEndpoint: "https://api.aichatbot.com",
    apiKey: "YOUR_API_KEY_HERE",
    primaryColor: "#007bff",
    position: "bottom-right",
  });
</script>
```

### Step 3: Customize Your Widget

You can customize the widget appearance and behavior using configuration options:

**Available Options:**

- `apiEndpoint`: Your API endpoint URL
- `apiKey`: Your unique API key
- `primaryColor`: Widget theme color (hex code)
- `position`: Widget position ('bottom-right' or 'bottom-left')
- `title`: Custom widget title
- `welcomeMessage`: Initial greeting message

### Step 4: Test Your Integration

1. Refresh your website
2. Look for the chat button in the bottom corner
3. Click to open the chat dialog
4. Send a test message

## Advanced Configuration

### Custom Styling

Override default styles by adding custom CSS:

```css
.chat-widget-button {
  background-color: #your-color;
}
```

### Event Handlers

Listen to widget events:

```javascript
ChatWidget.on("message-sent", (data) => {
  console.log("User sent:", data.message);
});

ChatWidget.on("response-received", (data) => {
  console.log("Bot replied:", data.response);
});
```

## Troubleshooting

### Widget Not Appearing

- Verify the script tag is correctly placed
- Check browser console for errors
- Ensure your API key is valid

### Connection Issues

- Check your internet connection
- Verify the API endpoint URL
- Contact support if issues persist
