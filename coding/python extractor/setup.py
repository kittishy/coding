import PyInstaller.__main__
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
file_extractor_path = os.path.join(script_dir, 'file_extractor.py')

PyInstaller.__main__.run([
    file_extractor_path,
    '--name=FileExtractor',
    '--onefile',
    '--windowed',
    '--icon=NONE',
])

print("Build completed! Executable is in the 'dist' folder.")
