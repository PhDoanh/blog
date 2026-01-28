#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Bộ đếm
total_files=0
successful_conversions=0
failed_conversions=0

# Function to convert images to AVIF
convert_to_avif() {
  local input_file="$1"
  local output_file="${input_file%.*}.avif"
  
  # Skip if output already exists
  if [ -f "$output_file" ]; then
    echo -e "${YELLOW}Skipping${NC} ${input_file} (already exists)"
    return
  fi
  
  echo -e "${GREEN}Converting image${NC} ${input_file} → AVIF"
  
  if ffmpeg -i "$input_file" -c:v libaom-av1 -still-picture 1 -crf 23 \
    -pix_fmt yuv420p "$output_file" -hide_banner -nostdin -y 2>/dev/null; then
    ((successful_conversions++))
    echo -e "${GREEN}✓${NC} Completed: $output_file"
  else
    ((failed_conversions++))
    echo -e "${RED}✗ Failed${NC} to convert $input_file"
  fi
}

# Function to convert videos to AV1
convert_to_av1() {
  local input_file="$1"
  local output_file="${input_file%.*}.av1.mp4"
  
  # Skip if output already exists
  if [ -f "$output_file" ]; then
    echo -e "${YELLOW}Skipping${NC} ${input_file} (already exists)"
    return
  fi
  
  echo -e "${GREEN}Converting video${NC} ${input_file} → AV1"
  
  # Use SVT-AV1 for faster encoding, fallback to libaom-av1 if not available
  if ffmpeg -i "$input_file" -c:v libsvtav1 -crf 30 -preset 6 \
    -c:a libopus -b:a 128k -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    "$output_file" -hide_banner -nostdin -y 2>/dev/null; then
    ((successful_conversions++))
    echo -e "${GREEN}✓${NC} Completed: $output_file"
  elif ffmpeg -i "$input_file" -c:v libaom-av1 -crf 30 -b:v 0 \
    -c:a libopus -b:a 128k -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    "$output_file" -hide_banner -nostdin -y 2>/dev/null; then
    ((successful_conversions++))
    echo -e "${GREEN}✓${NC} Completed: $output_file (using libaom-av1)"
  else
    ((failed_conversions++))
    echo -e "${RED}✗ Failed${NC} to convert $input_file"
  fi
}

# Function to convert audio to Opus
convert_to_opus() {
  local input_file="$1"
  local output_file="${input_file%.*}.opus"
  
  # Skip if output already exists
  if [ -f "$output_file" ]; then
    echo -e "${YELLOW}Skipping${NC} ${input_file} (already exists)"
    return
  fi
  
  echo -e "${GREEN}Converting audio${NC} ${input_file} → Opus"
  
  if ffmpeg -i "$input_file" -c:a libopus -b:a 128k -vbr on \
    -compression_level 10 "$output_file" -hide_banner -nostdin -y 2>/dev/null; then
    ((successful_conversions++))
    echo -e "${GREEN}✓${NC} Completed: $output_file"
  else
    ((failed_conversions++))
    echo -e "${RED}✗ Failed${NC} to convert $input_file"
  fi
}

echo "======================================"
echo "  Media Optimization Script"
echo "======================================"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo -e "${RED}Error:${NC} ffmpeg is not installed. Please install it first."
  exit 1
fi

# Image formats to convert
image_formats=("jpg" "jpeg" "png" "gif" "bmp" "tiff" "tif" "webp")
echo -e "${YELLOW}Processing images...${NC}"
for format in "${image_formats[@]}"; do
  while IFS= read -r -d '' file; do
    ((total_files++))
    convert_to_avif "$file"
  done < <(find ./content -type f -iname "*.${format}" -print0)
done
echo ""

# Video formats to convert
video_formats=("mp4" "mov" "avi" "mkv" "webm" "flv" "wmv" "m4v" "mpg" "mpeg")
echo -e "${YELLOW}Processing videos...${NC}"
for format in "${video_formats[@]}"; do
  while IFS= read -r -d '' file; do
    # Skip if already AV1
    if [[ "$file" == *.av1.mp4 ]]; then
      continue
    fi
    ((total_files++))
    convert_to_av1 "$file"
  done < <(find ./content -type f -iname "*.${format}" -print0)
done
echo ""

# Audio formats to convert
audio_formats=("mp3" "wav" "aac" "flac" "m4a" "wma" "ogg" "aiff")
echo -e "${YELLOW}Processing audio files...${NC}"
for format in "${audio_formats[@]}"; do
  while IFS= read -r -d '' file; do
    ((total_files++))
    convert_to_opus "$file"
  done < <(find ./content -type f -iname "*.${format}" -print0)
done
echo ""

# Summary
echo "======================================"
echo "  Conversion Summary"
echo "======================================"
echo -e "Total files processed: ${total_files}"
echo -e "${GREEN}Successful conversions: ${successful_conversions}${NC}"
echo -e "${RED}Failed conversions: ${failed_conversions}${NC}"
echo ""