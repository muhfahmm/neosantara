import json
import hashlib
import re

def generate_color_from_name(country_name):
    """Generate a consistent, visually distinct color from country name"""
    # Use hash for consistent color generation
    hash_obj = hashlib.md5(country_name.lower().encode())
    hash_hex = hash_obj.hexdigest()
    
    # Extract RGB values from hash
    r = int(hash_hex[0:2], 16)
    g = int(hash_hex[2:4], 16)
    b = int(hash_hex[4:6], 16)
    
    # Adjust to ensure colors are vibrant (avoid too dark or too light)
    # Ensure at least one channel is bright
    max_val = max(r, g, b)
    if max_val < 100:
        # Too dark, boost all channels
        factor = 150 / max_val if max_val > 0 else 1.5
        r = min(255, int(r * factor))
        g = min(255, int(g * factor))
        b = min(255, int(b * factor))
    
    # Ensure minimum saturation
    min_val = min(r, g, b)
    if max_val - min_val < 50:  # Too gray
        # Boost the dominant channel
        if r == max_val:
            r = min(255, r + 50)
        elif g == max_val:
            g = min(255, g + 50)
        else:
            b = min(255, b + 50)
    
    return f"#{r:02x}{g:02x}{b:02x}".upper()

def process_map_data_file(input_file, output_file):
    """Read map-data.ts, add color field to each country, write back"""
    print(f"Reading {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the array content
    match = re.search(r'export const COUNTRIES_DATA = \[(.*)\];', content, re.DOTALL)
    if not match:
        print("ERROR: Could not find COUNTRIES_DATA array")
        return
    
    array_content = match.group(1)
    
    # Parse individual country objects
    # Split by },\n  { pattern to separate countries
    country_blocks = re.split(r'\},\s*\n\s*\{', array_content.strip())
    
    processed_countries = []
    colors_used = {}
    
    for i, block in enumerate(country_blocks):
        # Clean up block
        block = block.strip()
        if not block.startswith('{'):
            block = '{' + block
        if not block.endswith('}'):
            block = block + '}'
        
        # Extract country name
        country_match = re.search(r'"country":\s*"([^"]+)"', block)
        if not country_match:
            print(f"Warning: Could not find country name in block {i}")
            processed_countries.append(block)
            continue
        
        country_name = country_match.group(1)
        
        # Check if color already exists
        if '"color"' in block:
            print(f"  {country_name}: color already exists, skipping")
            processed_countries.append(block)
            continue
        
        # Generate color
        color = generate_color_from_name(country_name)
        
        # Track color usage
        if color in colors_used:
            print(f"  {country_name}: duplicate color {color} (also used by {colors_used[color]})")
        colors_used[color] = country_name
        
        # Add color field before the closing brace
        # Remove trailing } if exists
        if block.endswith('}'):
            block = block[:-1].rstrip()
        
        # Add comma if the last line doesn't have one
        if not block.rstrip().endswith(','):
            block += ','
        
        # Add color field
        block += f'\n    "color": "{color}"\n  }}'
        
        processed_countries.append(block)
        print(f"  {country_name}: {color}")
    
    # Reconstruct the file
    new_array_content = ',\n  '.join(processed_countries)
    new_content = f'export const COUNTRIES_DATA = [\n  {new_array_content}\n];\n'
    
    print(f"\nWriting to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\nProcessed {len(processed_countries)} countries")
    print(f"Unique colors: {len(colors_used)}")

if __name__ == "__main__":
    input_file = r"d:\project-sendiri\neosantara\apps\src\app\page\map_system\map-data.ts"
    output_file = r"d:\project-sendiri\neosantara\apps\src\app\page\map_system\map-data.ts"
    
    process_map_data_file(input_file, output_file)
    print("\n✅ Done!")
