# Recent Changes

## User Feedback Fixes (Jan 4, 2026)

### 1. Font Changed ✓
- **Issue**: Comic Sans MS was not readable
- **Fix**: Replaced with system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', etc.`)
- **Files**: `src/styles.css`

### 2. Browser Popups Removed ✓
- **Issue**: Native `alert()` and `confirm()` dialogs were unstyled
- **Fix**: Created custom styled modal component matching game aesthetic
- **Features**:
  - Animated overlay with fade-in
  - Styled modal with warm colors
  - Slide-in animation
  - Click outside to close
  - Keyboard accessible
- **Files**: `src/styles.css` (modal styles), `src/main.js` (showModal method)

### 3. Progress Counter Hidden Initially ✓
- **Issue**: "Found X of N" showing before first submission
- **Fix**: Added `progress-indicator` class with `opacity: 0` initially
- **Behavior**: Shows only after first submit
- **Files**: `index.html`, `src/styles.css`, `src/ui.js`

### 4. "Reveal Remaining" Button Removed ✓
- **Issue**: Unnecessary button cluttering interface
- **Fix**: Completely removed button and associated logic
- **Files**: `index.html`, `src/ui.js`

### 5. Auto-Reveal Missing Neighbors ✓
- **Issue**: Needed manual reveal step
- **Fix**: On submit, automatically reveal all missing neighbors
- **Behavior**:
  - User submits guesses
  - Correct guesses turn green
  - Incorrect guesses turn red
  - Missing neighbors automatically added and shown
  - Map shows all neighbors (correct + missed)
- **Files**: `src/game.js` (submit method)

### 6. Penalty for Missed Countries ✓
- **Issue**: No penalty for not guessing all neighbors
- **Fix**: Each missed neighbor adds +1 to penalties
- **Scoring**:
  - Correct guess: +1 score
  - Incorrect guess: +1 penalty (only first time)
  - Missed neighbor: +1 penalty
- **Files**: `src/game.js` (submit method)

## Technical Changes

### Game Logic (`src/game.js`)
- Modified `submit()` method:
  - Sets `revealed = true` automatically
  - Counts missed neighbors
  - Adds penalties for missed neighbors
  - Auto-adds missing neighbors to guesses list
  - Returns `missed` count in result

### UI Manager (`src/ui.js`)
- Removed `revealBtn` element reference
- Removed reveal button event binding
- Added `progressIndicator` element reference
- Modified `updateScores()` to show progress after submission
- Modified `resetForNewRound()` to hide progress for new round
- Updated `updateButtons()` to remove reveal button logic

### Main Controller (`src/main.js`)
- Removed `onReveal` callback
- Removed `handleReveal()` method
- Modified `handleSubmit()` to use modal instead of confirm
- Added `showModal()` helper for styled modals
- Added `showNextRoundModal()` with game statistics
- Added `showErrorModal()` for error handling

### Styles (`src/styles.css`)
- Changed font from Comic Sans to system font stack
- Added modal overlay styles
- Added modal container styles
- Added modal button styles
- Added progress indicator hidden/visible states
- All fonts now inherit from body (cleaner)

### HTML (`index.html`)
- Added `progress-indicator` class to progress counter
- Removed "Reveal Remaining" button
- Cleaner action button section

## New Features

### Styled Modals
Modals now show:
- ✅ Number of correct guesses
- ❌ Number of wrong guesses
- ⚠️ Number of missed neighbors
- "Next Round" button to continue

### Improved Feedback
- Immediate visual feedback on submit
- Penalties clearly tracked
- Map shows complete picture (all neighbors)
- Round automatically completes after submission

## User Experience Improvements

1. **Faster gameplay**: No manual reveal step needed
2. **Better readability**: System fonts are crisp and clear
3. **Consistent styling**: Modals match game aesthetic
4. **Less clutter**: One button instead of two
5. **Clear penalties**: Missed neighbors count against score
6. **Smooth flow**: Auto-progress to next round

## File Changes Summary

```
Modified:
- src/styles.css       (font change, modal styles, progress indicator)
- src/game.js          (auto-reveal, penalties for missed)
- src/ui.js            (remove reveal button, progress logic)
- src/main.js          (modal system, remove reveal handler)
- index.html           (remove reveal button, add progress class)

Added:
- CHANGES.md           (this file)
```

## Testing Checklist

- [x] Font is readable (system fonts)
- [x] No browser popups (styled modals)
- [x] Progress hidden initially
- [x] Progress shows after submit
- [x] Progress resets on new round
- [x] No "Reveal" button visible
- [x] Submit auto-reveals missing neighbors
- [x] Penalties added for missed neighbors
- [x] Map shows correctly after submit
- [x] Modal shows round statistics
- [x] Next round works from modal
- [x] Build succeeds

## Next Steps (Optional)

- Add timer per round
- Add sound effects on correct/incorrect
- Add animation for revealed neighbors
- Add difficulty levels (filter by neighbor count)
- Add statistics dashboard
