import zipfile
from tkinter import Tk, filedialog, Button, Label, StringVar, Entry, messagebox

class ZipExtractorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Extrator de Arquivos ZIP")
        self.root.geometry("500x300")
        self.root.resizable(False, False)
        self.zip_path = StringVar()
        self.extract_path = StringVar()
        Label(root, text="Extrator de Arquivos ZIP", font=("Arial", 16, "bold")).pack(pady=10)
        
        Label(root, text="Arquivo ZIP:").pack(anchor="w", padx=20, pady=(20, 0))
        zip_frame = Label(root)
        zip_frame.pack(fill="x", padx=20)
        
        Entry(zip_frame, textvariable=self.zip_path, width=50).pack(side="left", pady=5)
        Button(zip_frame, text="Procurar", command=self.browse_zip).pack(side="left", padx=5)
        
        Label(root, text="Extrair para:").pack(anchor="w", padx=20, pady=(10, 0))
        extract_frame = Label(root)
        extract_frame.pack(fill="x", padx=20)
        
        Entry(extract_frame, textvariable=self.extract_path, width=50).pack(side="left", pady=5)
        Button(extract_frame, text="Procurar", command=self.browse_extract_dir).pack(side="left", padx=5)
        
        Button(root, text="Extrair Arquivos", command=self.extract_files, 
               bg="#4CAF50", fg="white", font=("Arial", 12), width=20).pack(pady=30)
    
    def browse_zip(self):
        if filename := filedialog.askopenfilename(
            title="Selecione o arquivo ZIP",
            filetypes=[("Arquivos ZIP", "*.zip"), ("Todos os arquivos", "*.*")]
        ):
            self.zip_path.set(filename)
    
    def browse_extract_dir(self):
        if directory := filedialog.askdirectory(title="Selecione o diretório para extração"):
            self.extract_path.set(directory)
    
    def extract_files(self):
        zip_file = self.zip_path.get()
        extract_dir = self.extract_path.get()
        
        if not zip_file or not extract_dir:
            messagebox.showerror("Erro", "Por favor, selecione o arquivo ZIP e o diretório de extração.")
            return
        
        try:
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                total_files = len(zip_ref.namelist())
                
                zip_ref.extractall(extract_dir)
                
                messagebox.showinfo("Sucesso", f"{total_files} arquivo(s) extraído(s) com sucesso para:\n{extract_dir}")
        except zipfile.BadZipFile:
            messagebox.showerror("Erro", "O arquivo selecionado não é um arquivo ZIP válido.")
        except PermissionError:
            messagebox.showerror("Erro", "Sem permissão para extrair no diretório selecionado.")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro durante a extração: {str(e)}")

if __name__ == "__main__":
    root = Tk()
    app = ZipExtractorApp(root)
    root.mainloop()
