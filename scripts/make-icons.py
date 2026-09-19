#!/usr/bin/env python3
"""Raster the Undercover eye mark into PPM, then convert with sips."""

from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1] / "public"
INK = (16, 14, 12)
GOLD = (215, 176, 86)


def draw(size: int) -> bytes:
    cx = cy = size / 2
    rx = size * 0.28
    ry = size * 0.14
    pupil = size * 0.07
    stroke = max(2.0, size * 0.018)
    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            e = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry)
            color = INK
            if pupil * pupil * 0.85 <= dx * dx + dy * dy <= pupil * pupil * 1.35:
                color = GOLD
            elif abs(e - 1.0) * min(rx, ry) <= stroke:
                color = GOLD
            row.extend(color)
        rows.append(bytes(row))
    header = f"P6\n{size} {size}\n255\n".encode()
    return header + b"".join(rows)


def write_png(size: int, name: str) -> None:
    ppm = ROOT / f".tmp-{size}.ppm"
    png = ROOT / name
    ppm.write_bytes(draw(size))
    subprocess.run(
        ["sips", "-s", "format", "png", str(ppm), "--out", str(png)],
        check=True,
        capture_output=True,
    )
    ppm.unlink(missing_ok=True)


if __name__ == "__main__":
    ROOT.mkdir(exist_ok=True)
    write_png(180, "apple-touch-icon.png")
    write_png(192, "pwa-192.png")
    write_png(512, "pwa-512.png")
    print("icons ready")
