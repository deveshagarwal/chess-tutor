# AI-Powered Move Analysis Setup

## Overview

The Train with AI mode now uses **real AI** (OpenAI GPT-4) to provide intelligent, contextual feedback on your moves instead of hardcoded rules.

## Features with AI

### Smart, Contextual Feedback
Instead of generic messages, you get:
- **Context-aware analysis** - Understands opening principles, middlegame tactics, endgame technique
- **Personalized explanations** - Tells you WHY your move was good/bad
- **Tactical insights** - Identifies specific threats, weaknesses, and opportunities
- **Educational coaching** - Helps you learn patterns and improve

### Example Feedback

**Without AI (rule-based):**
> ⚠️ Inaccuracy. You lost 0.8 pawns. This is playable but not optimal.

**With AI:**
> ⚠️ Inaccuracy. While Nf6 develops a piece, it blocks your f-pawn and limits your king's safety options. In the opening, consider moves that control the center like d5 or develop your light-squared bishop first to maintain flexibility.

## Setup Instructions

### Option 1: Use AI Analysis (Recommended)

1. **Get an OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

2. **Add to Environment Variables**
   - Open `.env.local` in your project root
   - Add this line:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Restart Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **That's it!** Train mode now uses AI

### Option 2: Use Rule-Based Analysis (Free)

Don't want to set up OpenAI? No problem!

- The app automatically falls back to rule-based analysis
- Still works great with detailed feedback
- Just skip the API key setup

## Cost

### OpenAI Pricing (GPT-4o-mini)
- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens

### Typical Usage
- Each move analysis: ~400 tokens (input + output)
- Cost per analysis: **~$0.0003** (less than a penny!)
- 100 moves analyzed: ~$0.03
- 1000 moves analyzed: ~$0.30

**Very affordable** for personal use! Most users spend less than $1/month.

### Free Tier
- OpenAI gives $5 free credits for new accounts
- That's about **15,000+ move analyses** for free!

## How It Works

1. **You make a move** in Train mode
2. **Stockfish evaluates** the position (before and after)
3. **API call to OpenAI** with:
   - Move notation
   - Evaluation change
   - Game phase (opening/middlegame/endgame)
   - Position context
   - Best move suggestion
4. **AI generates** intelligent, educational feedback
5. **Feedback displayed** in the sidebar

## Comparison

| Feature | Rule-Based | AI-Powered |
|---------|-----------|------------|
| Cost | Free | ~$0.0003 per move |
| Speed | Instant | 1-2 seconds |
| Feedback Quality | Good | Excellent |
| Contextual | Limited | Very high |
| Tactical Insights | Basic | Detailed |
| Learning Value | Good | Outstanding |

## Troubleshooting

### "Unable to analyze this move"
- Check your API key is correct in `.env.local`
- Make sure you have credits in your OpenAI account
- Check the browser console for error messages
- Falls back to rule-based analysis automatically

### API Key Not Working
- Ensure the key starts with `sk-`
- Check for extra spaces in `.env.local`
- Restart the dev server after adding the key
- Verify the key is active at https://platform.openai.com/api-keys

### Slow Analysis
- AI analysis takes 1-2 seconds (normal)
- Rule-based fallback is instant if API fails
- Check your internet connection

### Out of Credits
- Check usage at https://platform.openai.com/usage
- Add payment method or wait for monthly reset
- App automatically falls back to rule-based analysis

## Privacy & Security

- API key is stored in `.env.local` (never committed to git)
- Only move data is sent to OpenAI (no personal info)
- Position evaluations stay local (Stockfish runs in browser)
- You can delete API call logs in OpenAI dashboard

## Switching Between Modes

### To Enable AI:
1. Add `OPENAI_API_KEY` to `.env.local`
2. Restart server

### To Disable AI:
1. Remove or comment out `OPENAI_API_KEY` in `.env.local`
2. Restart server
3. Will automatically use rule-based analysis

## Example `.env.local`

```bash
# OpenAI for AI-powered analysis (optional)
OPENAI_API_KEY=sk-proj-abc123...

# Firebase for multiplayer (optional)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
# ... other Firebase config
```

## Tips for Best Results

1. **Play full games** - AI learns your patterns over multiple moves
2. **Read the feedback** - Don't just glance, understand the explanations
3. **Try suggested moves** - Learn why they're better
4. **Review after games** - Check where you went wrong

## Future Enhancements

Possible additions:
- [ ] Game summary analysis with AI
- [ ] Opening repertoire suggestions
- [ ] Weakness identification
- [ ] Personalized training plans
- [ ] Alternative AI models (Claude, Gemini)
- [ ] Offline mode with cached analysis

## Support

If you have issues:
1. Check this guide
2. Verify your API key
3. Check browser console for errors
4. Try rule-based mode as fallback

---

**Enjoy intelligent, AI-powered chess coaching!** 🎓🤖♟️
