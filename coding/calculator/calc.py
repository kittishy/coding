print("Calculadora")
print("Digite 'sair' para encerrar")

while True:
    expressao = input("\nDigite a expressão: ")
    
    if expressao.lower() == 'sair':
        print("Saindo.")
        break
    
    try:
        expressao = expressao.replace(" ", "")
        expressao = expressao.replace("+", " + ")
        expressao = expressao.replace("-", " - ")
        expressao = expressao.replace("*", " * ")
        expressao = expressao.replace("/", " / ")
        expressao = expressao.replace("^", " ^ ")
        expressao = expressao.replace("%", " % ")
        expressao = expressao.replace("(", " ( ")
        expressao = expressao.replace(")", " ) ")
        
        try:
            expressao = expressao.replace("^", "**")  
            
            resultado = eval(expressao)
            
            if isinstance(resultado, (int, float, complex)):
                print(f"Resultado: {expressao.replace('**', '^')} = {resultado}")
            else:
                print("Erro: Resultado não é um número válido")
                
        except ZeroDivisionError:
            print("Erro: Divisão por zero!")
        except SyntaxError:
            print("Erro: Expressão matemática inválida!")
            print("Use operadores válidos: +, -, *, /, ^, %, (, )")
            print("Exemplo: (2 + 3) * 4 ou 2 ^ 3 + 5")
            
    except ValueError:
        print("Entrada inválida! Digite números e operadores válidos.")
    except Exception as e:
        print(f"Erro: {e}")