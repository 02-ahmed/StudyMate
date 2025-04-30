# StudyMate Database Schema Documentation

This document describes the data structure for all collections in the StudyMate application. These schemas should be maintained consistently to ensure data integrity across the application.

## Overview

Our Firebase database follows this structure:

```
/users/{userId}/
    /flashcardSets/{setId}/
    /testResults/{resultId}/
```

## Schemas

### Flashcard Sets

**Collection Path:** `/users/{userId}/flashcardSets/{setId}`

**Description:** Contains sets of flashcards created by users. Each flashcard set contains multiple flashcards with front and back content.

**Schema:**

| Field      | Type      | Description                      | Required |
| ---------- | --------- | -------------------------------- | -------- |
| name       | string    | Name of the flashcard set        | Yes      |
| createdAt  | timestamp | When the set was created         | Yes      |
| tags       | string[]  | Array of tags for categorization | No       |
| flashcards | object[]  | Array of flashcard objects       | Yes      |

**Flashcard Object Schema:**

| Field | Type   | Description                                  | Required |
| ----- | ------ | -------------------------------------------- | -------- |
| front | string | Content for the front of the card (question) | Yes      |
| back  | string | Content for the back of the card (answer)    | Yes      |
| id    | number | Numeric identifier for the card              | Yes      |

**Example:**

```javascript
{
  "name": "Biology 101",
  "createdAt": Timestamp(2023-04-15),
  "tags": ["biology", "science", "cell"],
  "flashcards": [
    {
      "front": "What is a cell?",
      "back": "The basic structural and functional unit of life.",
      "id": 0
    },
    {
      "front": "What is mitosis?",
      "back": "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.",
      "id": 1
    }
  ]
}
```

### Test Results

**Collection Path:** `/users/{userId}/testResults/{resultId}`

**Description:** Stores results from practice tests and quizzes taken by users.

**Schema:**

| Field            | Type      | Description                                  | Required |
| ---------------- | --------- | -------------------------------------------- | -------- |
| userId           | string    | ID of the user who took the test             | Yes      |
| flashcardSetId   | string    | ID of the flashcard set the test is based on | Yes      |
| setName          | string    | Name of the flashcard set                    | Yes      |
| dateTaken        | timestamp | When the test was taken                      | Yes      |
| score            | number    | Score as a percentage                        | Yes      |
| timeSpentSeconds | number    | Time spent on the test in seconds            | Yes      |
| totalQuestions   | number    | Total number of questions                    | Yes      |
| correctAnswers   | number    | Number of correct answers                    | Yes      |
| tags             | string[]  | Tags associated with the flashcard set       | No       |
| type             | string    | Type of test (e.g., "practice_test")         | No       |
| isNewDay         | boolean   | Whether this was the first test of the day   | No       |
| questionDetails  | object[]  | Details for each question                    | Yes      |

**Question Detail Object Schema:**

| Field         | Type           | Description                                                    | Required |
| ------------- | -------------- | -------------------------------------------------------------- | -------- |
| type          | string         | Question type: "multipleChoice", "trueFalse", or "fillInBlank" | Yes      |
| question      | string         | The question text                                              | Yes      |
| correctAnswer | string/boolean | The correct answer (boolean for trueFalse)                     | Yes      |
| userAnswer    | string/boolean | User's answer (boolean for trueFalse)                          | Yes      |
| isCorrect     | boolean        | Whether user answered correctly                                | Yes      |
| tags          | string[]       | Specific tags for this question                                | No       |

**Example:**

```javascript
{
  "userId": "user_abc123",
  "flashcardSetId": "set_xyz789",
  "setName": "Biology 101",
  "dateTaken": Timestamp(2023-05-20),
  "score": 80,
  "timeSpentSeconds": 300,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "tags": ["biology", "science"],
  "type": "practice_test",
  "isNewDay": true,
  "questionDetails": [
    {
      "type": "multipleChoice",
      "question": "What is the basic unit of life?",
      "correctAnswer": "Cell",
      "userAnswer": "Cell",
      "isCorrect": true,
      "tags": ["cell biology"]
    },
    {
      "type": "trueFalse",
      "question": "Mitochondria is the powerhouse of the cell.",
      "correctAnswer": true,
      "userAnswer": true,
      "isCorrect": true
    },
    {
      "type": "fillInBlank",
      "question": "DNA stands for ________.",
      "correctAnswer": "Deoxyribonucleic Acid",
      "userAnswer": "Deoxyribonucleic Acid",
      "isCorrect": true
    }
  ]
}
```

## Best Practices

1. Always validate data against these schemas before writing to the database.
2. Use the validation functions in `utils/schemas.js` to ensure data consistency.
3. Maintain backward compatibility when adding new fields.
4. Document any schema changes in this file.

## Schema Evolution

If schema changes are required, follow these guidelines:

1. Add new fields as optional to maintain compatibility with existing documents
2. Never remove or rename existing fields
3. Document changes in this file with dates
4. Update validation functions to handle both old and new schemas

## Schema Validation

Validation functions for these schemas are available in `utils/schemas.js`:

- `validateFlashcardSet(data)` - Validates flashcard set data
- `validateTestResult(data)` - Validates test result data
- `createFlashcardSet(data)` - Creates a new, validated flashcard set
- `createTestResult(data)` - Creates a new, validated test result
