# Barnwell Family Tree MCP Server

This MCP (Model Context Protocol) server provides AI-powered tools for managing your family tree data. It integrates with your existing Neon database and uses OpenAI to help create and manage family nodes.

## Features

- **Database Operations**: Create, read, update, and search family nodes
- **AI-Powered Suggestions**: Use natural language to describe family members and get structured data
- **Relationship Suggestions**: AI suggests potential relationships between family members
- **Data Validation**: AI validates family node data and suggests improvements

## Setup

1. **Install Dependencies**:

   ```bash
   cd mcp-server
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the `mcp-server` directory:

   ```
   DATABASE_URL=your_neon_database_url
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Build the Server**:
   ```bash
   npm run build
   ```

## Available Tools

### Basic Operations

- `get_all_family_nodes`: Retrieve all family members
- `create_family_node`: Create a new family member
- `update_family_node`: Update an existing family member
- `get_family_node_by_id`: Get a specific family member by ID
- `search_family_nodes`: Search for family members

### AI-Powered Tools

- `ai_suggest_family_node`: Use natural language to describe a family member
- `ai_suggest_relationships`: Get AI suggestions for potential relationships
- `ai_validate_family_node`: Validate family node data with AI

## Usage Examples

### Creating a Family Member with AI

```
ai_suggest_family_node: "My great-grandfather John Smith was born in 1890 in London, England. He was a carpenter and married to Mary Smith. They had three children: William, Elizabeth, and Robert."
```

### Searching for Family Members

```
search_family_nodes: "Smith"
```

### Validating Data

```
ai_validate_family_node: { "name": "John Smith", "birth": "1890-01-01", "death": "1885-12-31" }
```

## Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Integration with AI Assistants

This MCP server can be used with any AI assistant that supports the Model Context Protocol, such as:

- Claude Desktop
- ChatGPT with MCP plugins
- Custom AI applications

The server provides structured access to your family tree data, allowing AI assistants to help you manage and expand your family tree through natural language interactions.

## Database Schema

The server connects to the same Neon database used by your main application, with tables:

- `family_node`: Main family member data
- `spouse`: Marriage relationships
- `child`: Parent-child relationships

## Security

- All database operations use parameterized queries to prevent SQL injection
- Environment variables are used for sensitive configuration
- The server runs in a controlled environment with access only to the family tree database
