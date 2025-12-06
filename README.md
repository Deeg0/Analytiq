# analytIQ

An AI-powered web application that analyzes scientific studies for credibility, bias, and reliability. The tool supports multiple input formats (URL, PDF, DOI, text) and provides comprehensive scoring across methodology quality, evidence strength, bias detection, reproducibility, and statistical validity.

## Features

### Multiple Input Types
- **URL**: Paste a link to a scientific study
- **PDF Upload**: Upload a PDF file of the study
- **DOI**: Enter a DOI number to fetch metadata and content
- **Text/Abstract**: Paste the study text or abstract directly

### Comprehensive Analysis

The analyzer evaluates studies across five key categories:

1. **Methodology Quality** (0-25 points)
   - Sample size adequacy
   - Randomization and blinding procedures
   - Control groups
   - Confounding variables
   - Study design appropriateness

2. **Evidence Strength** (0-20 points)
   - Study type hierarchy (meta-analysis > RCT > observational)
   - Quality of evidence indicators
   - Statistical power analysis

3. **Bias** (0-20 points)
   - Funding sources analysis
   - Author conflicts of interest (financial, personal, professional)
   - Author ownership, stock holdings, and business interests
   - Author affiliations with vested interests
   - Indirect connections (e.g., author owns business related to study topic)
   - Publication bias, selection bias, measurement bias
   - Alignment between author/funder interests and conclusions

4. **Reproducibility** (0-15 points)
   - Methodology clarity
   - Data availability
   - Replication status

5. **Statistical Validity** (0-20 points)
   - P-hacking detection
   - Multiple comparisons issues
   - Statistical test appropriateness
   - Effect size reporting

### Advanced Features

- **Fallacy Detection**: Identifies correlation vs causation errors, overgeneralizations, survey limitations
- **Expert Context**: Compares findings with field consensus and notes controversies
- **Multiple View Modes**:
  - Simple Summary: Non-technical overview
  - Technical Critique: Detailed analysis with quotes
  - Bias Report: Focus on funding and conflicts

### Trust Score

Overall score (0-100) with reliability rating:
- **80-100**: Highly Reliable
- **60-79**: Moderately Reliable
- **40-59**: Questionable
- **0-39**: Unreliable

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
cd AItok
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Configure environment variables:
Create a `.env` file in the `backend` directory (or copy from `.env.example` if it exists):
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

**Note**: The API key has been provided in the initial setup. Make sure the `.env` file exists with your OpenAI API key.

4. Build the backend:
```bash
npm run build
```

## Running the Application

### Development Mode

Start the backend server in development mode:
```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Production Mode

1. Build the TypeScript code:
```bash
cd backend
npm run build
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Select Input Type**: Choose from URL, PDF Upload, DOI, or Text tabs
2. **Provide Content**: Enter the URL, upload PDF, paste DOI, or paste text
3. **Analyze**: Click "Analyze Study" button
4. **Review Results**: 
   - Check the overall trust score
   - Review category breakdowns
   - Switch between Simple Summary, Technical Critique, and Bias Report views
   - Review recommendations and metadata

## API Endpoints

### Health Check
```
GET /api/health
```

### Analyze Study
```
POST /api/analyze
Content-Type: application/json

{
  "inputType": "url" | "pdf" | "doi" | "text",
  "content": "content string",
  "fileName": "optional filename"
}
```

### Analyze PDF (File Upload)
```
POST /api/analyze/pdf
Content-Type: multipart/form-data

file: <PDF file>
```

## Project Structure

```
AItok/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analysis.ts
│   │   │   └── health.ts
│   │   ├── services/
│   │   │   ├── analysisService.ts
│   │   │   ├── openaiService.ts
│   │   │   ├── pdfParser.ts
│   │   │   ├── urlScraper.ts
│   │   │   ├── doiResolver.ts
│   │   │   ├── metadataExtractor.ts
│   │   │   └── scorer.ts
│   │   ├── types/
│   │   │   └── analysis.ts
│   │   ├── utils/
│   │   │   └── prompts.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   └── public/
│       ├── index.html
│       ├── css/
│       │   └── styles.css
│       └── js/
│           ├── app.js
│           ├── api.js
│           └── ui.js
└── README.md
```

## Technologies Used

### Backend
- **Express.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **OpenAI API**: GPT-4 for analysis
- **pdf-parse**: PDF text extraction
- **Cheerio**: HTML parsing for web scraping
- **Axios**: HTTP client
- **Multer**: File upload handling
- **express-rate-limit**: Rate limiting

### Frontend
- **Vanilla JavaScript (ES6 Modules)**: Modern JavaScript without frameworks
- **HTML5/CSS3**: Semantic markup and styling

## Error Handling

The application includes comprehensive error handling:
- API rate limiting (10 requests per 15 minutes)
- File size limits (10MB for PDFs)
- Timeout handling for slow requests
- Graceful error messages for users
- Input validation

## Security Features

- API key stored securely in environment variables
- CORS configuration
- Rate limiting on API endpoints
- File type validation
- Input sanitization

## Limitations

- PDF parsing works best with text-based PDFs (scanned PDFs may require OCR)
- URL scraping may fail on sites that block automated access
- DOI resolution depends on external APIs (CrossRef, Unpaywall)
- Analysis quality depends on OpenAI API availability and response quality

## Future Enhancements

- OCR support for scanned PDFs
- Caching of analysis results
- Export reports as PDF
- Batch analysis of multiple studies
- User accounts and history
- Integration with more metadata sources
- Journal impact factor lookup
- Citation network analysis

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

