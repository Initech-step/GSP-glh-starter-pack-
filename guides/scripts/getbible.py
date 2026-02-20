import os
import json
import uuid
import re
from tinytag import TinyTag

def generate_audio_inventory(root_dir, path_prefix="../../assets/audio/full_audio/"):
    audio_extensions = ('.mp3', '.wav', '.m4a', '.flac', '.ogg')
    audio_list = []
    counter = 1

    # Walk through the directory recursively
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith(audio_extensions):
                file_path = os.path.join(root, file)
                
                try:
                    # Get metadata without loading the whole file
                    tag = TinyTag.get(file_path)
                    
                    # Extract info for the structure
                    folder_name = os.path.basename(root)
                    file_name_no_ext = os.path.splitext(file)[0]
                    file_size = os.path.getsize(file_path)
                    
                    # Generate ID: index + first 4 chars of a UUID
                    unique_id = f"adv_w{counter}_{str(uuid.uuid4())[:4]}"
                    
                    # Attempt to find a year in the filename (e.g., 2020)
                    year_match = re.search(r'(\d{4})', file)
                    year = year_match.group(1) if year_match else "2019"

                    # Construct the relative path
                    # This replaces the local absolute path with your desired prefix
                    relative_path = os.path.join(path_prefix, os.path.relpath(file_path, root_dir)).replace("\\", "/")

                    audio_data = {
                        "id": unique_id,
                        "subfolder": folder_name,
                        "title": file_name_no_ext,
                        "filePath": relative_path,
                        "duration": round(tag.duration, 2) if tag.duration else None,
                        "size": f"{round(file_size / (1024 * 1024), 2)} MB",
                        "date": year
                    }
                    
                    audio_list.append(audio_data)
                    counter += 1
                    
                except Exception as e:
                    print(f"Could not process {file}: {e}")

    return {"audios": audio_list}

# --- CONFIGURATION ---
target_folder = "./full_bible"  # Change this to your folder path
output_file = "audio_data.json"

result = generate_audio_inventory(target_folder)

# Save to JSON file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=4)

print(f"Done! Processed {len(result['audios'])} files. Data saved to {output_file}.")