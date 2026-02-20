import os
import uuid
import re
from tinytag import TinyTag

def generate_js_object(root_dir, path_prefix="full_bible/"):
    audio_extensions = ('.mp3', '.wav', '.m4a', '.flac', '.ogg')
    audio_list = []
    counter = 1

    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith(audio_extensions):
                file_path = os.path.join(root, file)
                
                try:
                    tag = TinyTag.get(file_path)
                    folder_name = os.path.basename(root)
                    file_name_no_ext = os.path.splitext(file)[0]
                    file_size = os.path.getsize(file_path)
                    
                    # ID Format: adv_w{index}_a{4_random_chars}
                    short_uuid = str(uuid.uuid4())[:4]
                    unique_id = f"adv_w{counter}_a{short_uuid}"
                    
                    # Extract year from filename
                    year_match = re.search(r'(\d{4})', file)
                    year = f"'{year_match.group(1)}'" if year_match else "null"

                    # Format the duration and size
                    duration = round(tag.duration, 2) if tag.duration else "null"
                    size_mb = f"'{round(file_size / (1024 * 1024), 2)} MB'"
                    
                    # Clean the file path for web (forward slashes)
                    rel_path = os.path.relpath(file_path, root_dir).replace("\\", "/")
                    clean_path = f"'{path_prefix}{rel_path}'"

                    # Build the JS object string for this entry
                    # Note: No quotes around keys (id, subfolder, etc.)
                    js_obj = (
                        f"    {{\n"
                        f"      id: '{unique_id}',\n"
                        f"      subfolder: '{folder_name}',\n"
                        f"      title: '{file_name_no_ext}',\n"
                        f"      filePath: {clean_path},\n"
                        f"      duration: {duration},\n"
                        f"      size: {size_mb},\n"
                        f"      date: {year}\n"
                        f"    }}"
                    )
                    
                    audio_list.append(js_obj)
                    counter += 1
                    
                except Exception as e:
                    print(f"Error processing {file}: {e}")

    # Combine everything into the final JS file format
    all_audios = ",\n".join(audio_list)
    js_content = f"export const audioData = {{\n  audios: [\n{all_audios}\n  ]\n}};"
    
    return js_content

# --- CONFIG ---
target_folder = "./full_bible" 
output_file = "bibleData.js"

js_string = generate_js_object(target_folder)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(js_string)

print(f"Successfully created {output_file} with {js_string.count('id:')} entries.")