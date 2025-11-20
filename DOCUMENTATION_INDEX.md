# Documentation Index

Welcome to the AI Chatbot Widget documentation! This index will help you find the right documentation for your needs.

## 📚 Documentation Overview

### Getting Started

| Document                       | Purpose                             | Audience                |
| ------------------------------ | ----------------------------------- | ----------------------- |
| [QUICKSTART.md](QUICKSTART.md) | Get up and running in 5 minutes     | Developers (first time) |
| [README.md](README.md)         | Comprehensive setup and usage guide | All users               |

### Development

| Document                                       | Purpose                          | Audience            |
| ---------------------------------------------- | -------------------------------- | ------------------- |
| [README.md](README.md)                         | Development workflow and testing | Developers          |
| [backend/.env.example](backend/.env.example)   | Backend environment variables    | Backend developers  |
| [frontend/.env.example](frontend/.env.example) | Frontend environment variables   | Frontend developers |

### Widget Integration

| Document                                                         | Purpose                             | Audience       |
| ---------------------------------------------------------------- | ----------------------------------- | -------------- |
| [frontend/WIDGET_USAGE.md](frontend/WIDGET_USAGE.md)             | How to embed the widget in websites | Web developers |
| [README.md#embedding-the-widget](README.md#embedding-the-widget) | Quick embedding guide               | Web developers |

### Utilities & Scripts

| Document                               | Purpose                             | Audience           |
| -------------------------------------- | ----------------------------------- | ------------------ |
| [scripts/README.md](scripts/README.md) | Documentation seeding and utilities | DevOps, Developers |

### Deployment

| Document                       | Purpose                     | Audience                      |
| ------------------------------ | --------------------------- | ----------------------------- |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide | DevOps, System administrators |

### Troubleshooting

| Document                                                   | Purpose                      | Audience   |
| ---------------------------------------------------------- | ---------------------------- | ---------- |
| [README.md#troubleshooting](README.md#troubleshooting)     | Common issues and solutions  | All users  |
| [QUICKSTART.md#common-issues](QUICKSTART.md#common-issues) | Quick fixes for setup issues | Developers |

## 🎯 Quick Navigation by Role

### I'm a Developer (First Time Setup)

1. Start with [QUICKSTART.md](QUICKSTART.md) - Get running in 5 minutes
2. Read [README.md](README.md) - Understand the full system
3. Check [scripts/README.md](scripts/README.md) - Learn about utility scripts

### I'm a Web Developer (Embedding the Widget)

1. Read [frontend/WIDGET_USAGE.md](frontend/WIDGET_USAGE.md) - Complete widget integration guide
2. Check [README.md#embedding-the-widget](README.md#embedding-the-widget) - Quick reference
3. Review [frontend/.env.example](frontend/.env.example) - Configuration options

### I'm a DevOps Engineer (Deploying to Production)

1. Read [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
2. Review [README.md#environment-variables](README.md#environment-variables) - Configuration
3. Check [README.md#troubleshooting](README.md#troubleshooting) - Common issues

### I'm a System Administrator (Maintaining the System)

1. Read [DEPLOYMENT.md#monitoring](DEPLOYMENT.md#monitoring) - Monitoring setup
2. Check [DEPLOYMENT.md#backup-and-recovery](DEPLOYMENT.md#backup-and-recovery) - Backup procedures
3. Review [README.md#troubleshooting](README.md#troubleshooting) - Issue resolution

## 📖 Documentation by Topic

### Installation & Setup

- [Prerequisites](README.md#prerequisites)
- [Installation steps](README.md#installation)
- [Quick start guide](QUICKSTART.md)

### Configuration

- [Environment variables](README.md#environment-variables)
- [Backend configuration](backend/.env.example)
- [Frontend configuration](frontend/.env.example)
- [Widget configuration](frontend/WIDGET_USAGE.md#configuration-options)

### Running Services

- [Starting ChromaDB](README.md#1-start-chromadb)
- [Starting Ollama](README.md#2-start-ollama-service)
- [Starting backend](README.md#3-start-backend-server)
- [Starting frontend](README.md#4-start-frontend-development-server)

### Development Workflow

- [Development mode](README.md#development)
- [Hot reload](README.md#hot-reload)
- [Testing](README.md#testing)
- [Linting](README.md#linting)

### Data Management

- [Seeding documentation](README.md#seeding-documentation)
- [Adding documents](scripts/README.md#adding-more-documents)
- [Document formats](scripts/README.md#what-it-does)

### Widget Integration

- [Basic usage](frontend/WIDGET_USAGE.md#basic-usage)
- [Configuration options](frontend/WIDGET_USAGE.md#configuration-options)
- [Style isolation](frontend/WIDGET_USAGE.md#style-isolation)
- [Browser support](frontend/WIDGET_USAGE.md#browser-support)

### Deployment

- [Pre-deployment checklist](DEPLOYMENT.md#pre-deployment-checklist)
- [Single server deployment](DEPLOYMENT.md#option-1-single-server-deployment)
- [Docker deployment](DEPLOYMENT.md#option-2-docker-deployment)
- [Cloud deployment (AWS)](DEPLOYMENT.md#option-3-cloud-deployment-aws)

### Operations

- [Monitoring](DEPLOYMENT.md#monitoring)
- [Backup and recovery](DEPLOYMENT.md#backup-and-recovery)
- [Scaling](DEPLOYMENT.md#scaling)
- [Security](DEPLOYMENT.md#security-considerations)

### Troubleshooting

- [Common setup issues](QUICKSTART.md#common-issues)
- [Development issues](README.md#troubleshooting)
- [Production issues](DEPLOYMENT.md#troubleshooting-production-issues)

## 🔍 Finding Specific Information

### How do I...?

**...install the system?**
→ [QUICKSTART.md](QUICKSTART.md) or [README.md#installation](README.md#installation)

**...configure environment variables?**
→ [README.md#environment-variables](README.md#environment-variables)

**...start all services?**
→ [QUICKSTART.md#6-start-all-services](QUICKSTART.md#6-start-all-services)

**...seed documentation?**
→ [README.md#seeding-documentation](README.md#seeding-documentation) or [scripts/README.md](scripts/README.md)

**...embed the widget in my website?**
→ [frontend/WIDGET_USAGE.md](frontend/WIDGET_USAGE.md)

**...deploy to production?**
→ [DEPLOYMENT.md](DEPLOYMENT.md)

**...troubleshoot issues?**
→ [README.md#troubleshooting](README.md#troubleshooting)

**...monitor the system?**
→ [DEPLOYMENT.md#monitoring](DEPLOYMENT.md#monitoring)

**...scale the system?**
→ [DEPLOYMENT.md#scaling](DEPLOYMENT.md#scaling)

**...backup data?**
→ [DEPLOYMENT.md#backup-and-recovery](DEPLOYMENT.md#backup-and-recovery)

## 📝 Document Descriptions

### QUICKSTART.md

A step-by-step guide to get the system running in 5 minutes. Perfect for first-time setup.

**Key sections:**

- Prerequisites check
- Installation steps
- Service startup
- Verification
- Common issues

### README.md

The main documentation covering all aspects of the system in detail.

**Key sections:**

- Project structure
- Prerequisites
- Installation
- Environment variables
- Starting services
- Development workflow
- Seeding documentation
- Widget embedding
- Testing
- Troubleshooting

### frontend/WIDGET_USAGE.md

Complete guide for web developers who want to embed the chat widget in their websites.

**Key sections:**

- Building the widget
- Embedding instructions
- Configuration options
- Style isolation
- Browser support
- Troubleshooting

### scripts/README.md

Documentation for utility scripts, primarily the documentation seeding script.

**Key sections:**

- Prerequisites
- Usage instructions
- Environment variables
- Sample documents
- Adding more documents
- Troubleshooting

### DEPLOYMENT.md

Comprehensive guide for deploying the system to production environments.

**Key sections:**

- Pre-deployment checklist
- Environment setup
- Building for production
- Deployment options (single server, Docker, AWS)
- Post-deployment steps
- Monitoring
- Backup and recovery
- Scaling
- Security

### backend/.env.example

Template for backend environment variables with descriptions.

### frontend/.env.example

Template for frontend environment variables with descriptions.

## 🆘 Getting Help

If you can't find what you're looking for:

1. Check the [Troubleshooting](README.md#troubleshooting) section
2. Review the [Common Issues](QUICKSTART.md#common-issues) in the quick start
3. Search this documentation index for keywords
4. Check the relevant .env.example files for configuration options

## 📚 External Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Qwen2.5 Model Card](https://huggingface.co/Qwen/Qwen2.5-3B)
- [Fastify Documentation](https://www.fastify.io/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Last Updated:** 2024
**Version:** 1.0.0
