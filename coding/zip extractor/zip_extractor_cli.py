import os
import zipfile
import sys

def extract_zip(zip_path, extract_dir=None):
    if extract_dir is None:
        extract_dir = os.path.dirname(zip_path)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            file_list = zip_ref.namelist()
            print(f"Extraindo {len(file_list)} arquivo(s)...")
            zip_ref.extractall(extract_dir)
            print(f"Extração concluída! Arquivos extraídos para: {extract_dir}")
            return True
    except zipfile.BadZipFile:
        print("Erro: O arquivo selecionado não é um arquivo ZIP válido.")
    except PermissionError:
        print("Erro: Sem permissão para extrair no diretório selecionado.")
    except Exception as e:
        print(f"Erro durante a extração: {str(e)}")
    
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python zip_extractor_cli.py arquivo.zip [diretório_destino]")
        sys.exit(1)
    
    zip_path = sys.argv[1]
    extract_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    extract_zip(zip_path, extract_dir)
