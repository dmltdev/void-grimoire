#!/usr/bin/env python3
"""Hash an ideal-example implementation tree and optionally update markdown frontmatter."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
from pathlib import Path

DEFAULT_EXCLUDES = {
    ".git",
    ".next",
    ".turbo",
    ".cache",
    "coverage",
    "dist",
    "build",
    "node_modules",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lockb",
    ".DS_Store",
}

FRONTMATTER_RE = re.compile(r"\A---\n(?P<body>.*?)\n---\n", re.DOTALL)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Hash an ideal-example implementation snapshot.")
    parser.add_argument("path", type=Path, help="File or directory to hash.")
    parser.add_argument("--update-doc", type=Path, help="Markdown file whose YAML frontmatter receives hash/version.")
    parser.add_argument("--version", default="1.0", help="Version to write when --update-doc is used.")
    parser.add_argument(
        "--include",
        action="append",
        default=[],
        help="Regex for relative paths to include. Can be passed multiple times.",
    )
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        help="Regex for relative paths to exclude. Can be passed multiple times.",
    )
    return parser.parse_args()


def is_excluded(path: Path, root: Path, extra_excludes: list[re.Pattern[str]]) -> bool:
    rel = path.relative_to(root).as_posix()
    if any(part in DEFAULT_EXCLUDES for part in path.parts):
        return True
    return any(pattern.search(rel) for pattern in extra_excludes)


def iter_files(root: Path, includes: list[re.Pattern[str]], excludes: list[re.Pattern[str]]) -> list[Path]:
    if root.is_file():
        return [root]

    files: list[Path] = []
    for current_root, dirs, names in os.walk(root):
        current = Path(current_root)
        dirs[:] = [name for name in dirs if name not in DEFAULT_EXCLUDES]
        for name in names:
            path = current / name
            rel = path.relative_to(root).as_posix()
            if is_excluded(path, root, excludes):
                continue
            if includes and not any(pattern.search(rel) for pattern in includes):
                continue
            files.append(path)
    return sorted(files, key=lambda item: item.relative_to(root).as_posix())


def digest_path(root: Path, files: list[Path]) -> str:
    digest = hashlib.sha256()
    for path in files:
        rel = path.relative_to(root).as_posix() if root.is_dir() else path.name
        digest.update(rel.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def upsert_frontmatter(markdown: str, version: str, hash_value: str) -> str:
    fields = {"version": version, "hash": hash_value}
    match = FRONTMATTER_RE.match(markdown)
    if not match:
        header = "".join(f"{key}: {value}\n" for key, value in fields.items())
        return f"---\n{header}---\n\n{markdown}"

    body = match.group("body")
    for key, value in fields.items():
        pattern = re.compile(rf"^{re.escape(key)}:\s*.*$", re.MULTILINE)
        if pattern.search(body):
            body = pattern.sub(f"{key}: {value}", body)
        else:
            body = f"{body}\n{key}: {value}" if body else f"{key}: {value}"
    return f"---\n{body}\n---\n" + markdown[match.end() :]


def main() -> None:
    args = parse_args()
    root = args.path.resolve()
    if not root.exists():
        raise SystemExit(f"Path not found: {root}")

    update_doc = args.update_doc.resolve() if args.update_doc else None
    if update_doc == root:
        raise SystemExit("--update-doc cannot be the same file as path.")

    includes = [re.compile(pattern) for pattern in args.include]
    excludes = [re.compile(pattern) for pattern in args.exclude]
    files = [
        path
        for path in iter_files(root, includes, excludes)
        if update_doc is None or path.resolve() != update_doc
    ]
    hash_value = digest_path(root, files)

    print(f"hash: {hash_value}")
    print(f"files: {len(files)}")

    if update_doc:
        doc = update_doc
        markdown = doc.read_text(encoding="utf-8") if doc.exists() else ""
        doc.write_text(upsert_frontmatter(markdown, args.version, hash_value), encoding="utf-8")
        print(f"updated: {doc}")


if __name__ == "__main__":
    main()
