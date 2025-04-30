# Schema Evolution Guidelines

This document provides guidelines for evolving database schemas in the StudyMate application to ensure data consistency and backward compatibility.

## Principles of Schema Evolution

1. **Backward Compatibility**: New schema versions must be able to read old data.
2. **Forward Compatibility**: Old code must be able to read new data (to the extent possible).
3. **Documentation**: All schema changes must be documented.
4. **Validation**: Schema validation must be updated to support both old and new schema versions.

## Process for Schema Changes

Follow these steps when making changes to database schemas:

### 1. Document the Change

Update the `SCHEMA.md` file with the proposed changes, including:

- Date of the change
- Description of the change
- Reason for the change
- Old and new schema structures

Example:

```markdown
### Change History

#### 2023-07-15: Added `difficulty` field to Flashcard Schema

**Reason:** To allow users to rate and sort flashcards by difficulty.

**Change:**

- Added optional `difficulty` field (number, 1-5) to each flashcard object
```

### 2. Update Validation Functions

Modify the validation functions in `utils/schemas.js` to handle both old and new schemas:

```javascript
export function validateFlashcardSet(data) {
  // Existing validation
  if (!data.name || typeof data.name !== "string") return false;
  if (!data.createdAt) return false;
  if (!Array.isArray(data.flashcards)) return false;

  // Validate each flashcard, including the new optional difficulty field
  for (const card of data.flashcards) {
    if (!card.front || typeof card.front !== "string") return false;
    if (!card.back || typeof card.back !== "string") return false;
    if (typeof card.id !== "number") return false;

    // New optional field validation
    if (
      card.difficulty !== undefined &&
      (typeof card.difficulty !== "number" ||
        card.difficulty < 1 ||
        card.difficulty > 5)
    ) {
      return false;
    }
  }

  // Rest of validation
  // ...
}
```

### 3. Update Creation Functions

Update the creation functions to include new fields with default values:

```javascript
export function createFlashcardSet(data) {
  return {
    name: data.name || "Untitled Set",
    createdAt: data.createdAt || new Date(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    flashcards: Array.isArray(data.flashcards)
      ? data.flashcards.map((card, index) => ({
          front: card.front || "",
          back: card.back || "",
          id: typeof card.id === "number" ? card.id : index,
          difficulty:
            typeof card.difficulty === "number" ? card.difficulty : undefined,
        }))
      : [],
  };
}
```

### 4. Update Firebase Security Rules

If needed, update the Firebase security rules to accommodate the schema changes:

```javascript
function validateFlashcardSet(data) {
  return data.keys().hasAll(['name', 'createdAt', 'flashcards']) &&
         data.name is string &&
         data.createdAt is timestamp &&
         data.flashcards is list &&

         // Validate flashcards including new optional fields
         data.flashcards.every(card =>
           card.keys().hasAll(['front', 'back', 'id']) &&
           card.front is string &&
           card.back is string &&
           card.id is number &&
           (!('difficulty' in card) || (card.difficulty is number &&
                                       card.difficulty >= 1 &&
                                       card.difficulty <= 5))
         );
}
```

### 5. Migration Strategy (if needed)

For significant changes, document a migration strategy:

```markdown
## Migration Plan for Adding Difficulty Field

1. Deploy schema changes to handle both old and new formats
2. Update the UI to allow setting difficulty
3. No migration needed for existing data as the field is optional
4. For analytical processing, treat missing difficulty as "not rated"
```

## Types of Schema Changes

### Safe Changes (No Migration Required)

- Adding optional fields
- Removing validation requirements (making required fields optional)
- Adding new subcollections

### Changes Requiring Careful Handling

- Renaming fields (requires read/write handlers for both old and new names)
- Changing field types (requires data conversion)
- Splitting or merging fields

### Changes Requiring Migration

- Removing fields that code depends on
- Fundamentally reorganizing collection structure
- Adding required fields without defaults

## Testing Schema Changes

Before deploying schema changes:

1. Test with old data to ensure backward compatibility
2. Test with new data to ensure validation works as expected
3. Test with a mix of old and new code to ensure compatibility

## Maintaining a Schema Version Registry

In `SCHEMA.md`, maintain a version history table:

```markdown
## Schema Version History

| Version | Date       | Changes                        | Migration Required |
| ------- | ---------- | ------------------------------ | ------------------ |
| 1.0     | 2023-04-01 | Initial schema                 | N/A                |
| 1.1     | 2023-07-15 | Added difficulty to flashcards | No                 |
```

This provides a clear history of schema changes for all developers.
