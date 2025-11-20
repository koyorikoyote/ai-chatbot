# Technical FAQ

## Technical Questions

### What technology stack does the chatbot use?

Our chatbot is built with:

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Fastify
- **AI Model**: Qwen2.5-3B running on Ollama
- **Vector Database**: ChromaDB for semantic search
- **Database**: PostgreSQL for conversation logs

### What are the system requirements?

**For Cloud Deployment:**

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

**For On-Premise Deployment:**

- Linux server (Ubuntu 20.04+ recommended)
- 8GB RAM minimum (16GB recommended)
- 50GB storage
- Docker and Docker Compose

### How do I integrate with my existing systems?

We provide REST APIs for integration with:

- CRM systems (Salesforce, HubSpot)
- Help desk software (Zendesk, Freshdesk)
- Analytics platforms (Google Analytics, Mixpanel)
- Custom applications via our API

### Can I use my own AI model?

Enterprise customers can use custom AI models. Contact our sales team to discuss your requirements.

### What document formats are supported?

We support:

- Markdown (.md)
- PDF (.pdf)
- Plain text (.txt)
- HTML (coming soon)
- Microsoft Word (coming soon)

### How often is the knowledge base updated?

You can update your knowledge base at any time through our API or dashboard. Changes are reflected immediately.

### What is the API rate limit?

Rate limits vary by plan:

- **Starter**: 20 requests per minute
- **Professional**: 100 requests per minute
- **Enterprise**: Custom limits

### Can I run the chatbot on my own servers?

Yes, Enterprise customers can deploy the chatbot on their own infrastructure for complete data control.

### What browsers are supported?

We support all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### How do I backup my data?

Cloud customers: We automatically backup your data daily. Enterprise customers can configure their own backup schedules.

### What is the uptime guarantee?

- **Starter**: 99.0% uptime
- **Professional**: 99.5% uptime
- **Enterprise**: 99.9% uptime with SLA

### Can I export my conversation data?

Yes, you can export conversation logs in CSV or JSON format through the dashboard or API.

### How do I update the chatbot widget?

The widget auto-updates from our CDN. No action required on your part.

### What security measures are in place?

- End-to-end encryption
- Input sanitization to prevent injection attacks
- Rate limiting to prevent abuse
- Regular security audits
- SOC 2 Type II compliance (Enterprise)

### Can I use webhooks?

Yes, we support webhooks for events like:

- New conversation started
- Message received
- Response generated
- Conversation ended
