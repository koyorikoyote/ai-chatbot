import { ChromaClient } from "chromadb";

async function resetChromaDB() {
    console.log("Resetting ChromaDB collections...\n");

    const host = process.env.CHROMA_HOST || "localhost";
    const port = parseInt(process.env.CHROMA_PORT || "8001", 10);

    const client = new ChromaClient({
        path: `http://${host}:${port}`,
    });

    try {
        console.log("Deleting old collections...");

        try {
            await client.deleteCollection({ name: "documents" });
            console.log("✓ Deleted documents collection");
        } catch (error) {
            console.log("  Documents collection doesn't exist");
        }

        try {
            await client.deleteCollection({ name: "questions" });
            console.log("✓ Deleted questions collection");
        } catch (error) {
            console.log("  Questions collection doesn't exist");
        }

        console.log("\n✓ ChromaDB reset complete!");
        console.log("\nNext steps:");
        console.log("1. Start the backend server: npm run dev");
        console.log("2. Run the seed script: cd ../scripts && npx tsx seed-docs.ts");
        console.log("3. Test the chatbot in the frontend");

    } catch (error) {
        console.error("✗ Error:", error instanceof Error ? error.message : error);
    }
}

resetChromaDB();
