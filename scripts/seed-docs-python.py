#!/usr/bin/env python3
"""Seed ChromaDB with sample documents using Python client"""

import chromadb
from pathlib import Path
import json

def main():
    print("🚀 Seeding ChromaDB with sample documents\n")
    
    # Connect to ChromaDB
    client = chromadb.HttpClient(host='localhost', port=8000)
    
    # Get or create documents collection
    print("📦 Creating documents collection...")
    collection = client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"}
    )
    print(f"✓ Collection ready: {collection.name}\n")
    
    # Sample documents
    docs_dir = Path(__file__).parent.parent / "docs"
    documents = []
    metadatas = []
    ids = []
    
    doc_id = 1
    for md_file in docs_dir.rglob("*.md"):
        if md_file.name == ".gitkeep":
            continue
            
        content = md_file.read_text(encoding='utf-8')
        relative_path = md_file.relative_to(docs_dir)
        category = relative_path.parts[0] if len(relative_path.parts) > 1 else "general"
        
        print(f"📄 Adding: {relative_path}")
        
        documents.append(content)
        metadatas.append({
            "title": str(relative_path),
            "category": category,
            "source": str(md_file),
            "lastUpdated": "2025-11-20T00:00:00Z"
        })
        ids.append(f"doc_{doc_id}")
        doc_id += 1
    
    if documents:
        print(f"\n📥 Indexing {len(documents)} documents...")
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"✓ Successfully indexed {len(documents)} documents!\n")
    else:
        print("⚠️  No documents found to index\n")
    
    # Verify
    count = collection.count()
    print(f"📊 Total documents in collection: {count}")

if __name__ == "__main__":
    main()
