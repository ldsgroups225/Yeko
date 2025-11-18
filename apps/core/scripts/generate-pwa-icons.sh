#!/bin/bash

# PWA Icon Generation Script
# Generates all required PWA icons from a source image
# Requires ImageMagick: sudo apt-get install imagemagick

set -e

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Source image (should be at least 1024x1024 with transparent background)
SOURCE_IMAGE="${1:-public/logo512.png}"
OUTPUT_DIR="public"

echo -e "${GREEN}PWA Icon Generator${NC}"
echo "Source: $SOURCE_IMAGE"
echo "Output: $OUTPUT_DIR"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}Error: ImageMagick is not installed${NC}"
    echo "Install it with: sudo apt-get install imagemagick"
    exit 1
fi

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo -e "${RED}Error: Source image not found: $SOURCE_IMAGE${NC}"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo -e "${YELLOW}Generating standard PWA icons...${NC}"

# Standard PWA icons (with transparent background)
convert "$SOURCE_IMAGE" -resize 72x72 "$OUTPUT_DIR/pwa-72x72.png"
convert "$SOURCE_IMAGE" -resize 96x96 "$OUTPUT_DIR/pwa-96x96.png"
convert "$SOURCE_IMAGE" -resize 128x128 "$OUTPUT_DIR/pwa-128x128.png"
convert "$SOURCE_IMAGE" -resize 144x144 "$OUTPUT_DIR/pwa-144x144.png"
convert "$SOURCE_IMAGE" -resize 152x152 "$OUTPUT_DIR/pwa-152x152.png"
convert "$SOURCE_IMAGE" -resize 192x192 "$OUTPUT_DIR/pwa-192x192.png"
convert "$SOURCE_IMAGE" -resize 384x384 "$OUTPUT_DIR/pwa-384x384.png"
convert "$SOURCE_IMAGE" -resize 512x512 "$OUTPUT_DIR/pwa-512x512.png"

echo -e "${GREEN}✓ Standard icons generated${NC}"

echo -e "${YELLOW}Generating maskable icons...${NC}"

# Maskable icons (with safe zone padding and opaque background)
# Safe zone is 80% of the icon size, so we need 10% padding on each side
# Add white background and padding for maskable icons

for size in 192 384 512; do
    # Calculate padding (10% on each side = 20% total)
    padding=$((size / 10))
    inner_size=$((size - 2 * padding))
    
    # Create maskable icon with white background and padding
    convert "$SOURCE_IMAGE" \
        -resize ${inner_size}x${inner_size} \
        -background white \
        -gravity center \
        -extent ${size}x${size} \
        "$OUTPUT_DIR/pwa-${size}x${size}-maskable.png"
done

echo -e "${GREEN}✓ Maskable icons generated${NC}"

echo -e "${YELLOW}Generating iOS icons...${NC}"

# iOS specific icons
# Apple touch icon (180x180 for iPhone)
convert "$SOURCE_IMAGE" -resize 180x180 "$OUTPUT_DIR/apple-touch-icon.png"

# iOS splash screens (various sizes for different devices)
# iPhone X/XS/11 Pro (1125x2436)
convert -size 1125x2436 xc:white \
    \( "$SOURCE_IMAGE" -resize 300x300 \) \
    -gravity center -composite \
    "$OUTPUT_DIR/apple-splash-1125x2436.png"

# iPhone XR/11 (828x1792)
convert -size 828x1792 xc:white \
    \( "$SOURCE_IMAGE" -resize 250x250 \) \
    -gravity center -composite \
    "$OUTPUT_DIR/apple-splash-828x1792.png"

# iPhone XS Max/11 Pro Max (1242x2688)
convert -size 1242x2688 xc:white \
    \( "$SOURCE_IMAGE" -resize 350x350 \) \
    -gravity center -composite \
    "$OUTPUT_DIR/apple-splash-1242x2688.png"

# iPad Pro 12.9" (2048x2732)
convert -size 2048x2732 xc:white \
    \( "$SOURCE_IMAGE" -resize 400x400 \) \
    -gravity center -composite \
    "$OUTPUT_DIR/apple-splash-2048x2732.png"

# iPad Pro 11" (1668x2388)
convert -size 1668x2388 xc:white \
    \( "$SOURCE_IMAGE" -resize 350x350 \) \
    -gravity center -composite \
    "$OUTPUT_DIR/apple-splash-1668x2388.png"

echo -e "${GREEN}✓ iOS icons and splash screens generated${NC}"

echo -e "${YELLOW}Generating favicon...${NC}"

# Favicon (32x32 and 16x16)
convert "$SOURCE_IMAGE" -resize 32x32 "$OUTPUT_DIR/favicon-32x32.png"
convert "$SOURCE_IMAGE" -resize 16x16 "$OUTPUT_DIR/favicon-16x16.png"

# Create multi-size ICO file
convert "$SOURCE_IMAGE" -resize 16x16 \
    "$SOURCE_IMAGE" -resize 32x32 \
    "$SOURCE_IMAGE" -resize 48x48 \
    "$OUTPUT_DIR/favicon.ico"

echo -e "${GREEN}✓ Favicons generated${NC}"

echo ""
echo -e "${GREEN}All icons generated successfully!${NC}"
echo ""
echo "Generated files:"
ls -lh "$OUTPUT_DIR"/pwa-*.png "$OUTPUT_DIR"/apple-*.png "$OUTPUT_DIR"/favicon*.* 2>/dev/null || true
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update vite.config.ts manifest.icons with the new icon paths"
echo "2. Add iOS splash screen meta tags to index.html"
echo "3. Test icons on different devices and browsers"
