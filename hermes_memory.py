"""Shared path resolution for Hermes' built-in file-backed memory."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Mapping

from hermes_constants import get_hermes_home


def resolve_memory_dir(
    config: Mapping[str, Any] | None = None,
    *,
    hermes_home: Path | None = None,
) -> Path:
    """Return the configured MEMORY.md/USER.md directory."""

    home = Path(hermes_home) if hermes_home is not None else get_hermes_home()
    raw = (config or {}).get("directory") or os.environ.get("HERMES_MEMORY_DIR")
    if raw is None or not str(raw).strip():
        return home / "memories"

    expanded = os.path.expandvars(os.path.expanduser(str(raw).strip()))
    configured = Path(expanded)
    return configured if configured.is_absolute() else home / configured


def get_memory_dir() -> Path:
    """Resolve the active memory directory from the current config."""

    try:
        from hermes_cli.config import load_config

        config = (load_config() or {}).get("memory", {})
    except Exception:
        config = {}
    return resolve_memory_dir(config)
