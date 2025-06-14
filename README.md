# Resume Analysis Service

A modern, streamlined service for parsing and analyzing resume documents.

## Features

- High-accuracy resume parsing using large language models
- Structured data output following RMS (Resume Metadata Standard) format
- API endpoints for parsing, validation, and status checks
- Firebase integration for data persistence
- Frontend adapter for direct integration with UI components

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct-q2_K
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/parse` - Parse a resume
- `POST /api/validate` - Validate resume metadata
- `GET /api/status` - Check service status

## Architecture

The service is built around three main components:

1. **RMS Parser** - Core parser that extracts structured data from resume text
2. **Schema Validation** - Zod schema for validating resume data
3. **Adapters** - Convert between RMS format and frontend/storage formats

## License

MIT