# Database Schema

The application consists of four primary models:

- **User** – User account information.
- **RefreshToken** –  Store refresh tokens for each valid user session.
- **Document** – Represents a note containing an ordered collection of blocks.
- **Block** – Represents an individual content block within a document.

## Schema Definition

```prisma
model User {
  id            Int
  username      String
  email         String
  passwordHash  String
  createdAt     DateTime
  updatedAt     DateTime

  documents      Document[]
  refreshTokens  RefreshToken[]
}

model RefreshToken {
  id          Int
  userId      Int
  tokenHash   String
  expiresAt   DateTime
  createdAt   DateTime

  user User
}

model Document {
  id          Int
  userId      Int
  title       String
  createdAt   DateTime
  updatedAt   DateTime

  user    User
  blocks  Block[]
}

model Block {
  id          Int
  documentId  Int
  type        BlockType
  content     Json
  position    Int
  createdAt   DateTime
  updatedAt   DateTime

  document Document
}

enum BlockType {
  RICH_TEXT
  MARKDOWN
  WHITEBOARD
  CODE
}
```

## Relationships

- A User can own many Documents.
- A User can have many RefreshTokens.
- A Document belongs to one User.
- A Document contains many Blocks.
- A Block belongs to one Document.