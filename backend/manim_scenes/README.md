# SAT Manim Video Lessons

Pre-written Manim scenes for SAT math concept videos with voiceover.

## Prerequisites

1. **Python virtual environment** with dependencies:
   ```bash
   cd backend
   source venv/bin/activate
   pip install manim manim-voiceover openai python-dotenv
   ```

2. **System dependencies** (macOS):
   ```bash
   brew install ffmpeg mactex
   ```

3. **OpenAI API key** in `backend/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

## Render a Video

```bash
cd backend
manim -pql manim_scenes/<script>.py <ClassName>
```

**Flags:**
- `-p` = Preview (opens video after render)
- `-q` = Quality: `l` (low/480p), `m` (medium/720p), `h` (high/1080p)

**Example:**
```bash
manim -pql manim_scenes/absolute_value_equations.py AbsoluteValueEquations
```

Output: `backend/media/videos/<script>/480p15/<ClassName>.mp4`

## Available Lessons

| Script | Class Name | Topic |
|--------|------------|-------|
| `absolute_value_equations.py` | `AbsoluteValueEquations` | \|x\| = a → x = ±a |
| `slope_intercept_word_problems.py` | `SlopeInterceptWordProblems` | y = mx + b in context |
| `vertex_of_parabola.py` | `VertexOfParabola` | x = -b/(2a) formula |
| `exponent_rules.py` | `ExponentRules` | Product, quotient, power rules |
| `circle_equations.py` | `CircleEquations` | Center & radius from equation |
| `similar_triangles.py` | `SimilarTriangles` | Proportional sides |
| `ratios_proportions.py` | `RatiosProportions` | Cross multiplication |
| `percent_change.py` | `PercentChange` | 1.x / 0.x multiplier trick |

## Creating New Lessons

Use an existing script as a template. Each lesson includes:

1. **VoiceoverService** - OpenAI TTS integration (defined inline)
2. **VoiceoverScene** - Base class for synced audio
3. **`with self.voiceover(text="..."):`** - Voiceover blocks
4. **Closing** - "Follow for more SAT tips!" + sat.prepst.com

### Tips

- Keep videos ~30 seconds
- Use `S.A.T.` in voiceover text (pronounced as letters)
- Use `Prep Street` for "prepst" in voiceover
- Use `.next_to()`, `.to_edge()` for positioning
- Use `FadeOut()` before adding new text to avoid overlap
- Color-code related elements (YELLOW, GREEN, BLUE)

## Manim Skills

The `backend/.cursor/skills/manimce-best-practices/` directory contains:
- `rules/` - Best practices for animations, positioning, text, etc.
- `examples/` - Working code examples
- `templates/` - Starter scene templates

These are automatically available to AI assistants (Cursor/Claude) when writing Manim code.
