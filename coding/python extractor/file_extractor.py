import os
import shutil
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import threading

class FileExtractorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("File Extractor")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # Configure style
        self.style = ttk.Style()
        self.style.configure('TButton', padding=10, font=('Segoe UI', 10))
        self.style.configure('TLabel', font=('Segoe UI', 10))
        self.style.configure('TEntry', padding=5)
        self.style.configure('TRadiobutton', font=('Segoe UI', 10))
        self.style.configure('Horizontal.TProgressbar', thickness=15)
        
        # Set theme
        self.style.theme_use('clam')
        
        # Configure colors
        self.root.configure(bg='#f0f0f0')
        
        self.setup_ui()
    
    def setup_ui(self):
        main_frame = ttk.Frame(self.root, padding="20 20 20 20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Source Frame
        source_frame = ttk.LabelFrame(main_frame, text="Source", padding="10")
        source_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.source_path_var = tk.StringVar()
        source_entry = ttk.Entry(source_frame, textvariable=self.source_path_var, width=50)
        source_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        ttk.Button(source_frame, text="Select File", command=self.browse_source_file).pack(side=tk.RIGHT)
        ttk.Button(source_frame, text="Select Folder", command=self.browse_source_folder).pack(side=tk.RIGHT, padx=(0, 10))
        
        # Destination Frame
        dest_frame = ttk.LabelFrame(main_frame, text="Destination", padding="10")
        dest_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.dest_path_var = tk.StringVar()
        dest_entry = ttk.Entry(dest_frame, textvariable=self.dest_path_var, width=50)
        dest_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        ttk.Button(dest_frame, text="Select", command=self.browse_destination).pack(side=tk.RIGHT)
        
        # Options Frame
        options_frame = ttk.LabelFrame(main_frame, text="Options", padding="10")
        options_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.copy_var = tk.BooleanVar(value=True)
        ttk.Radiobutton(options_frame, text="Copy Files", variable=self.copy_var, value=True).pack(side=tk.LEFT, padx=(0, 20))
        ttk.Radiobutton(options_frame, text="Move Files", variable=self.copy_var, value=False).pack(side=tk.LEFT)
        
        # Files to Extract Frame
        list_frame = ttk.LabelFrame(main_frame, text="Files to Extract", padding="10")
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Add scrollbar to listbox
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.files_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, font=('Segoe UI', 9),
                                      bg='white', selectmode=tk.EXTENDED)
        self.files_listbox.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.files_listbox.yview)
        
        # Progress Frame
        progress_frame = ttk.Frame(main_frame)
        progress_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.progress = ttk.Progressbar(progress_frame, orient=tk.HORIZONTAL, length=100, mode='determinate')
        self.progress.pack(fill=tk.X)
        
        # Extract Button
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(pady=(0, 10))
        
        self.extract_button = ttk.Button(button_frame, text="Extract Files", command=self.start_extraction, width=20)
        self.extract_button.pack()
        
        # Status Bar
        self.status_var = tk.StringVar()
        status_label = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN, padding=(5, 2))
        status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def browse_source_file(self):
        filetypes = [("All files", "*.*")]
        if filename := filedialog.askopenfilename(title="Select file to extract", filetypes=filetypes):
            self.source_path_var.set(filename)
            self.update_files_list()
    
    def browse_source_folder(self):
        if directory := filedialog.askdirectory(title="Select folder to extract"):
            self.source_path_var.set(directory)
            self.update_files_list()
    
    def browse_destination(self):
        if directory := filedialog.askdirectory(title="Select extraction destination"):
            self.dest_path_var.set(directory)
    
    def update_files_list(self):
        self.files_listbox.delete(0, tk.END)
        source_path = self.source_path_var.get()
        
        if not source_path or not os.path.exists(source_path):
            return
        
        if os.path.isfile(source_path):
            self.files_listbox.insert(tk.END, os.path.basename(source_path))
        else:
            for root, _, files in os.walk(source_path):
                for file in files:
                    rel_path = os.path.relpath(os.path.join(root, file), source_path)
                    self.files_listbox.insert(tk.END, rel_path)
    
    def start_extraction(self):
        source_path = self.source_path_var.get()
        dest_path = self.dest_path_var.get()
        
        if not source_path or not os.path.exists(source_path):
            messagebox.showerror("Error", "Please select a valid source file or folder.")
            return
        
        if not dest_path:
            messagebox.showerror("Error", "Please select a destination folder.")
            return
        
        self.extract_button.config(state=tk.DISABLED)
        self.progress['value'] = 0
        self.status_var.set("Extracting files...")
        
        threading.Thread(target=self.extract_files, args=(source_path, dest_path)).start()
    
    def extract_files(self, source_path, dest_path):
        try:
            if not os.path.exists(dest_path):
                os.makedirs(dest_path)
            
            total_files = 0
            files_to_process = []
            
            if os.path.isfile(source_path):
                total_files = 1
                files_to_process.append((source_path, os.path.join(dest_path, os.path.basename(source_path))))
            else:
                for root, _, files in os.walk(source_path):
                    for file in files:
                        total_files += 1
                        src_file = os.path.join(root, file)
                        rel_path = os.path.relpath(src_file, source_path)
                        dst_file = os.path.join(dest_path, rel_path)
                        files_to_process.append((src_file, dst_file))
            
            for i, (src_file, dst_file) in enumerate(files_to_process):
                os.makedirs(os.path.dirname(dst_file), exist_ok=True)
                
                if self.copy_var.get():
                    shutil.copy2(src_file, dst_file)
                    operation = "copied"
                else:
                    shutil.move(src_file, dst_file)
                    operation = "moved"
                
                progress_value = int((i + 1) / total_files * 100)
                self.root.after(0, lambda v=progress_value: self.progress.config(value=v))
                self.root.after(0, lambda f=os.path.basename(src_file), op=operation, cnt=i+1: 
                               self.status_var.set(f"File {f} {op}... ({cnt}/{total_files})"))
            
            self.root.after(0, lambda: messagebox.showinfo("Success", f"All files have been successfully extracted to {dest_path}"))
    
        except Exception as exc:
            self.root.after(0, lambda exc=exc: messagebox.showerror("Error", f"Extraction failed: {str(exc)}"))
        finally:
            self.root.after(0, self.reset_ui)
    
    def reset_ui(self):
        self.extract_button.config(state=tk.NORMAL)
        self.status_var.set("")

def main():
    root = tk.Tk()
    FileExtractorApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()