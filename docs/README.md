# Documentation

This directory contains sample documentation that can be indexed into the AI chatbot's knowledge base.

## Directory Structure

```
docs/
├── products/           # Product information
│   ├── product-overview.md
│   └── pricing.md
├── services/           # Service documentation
│   ├── integration-guide.md
│   └── support.md
└── faq/               # Frequently asked questions
    ├── general.md
    └── technical.md
```

## Categories

### Products

Documentation about the AI chatbot products and features.

### Services

Guides and information about services, integration, and support.

### FAQ

Frequently asked questions organized by topic.

## Adding New Documents

To add new documentation:

1. Create a new `.md` file in the appropriate category directory
2. Use a clear, descriptive filename (e.g., `api-reference.md`)
3. Start the document with a `#` heading for the title
4. Write clear, concise content
5. Run the seed script to index: `npm run seed-docs`

## Document Format

Each document should follow this structure:

```markdown
# Document Title

Brief introduction or overview.

## Section 1

Content for section 1.

### Subsection 1.1

Detailed content.

## Section 2

Content for section 2.
```

## Best Practices

- Use clear, descriptive headings
- Keep paragraphs concise
- Use bullet points for lists
- Include code examples where relevant
- Link to related documents when appropriate
- Update documents regularly to keep information current

## Indexing Documents

After adding or updating documents, run the seed script to index them:

```bash
npm run seed-docs
```

See `scripts/README.md` for more details on the seeding process.
