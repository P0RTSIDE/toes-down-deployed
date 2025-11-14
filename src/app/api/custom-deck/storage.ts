// Shared storage for custom decks
// Note: In a serverless environment, this will reset on cold starts
// For production, consider using a database (MongoDB, PostgreSQL, Redis, etc.)
const customDecks = new Map<string, string[]>();

export { customDecks };
