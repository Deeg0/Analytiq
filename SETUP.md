# Quick Setup Guide

## Initial Setup Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create the `.env` file:**
   Create a file named `.env` in the `backend` directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   ```
   
   **Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key. You can get one from https://platform.openai.com/api-keys

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

## Testing

Once the server is running, you can test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

## Troubleshooting

- **Port already in use**: Change the PORT in `.env` file
- **Module not found errors**: Make sure you ran `npm install` in the backend directory
- **OpenAI API errors**: Verify your API key is correct in the `.env` file
- **PDF upload fails**: Check that the file is under 10MB and is a valid PDF

## Development vs Production

- **Development**: Use `npm run dev` for auto-reloading
- **Production**: Build with `npm run build` then start with `npm start`
