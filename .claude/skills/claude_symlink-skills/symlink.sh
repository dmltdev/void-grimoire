#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTS_SKILLS="$(dirname "$SCRIPT_DIR")"
TARGETS=("../../../.windsurf/skills" "../../../.claude/skills" "../../../.opencode/skills")

if [ $# -eq 0 ]; then
  echo "Usage: $0 <skill-name>"
  echo "Example: $0 commit-push-pr"
  echo ""
  echo "Available skills:"
  ls -1 "$AGENTS_SKILLS" | grep -v symlink-skills | grep -v SKILL.md
  exit 1
fi

SKILL_NAME="$1"
SKILL_PATH="$AGENTS_SKILLS/$SKILL_NAME"

if [ ! -d "$SKILL_PATH" ]; then
  echo "Error: Skill '$SKILL_NAME' not found in $AGENTS_SKILLS"
  exit 1
fi

for target in "${TARGETS[@]}"; do
  TARGET_DIR="$(cd "$SCRIPT_DIR/$target" 2>/dev/null && pwd)"
  
  if [ ! -d "$TARGET_DIR" ]; then
    echo "Warning: Target directory $target does not exist, skipping..."
    continue
  fi

  TARGET_PATH="$TARGET_DIR/$SKILL_NAME"

  if [ -L "$TARGET_PATH" ]; then
    echo "Removing existing symlink: $target/$SKILL_NAME"
    rm "$TARGET_PATH"
  elif [ -d "$TARGET_PATH" ]; then
    echo "Warning: Directory exists at $target/$SKILL_NAME, skipping..."
    continue
  fi

  ln -sf "$(realpath "$SKILL_PATH")" "$TARGET_PATH"
  echo "Created symlink: $target/$SKILL_NAME"
done

echo "Done!"