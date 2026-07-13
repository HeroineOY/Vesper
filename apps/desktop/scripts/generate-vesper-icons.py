from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SIZE = 512
CYAN = (116, 232, 255, 255)
ROSE = (255, 111, 169, 255)
BACKGROUND = (8, 10, 16, 255)


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("C:/Windows/Fonts/seguisb.ttf"),
        Path("/System/Library/Fonts/SFNS.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def render() -> Image.Image:
    image = Image.new("RGBA", (SIZE, SIZE), BACKGROUND)
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle((54, 54, 458, 458), radius=74, outline=CYAN, width=12)
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(22)))

    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((54, 54, 458, 458), radius=74, fill=(12, 17, 25, 255), outline=CYAN, width=7)
    draw.line((347, 431, 431, 431), fill=ROSE, width=9)
    draw.line((431, 347, 431, 431), fill=ROSE, width=9)

    face = font(270)
    box = draw.textbbox((0, 0), "V", font=face)
    x = (SIZE - (box[2] - box[0])) / 2
    y = (SIZE - (box[3] - box[1])) / 2 - box[1] - 7
    draw.text((x, y), "V", font=face, fill=(238, 246, 251, 255))
    return image


def main() -> None:
    image = render()
    assets = ROOT / "assets"
    public = ROOT / "public"
    image.save(assets / "icon.png")
    image.save(assets / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    image.save(public / "apple-touch-icon.png")


if __name__ == "__main__":
    main()
