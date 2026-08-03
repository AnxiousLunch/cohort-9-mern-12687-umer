# Following contains the finalized schema

- Users table for user information -> passwords, username, user_id, email

- Refresh_Tokens to store refresh tokens -> id, token_hash

- Documents -> Represents a note, collection of blocks

- Blocks -> Represents different types of blocks a document can contain

## Formal Definition

Formalizing each thing into a table can be 

- User {
    id, 
    username, 
    email, 
    password_hash, 
    created_at, 
    updated_at

} 
- RefreshToken {
    id, 
    user_id, 
    token_hash, 
    expires_at, 
    created_at

}

- Document {
    id,
    user_id, 
    title, 
    created_at, 
    updated_at
}

- Block {
    id, 
    document_id, 
    type, 
    content (Json), 
    position, 
    created_at, 
    updated_at
} 