# How to Test Locally

## Quick Start

### Option 1: Test Everything Together (Recommended)

The backend server automatically serves the frontend, so you only need to run one command:

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open your browser:**
   - Go to: `http://localhost:3000`
   - The frontend will be served automatically
   - API calls will go to `http://localhost:3000/api`

3. **Test the new color scheme:**
   - Check the overall design - should be clean and professional
   - Verify the 70-20-10 color rule:
     - 70% neutral background (#FAFBFC)
     - 20% white cards
     - 10% blue accent (#2563EB) for buttons and highlights
   - Test on mobile by resizing browser or using dev tools (F12 → Device Toolbar)

### Option 2: Test Frontend Only (Visual Testing)

If you just want to see the visual changes without running the backend:

1. **Use Python's built-in server:**
   ```bash
   cd frontend/public
   python3 -m http.server 8080
   ```
   Then open: `http://localhost:8080`

   **Note:** API calls won't work, but you can see the design changes.

2. **Or use Node's http-server:**
   ```bash
   npx http-server frontend/public -p 8080
   ```

## Testing Checklist

### Visual Design
- [ ] Background is neutral light gray (#FAFBFC)
- [ ] Cards are white with subtle borders
- [ ] Buttons use blue accent color (#2563EB)
- [ ] No excessive gradients
- [ ] Clean, professional appearance
- [ ] Consistent spacing and borders

### Mobile Responsiveness
- [ ] Test on phone (or browser dev tools)
- [ ] Text is readable
- [ ] Buttons are easy to tap (44px minimum)
- [ ] No horizontal scrolling
- [ ] Layout adapts properly

### Functionality
- [ ] Can submit URL for analysis
- [ ] Can submit text for analysis
- [ ] Results display correctly
- [ ] All sections render properly
- [ ] Colors match the new scheme

## Browser Dev Tools for Mobile Testing

1. **Chrome/Edge:**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Click device toolbar icon (or `Cmd+Shift+M`)
   - Select device or custom size

2. **Firefox:**
   - Press `F12`
   - Click responsive design mode icon (or `Cmd+Shift+M`)

3. **Safari:**
   - Enable Developer menu: Preferences → Advanced → Show Develop menu
   - Develop → Enter Responsive Design Mode

## Troubleshooting

**Backend won't start:**
- Make sure you have a `.env` file in the `backend` folder
- Check that `OPENAI_API_KEY` is set in `.env`
- Run `npm install` in the backend folder

**Frontend not loading:**
- Check that backend is running on port 3000
- Try `http://localhost:3000` in browser
- Check browser console for errors (F12)

**API calls failing:**
- Make sure backend is running
- Check that CORS is allowing localhost
- Verify `.env` has valid `OPENAI_API_KEY`

**Colors not updating:**
- Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clear browser cache
- Check that CSS file was saved

## Quick Test URLs

Once running, you can test with:
- Health check: `http://localhost:3000/api/health`
- Main app: `http://localhost:3000`

