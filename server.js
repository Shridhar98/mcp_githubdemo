import dotenv from "dotenv";
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

console.log(" MCP GitHub Server Started");

//  Env variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

//  Create MCP Server
const server = new Server(
  {
    name: "github-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ==========================
//  TOOL LIST
// ==========================
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "listRepoFiles",
        description: "List files in the GitHub repository",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "getFileContent",
        description: "Get file content from repo",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path of file (e.g. README.md)",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "getCommits",
        description: "Get latest commits from repository",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// ==========================
//  TOOL EXECUTION
// ==========================
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    //  1. List Repo Files
    if (name === "listRepoFiles") {
      console.log(" Tool called: listRepoFiles");

      const res = await axios.get(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        }
      );

      const files = res.data.map((f) => f.name);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(files, null, 2),
          },
        ],
      };
    }

    //  2. Get File Content
    if (name === "getFileContent") {
      console.log(" Tool called: getFileContent", args);

      const res = await axios.get(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${args.path}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        }
      );

      const content = Buffer.from(res.data.content, "base64").toString("utf-8");

      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    }

    //  3. Get Commits
    if (name === "getCommits") {
      console.log(" Tool called: getCommits");

      const res = await axios.get(
        `https://api.github.com/repos/${OWNER}/${REPO}/commits`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        }
      );

      const commits = res.data
        .slice(0, 5)
        .map((c) => c.commit.message);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(commits, null, 2),
          },
        ],
      };
    }

    //  Unknown tool
    return {
      content: [{ type: "text", text: "Unknown tool" }],
    };

  } catch (error) {
    console.error(" Error:", error.message);

    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// ==========================
//  START SERVER
// ==========================
const transport = new StdioServerTransport();
await server.connect(transport);
