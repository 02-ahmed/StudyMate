# Utility Functions Documentation

This directory contains utility functions used throughout the StudyMate application.

## Schema Validation

The `schemas.js` file contains validation functions and schema definitions for all collections in the StudyMate database. These utilities ensure data consistency and integrity across the application.

### Available Functions

- `validateFlashcardSet(data)`: Validates a flashcard set object against the defined schema
- `validateTestResult(data)`: Validates a test result object against the defined schema
- `createFlashcardSet(data)`: Creates a properly structured flashcard set with validation
- `createTestResult(data)`: Creates a properly structured test result with validation

### Using Schema Validation

When creating or updating data in Firestore, always use these validators to ensure data consistency:

```javascript
// Example: Creating a new flashcard set
import { createFlashcardSet } from "../utils/schemas";

const newFlashcardSet = createFlashcardSet({
  name: "Biology 101",
  createdAt: new Date(),
  tags: ["biology", "science"],
  flashcards: [
    { front: "What is a cell?", back: "The basic unit of life", id: 0 },
    { front: "What is DNA?", back: "Deoxyribonucleic Acid", id: 1 },
  ],
});

// Save to Firestore
await addDoc(flashcardsRef, newFlashcardSet);
```

```javascript
// Example: Validating existing data
import { validateFlashcardSet } from "../utils/schemas";

// Before updating, validate the data
if (!validateFlashcardSet(updatedData)) {
  console.error("Invalid data format");
  return;
}

// Then proceed with the update
await updateDoc(docRef, updatedData);
```

## Schema Reference

For a complete reference of all schemas, see the `SCHEMA.md` file in the project root directory.

## Best Practices

1. Always validate data before writing to Firestore
2. Use the creation helpers when creating new documents
3. Keep the schema definitions updated if you add new fields
4. Respect backward compatibility when evolving schemas
