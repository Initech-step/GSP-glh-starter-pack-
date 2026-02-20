import os
import datetime
from tinytag import TinyTag

def format_duration(seconds):
    if not seconds:
        return "00:00:00"
    return str(datetime.timedelta(seconds=int(seconds)))

def run_space_audit(root_dir):
    threshold_mb = 100
    threshold_bytes = threshold_mb * 1024 * 1024
    
    large_files = []
    total_large_size_bytes = 0
    
    print(f"--- Scanning for files > {threshold_mb}MB ---\n")

    for root, _, files in os.walk(root_dir):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                size_bytes = os.path.getsize(file_path)
                
                if size_bytes > threshold_bytes:
                    # Get duration (only for audio/video files)
                    duration_str = "N/A"
                    if file.lower().endswith(('.mp3', '.wav', '.m4a', '.mp4', '.mkv')):
                        try:
                            tag = TinyTag.get(file_path)
                            duration_str = format_duration(tag.duration)
                        except:
                            duration_str = "Error reading"

                    large_files.append({
                        "name": file,
                        "path": file_path,
                        "size_mb": round(size_bytes / (1024 * 1024), 2),
                        "duration": duration_str,
                        "raw_size": size_bytes
                    })
                    total_large_size_bytes += size_bytes
                    print(f"[FOUND] {file} ({round(size_bytes/(1024*1024), 2)} MB) - {duration_str}")

            except OSError:
                continue

    # --- Statistics Calculation ---
    num_files = len(large_files)
    if num_files == 0:
        print("\nNo files found above 100MB.")
        return

    total_mb = total_large_size_bytes / (1024 * 1024)
    # Savings = Total current size - (Count * 100MB)
    expected_savings_mb = total_mb - (num_files * threshold_mb)
    avg_size = total_mb / num_files
    largest_file = max(large_files, key=lambda x: x['raw_size'])

    print("\n" + "="*40)
    print("        SPACE AUDIT STATISTICS")
    print("="*40)
    print(f"Files found > 100MB:     {num_files}")
    print(f"Total size of targets:   {total_mb:.2f} MB")
    print(f"Average file size:       {avg_size:.2f} MB")
    print(f"Largest individual file: {largest_file['name']} ({largest_file['size_mb']} MB)")
    print("-" * 40)
    print(f"POTENTIAL SAVINGS:       {expected_savings_mb:.2f} MB")
    print(f"Percent size reduction:  {((expected_savings_mb/total_mb)*100):.1f}%")
    print("="*40)

# --- EXECUTION ---
# Replace '.' with your actual folder path
run_space_audit('./my_audio_folder')