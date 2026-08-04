# Database Schema

The application consists of four primary models:

- **User** – User account information.
- **RefreshToken** –  Store refresh tokens for each valid user session.
- **Note** – Represents a note containing an ordered collection of blocks.

## Schema Definition

```prisma
model User {
  id            Int            @id @default(autoincrement())
  username      String         @unique
  email         String         @unique
  passwordHash  String         @map("password_hash")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
  notes         Note[]
  refreshTokens RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId], map: "refresh_tokens_user_id_fkey")
  @@map("refresh_tokens")
}

model Note {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  title     String
  content   String   @db.LongText
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("notes")
}
```

## Relationships

- A User can own many Notes.
- A User can have many RefreshTokens.
- A Note belongs to one User.
