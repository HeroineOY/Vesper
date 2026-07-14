from pathlib import Path

from hermes_memory import resolve_memory_dir


def test_memory_dir_defaults_to_profile_memories(tmp_path: Path) -> None:
    assert resolve_memory_dir({}, hermes_home=tmp_path) == tmp_path / "memories"


def test_memory_dir_accepts_shared_absolute_path(tmp_path: Path) -> None:
    shared = tmp_path / "shared-memory"
    assert resolve_memory_dir({"directory": str(shared)}, hermes_home=tmp_path / "profile") == shared


def test_memory_dir_resolves_relative_path_beneath_profile(tmp_path: Path) -> None:
    assert resolve_memory_dir({"directory": "shared/memory"}, hermes_home=tmp_path) == tmp_path / "shared/memory"
