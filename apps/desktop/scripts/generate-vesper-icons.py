from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SIZE = 512
SCALE = 4
BACKGROUND = (8, 10, 16, 255)
GRADIENT = [
    (0.0, (119, 103, 255, 255)),
    (0.27, (84, 220, 255, 255)),
    (0.5, (255, 255, 255, 255)),
    (0.72, (160, 95, 255, 255)),
    (1.0, (235, 91, 155, 255)),
]


def interpolate_color(position: float) -> tuple[int, int, int, int]:
    position %= 1.0
    for index in range(len(GRADIENT) - 1):
        left_position, left_color = GRADIENT[index]
        right_position, right_color = GRADIENT[index + 1]
        if left_position <= position <= right_position:
            amount = (position - left_position) / (right_position - left_position)
            return tuple(round(left + (right - left) * amount) for left, right in zip(left_color, right_color))
    return GRADIENT[-1][1]


def ellipse_mask(
    size: tuple[int, int],
    center: tuple[float, float],
    radius_x: float,
    radius_y: float,
    width: int,
    rotation_degrees: float,
    arc: tuple[int, int] | None = None,
) -> Image.Image:
    cx, cy = center
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    bounds = (cx - radius_x, cy - radius_y, cx + radius_x, cy + radius_y)
    if arc is None:
        draw.ellipse(bounds, outline=255, width=width)
    else:
        draw.arc(bounds, start=arc[0], end=arc[1], fill=255, width=width)
    if rotation_degrees:
        mask = mask.rotate(rotation_degrees, resample=Image.Resampling.BICUBIC, center=center)
    return mask


def gradient_image(size: tuple[int, int], phase: float) -> Image.Image:
    width, _ = size
    strip = Image.new("RGBA", (width, 1))
    strip.putdata([interpolate_color(index / max(1, width - 1) + phase) for index in range(width)])
    return strip.resize(size)


def composite_gradient(image: Image.Image, mask: Image.Image, phase: float, blur: float = 0) -> None:
    layer = Image.composite(gradient_image(image.size, phase), Image.new("RGBA", image.size), mask)
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)) if blur else layer)


def draw_glowing_ellipse(
    image: Image.Image,
    center: tuple[float, float],
    radius_x: float,
    radius_y: float,
    width: int,
    rotation_degrees: float = 0,
    phase: float = 0.0,
    arc: tuple[int, int] | None = None,
) -> None:
    glow_mask = ellipse_mask(image.size, center, radius_x, radius_y, width * 2, rotation_degrees, arc)
    composite_gradient(image, glow_mask, phase, blur=width * 1.15)
    path_mask = ellipse_mask(image.size, center, radius_x, radius_y, width, rotation_degrees, arc)
    composite_gradient(image, path_mask, phase)


def render() -> Image.Image:
    canvas_size = SIZE * SCALE
    image = Image.new("RGBA", (canvas_size, canvas_size), BACKGROUND)
    center = (canvas_size / 2, canvas_size / 2)

    draw_glowing_ellipse(image, center, 182 * SCALE, 61 * SCALE, 18 * SCALE, rotation_degrees=-28)

    draw = ImageDraw.Draw(image)
    core_radius = 80 * SCALE
    draw.ellipse(
        (center[0] - core_radius, center[1] - core_radius, center[0] + core_radius, center[1] + core_radius),
        fill=(0, 1, 4, 255),
        outline=(210, 240, 250, 36),
        width=2 * SCALE,
    )

    draw_glowing_ellipse(image, center, 96 * SCALE, 96 * SCALE, 13 * SCALE, phase=0.12)
    draw_glowing_ellipse(
        image,
        center,
        182 * SCALE,
        61 * SCALE,
        18 * SCALE,
        rotation_degrees=-28,
        arc=(0, 180),
    )

    return image.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def main() -> None:
    image = render()
    assets = ROOT / "assets"
    public = ROOT / "public"
    image.save(assets / "icon.png")
    image.save(assets / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    image.save(public / "apple-touch-icon.png")


if __name__ == "__main__":
    main()
