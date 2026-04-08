# mcp_githubdemo

A simple Model Context Protocol (MCP) server for GitHub repository access.

This project starts a stdio-based MCP server in Node.js and exposes tools that call the GitHub REST API to:

- list repository files
- fetch file contents
- fetch recent commits

## Requirements

- Node.js 18+
- A GitHub personal access token with access to the target repository
- You can get the personal access token from the github -> userprofile-> settings -> developersetting-> fine grained token -> create token -> give access to the repo

## Installation

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username_or_org
GITHUB_REPO=your_repository_name
```

## Run the Server

Start the MCP server with:

```bash
node server.js
```

The server uses stdio transport, so it is intended to be launched by an MCP client.

## MCP Configuration

This repository includes an MCP config file:
create .mcp.json and include this code in the file
```json
{
  "servers": {
    "github": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}
```

## Available Tools

### `listRepoFiles`

Lists files in the configured GitHub repository root.

### `getFileContent`

Returns the contents of a file from the configured repository.

Input:

```json
{
  "path": "README.md"
}
```

### `getCommits`

Returns the latest 5 commit messages from the configured repository.

## Project Structure

- `server.js`: MCP server implementation
- `.mcp.json`: MCP client configuration for launching the server
- `package.json`: project metadata and dependencies

## Dependencies

- `@modelcontextprotocol/sdk`
- `axios`
- `dotenv`

## Notes

- The server reads repository configuration from environment variables at startup.
- GitHub API requests are authenticated with `GITHUB_TOKEN`.
- Current file listing is implemented against the repository root contents endpoint.
