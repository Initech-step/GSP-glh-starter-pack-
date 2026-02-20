import re
import os

def convert_to_audio_map(input_file, output_file):
    # Read the content of your existing JS file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find id, title, and filePath blocks
    # This looks for the keys we generated in the previous step
    pattern = re.compile(
        r"id:\s*'([^']*)'.*?title:\s*'([^']*)'.*?filePath:\s*'([^']*)'", 
        re.DOTALL
    )
    
    matches = pattern.findall(content)
    
    map_entries = []
    for entry_id, title, file_path in matches:
        # Get just the filename (e.g., "Overview I.mp3") from the full path
        file_name = os.path.basename(file_path)
        
        # Format: 'id': 'filename.mp3', // title
        line = f"  '{entry_id}': '{file_name}', // {title}"
        map_entries.append(line)

    # Join entries and wrap in the const definition
    map_body = "\n".join(map_entries)
    final_output = f"const audioMap = {{\n\n{map_body}\n\n}};"

    # Write to the new file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_output)

# --- EXECUTION ---
convert_to_audio_map('bibleData.js', 'bibleAudioMap.js')
print("Successfully converted audioData.js to audioMap.js")