import os

def cleanup_temp_file(file_path: str):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not remove temporary file {file_path}: {e}")
