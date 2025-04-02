import tkinter as tk
from tkinter import messagebox

class Calculator:
    def __init__(self, master):
        self.master = master
        self.master.title("Python Calculator")
        self.master.geometry("300x400")
        self.master.resizable(False, False)
        self.master.configure(bg="#f0f0f0")

        # Display
        self.display = tk.Entry(self.master, width=20, font=("Arial", 16), bd=5, 
                               justify="right", bg="#ffffff")
        self.display.grid(row=0, column=0, columnspan=4, padx=10, pady=10, sticky="nsew")

        # Buttons
        self.create_buttons()

        # Configure grid
        for i in range(6):
            self.master.grid_rowconfigure(i, weight=1)
        for i in range(4):
            self.master.grid_columnconfigure(i, weight=1)

    def create_buttons(self):
        # Button layout
        button_layout = [
            ('C', 1, 0), ('←', 1, 1), ('%', 1, 2), ('/', 1, 3),
            ('7', 2, 0), ('8', 2, 1), ('9', 2, 2), ('*', 2, 3),
            ('4', 3, 0), ('5', 3, 1), ('6', 3, 2), ('-', 3, 3),
            ('1', 4, 0), ('2', 4, 1), ('3', 4, 2), ('+', 4, 3),
            ('±', 5, 0), ('0', 5, 1), ('.', 5, 2), ('=', 5, 3)
        ]

        # Create buttons
        for (text, row, col) in button_layout:
            if text == '=':
                button = tk.Button(self.master, text=text, font=("Arial", 12, "bold"),
                                  bg="#ff9500", fg="white", padx=10, pady=10)
                button.config(command=self.calculate)
            elif text in '+-*/':
                button = tk.Button(self.master, text=text, font=("Arial", 12, "bold"),
                                  bg="#ff9500", fg="white", padx=10, pady=10)
                button.config(command=lambda t=text: self.add_to_display(t))
            elif text == 'C':
                button = tk.Button(self.master, text=text, font=("Arial", 12, "bold"),
                                  bg="#a5a5a5", fg="black", padx=10, pady=10)
                button.config(command=self.clear_display)
            elif text == '←':
                button = tk.Button(self.master, text=text, font=("Arial", 12, "bold"),
                                  bg="#a5a5a5", fg="black", padx=10, pady=10)
                button.config(command=self.backspace)
            elif text == '±':
                button = tk.Button(self.master, text=text, font=("Arial", 12, "bold"),
                                  bg="#a5a5a5", fg="black", padx=10, pady=10)
                button.config(command=self.negate)
            elif text == '%':
                button = tk.Button(self.master, text=text, font=("Arial", 12, "bold"),
                                  bg="#a5a5a5", fg="black", padx=10, pady=10)
                button.config(command=self.percentage)
            else:
                button = tk.Button(self.master, text=text, font=("Arial", 12),
                                  bg="#d4d4d2", fg="black", padx=10, pady=10)
                button.config(command=lambda t=text: self.add_to_display(t))

            button.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")

    def add_to_display(self, text):
        current = self.display.get()
        self.display.delete(0, tk.END)
        self.display.insert(0, current + text)

    def clear_display(self):
        self.display.delete(0, tk.END)

    def backspace(self):
        current = self.display.get()
        self.display.delete(0, tk.END)
        self.display.insert(0, current[:-1])

    def negate(self):
        try:
            current = self.display.get()
            if current and current[0] == '-':
                self.display.delete(0, tk.END)
                self.display.insert(0, current[1:])
            else:
                self.display.delete(0, tk.END)
                self.display.insert(0, f'-{current}')
        except Exception:
            messagebox.showerror("Error", "An error occurred")

    def percentage(self):
        try:
            current = float(self.display.get())
            result = current / 100
            self.display.delete(0, tk.END)
            self.display.insert(0, str(result))
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def calculate(self):
        try:
            result = eval(self.display.get())
            self.display.delete(0, tk.END)
            self.display.insert(0, str(result))
        except Exception:
            messagebox.showerror("Error", "Invalid calculation")
            self.clear_display()

def main():
    root = tk.Tk()
    Calculator(root)
    root.mainloop()

if __name__ == "__main__":
    main()
