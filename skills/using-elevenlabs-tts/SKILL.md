---
name: using-elevenlabs-tts
domain: tools
description: Generate spoken audio from a Markdown script using ElevenLabs text-to-speech. Use when the user asks to convert an audio-plan/audio-recap to audio, create an ElevenLabs TTS MP3, or invokes /using-elevenlabs-tts.
depends-on: []
chains-to: null
suggests: ["audio-plan", "audio-recap"]
---

# Using ElevenLabs TTS

Convert a Markdown script into an audio file with ElevenLabs.

Use only when explicitly asked. ElevenLabs generation consumes API credits.

## Input Contract

Required: path to a readable `.md` script.

If the user provides prose instead of a file, ask whether to save it first or convert it directly.

Default output path: same directory and basename, with `.mp3`.
Example: `add-auth.audio-plan.md` -> `add-auth.audio-plan.mp3`.
If the file exists, suffix with the next integer. Never overwrite.

## Tool Priority

1. Use an available ElevenLabs MCP speech-generation tool if the harness exposes one.
2. Use the official ElevenLabs `text-to-speech` skill if installed.
3. Use the direct ElevenLabs API fallback below.
4. Do not use the official `@elevenlabs/cli` for plain script-to-MP3; it is for managing ElevenLabs voice agents, not general TTS conversion.

Official MCP setup, when the user asks to configure it:

```json
{
  "mcpServers": {
    "ElevenLabs": {
      "command": "uvx",
      "args": ["elevenlabs-mcp"],
      "env": { "ELEVENLABS_API_KEY": "<insert-your-api-key-here>" }
    }
  }
}
```

Optional MCP env:
- `ELEVENLABS_MCP_BASE_PATH` sets file output base path.
- `ELEVENLABS_MCP_OUTPUT_MODE` can be `files`, `resources`, or `both`.

## Defaults

Use these unless the user chose otherwise:
- voice: `JBFqnCBsd6RMkjVDRZzb` (`George` in official examples)
- model: `eleven_v3`
- format: `mp3_44100_128`
- voice settings: steady narration, normal clarity, slightly slow only if the tool supports speed

For a non-native English listener, prefer clear pacing over dramatic style.

## Direct API Fallback

Require `ELEVENLABS_API_KEY` in the environment. Never paste or print the key.

Use Node fetch, not curl:

```bash
node -e 'const fs=require("fs"); const [input,output,voice="JBFqnCBsd6RMkjVDRZzb"] = process.argv.slice(1); const key=process.env.ELEVENLABS_API_KEY; if (!key) throw new Error("Missing ELEVENLABS_API_KEY"); const text=fs.readFileSync(input,"utf8"); const url=`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`; const res=await fetch(url,{method:"POST",headers:{"xi-api-key":key,"Content-Type":"application/json"},body:JSON.stringify({text,model_id:"eleven_v3",voice_settings:{stability:0.55,similarity_boost:0.75,style:0,use_speaker_boost:true,speed:0.92}})}); if (!res.ok) throw new Error(`${res.status} ${await res.text()}`); fs.writeFileSync(output, Buffer.from(await res.arrayBuffer())); console.log(output);' "$INPUT_MD" "$OUTPUT_MP3"
```

If the API rejects the input length, split on top-level headings and generate parts with `previous_text` and `next_text`, then tell the user the result is multi-part unless a local audio merge tool is available.

## Verification

After generation:
1. Confirm the output file exists.
2. Confirm byte size is greater than zero.
3. Report the exact method used: MCP, installed skill, or direct API.
4. Do not claim you listened to the audio unless playback was actually run.

## Final Response

```markdown
Audio created: `<output.mp3>`
Source: `<input.md>`
Method: <MCP | ElevenLabs skill | direct API>
Voice/model: <voice id/name>, <model id>
Verified: file exists, non-empty
```

## Sources

- ElevenLabs API quickstart: `https://elevenlabs.io/docs/eleven-api/quickstart`
- Text-to-speech API: `https://elevenlabs.io/docs/api-reference/text-to-speech/convert`
- Voices API: `https://elevenlabs.io/docs/api-reference/voices/search`
- Official MCP server: `https://github.com/elevenlabs/elevenlabs-mcp`
- Official CLI: `https://elevenlabs.io/docs/eleven-agents/operate/cli`
