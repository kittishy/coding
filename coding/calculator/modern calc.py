import tkinter as tk
from tkinter import messagebox

class Calculator:
    def __init__(self, master):
        self.master = master
        self.master.title("Python Calculator")
        self.master.geometry("350x500")
        self.master.resizable(False, False)
        self.master.configure(bg="#2c2c2c")

        self.display = tk.Entry(self.master, width=20, font=("Arial", 20), bd=0, 
                                justify="right", bg="#1e1e1e", fg="#ffffff", insertbackground="#ffffff")
        self.display.grid(row=0, column=0, columnspan=4, padx=10, pady=20, sticky="nsew")

        self.master.bind("<Key>", self.handle_keypress)

        self.create_buttons()

        for i in range(6):
            self.master.grid_rowconfigure(i, weight=1)
        for i in range(4):
            self.master.grid_columnconfigure(i, weight=1)

    def create_buttons(self):
        button_layout = [
            ('C', 1, 0), ('←', 1, 1), ('%', 1, 2), ('/', 1, 3),
            ('7', 2, 0), ('8', 2, 1), ('9', 2, 2), ('*', 2, 3),
            ('4', 3, 0), ('5', 3, 1), ('6', 3, 2), ('-', 3, 3),
            ('1', 4, 0), ('2', 4, 1), ('3', 4, 2), ('+', 4, 3),
            ('±', 5, 0), ('0', 5, 1), ('.', 5, 2), ('=', 5, 3)
        ]

        for (text, row, col) in button_layout:
            button = tk.Button(
                self.master, text=text, font=("Arial", 14, "bold"),
                bg="#3c3c3c" if text not in ('=', 'C', '←') else "#ff9500",
                fg="#ffffff" if text not in ('=', 'C', '←') else "#ffffff",
                activebackground="#555555", activeforeground="#ffffff",
                bd=0, padx=10, pady=10, highlightthickness=0
            )
            button.config(command=self.get_command(text))
            button.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")

    def get_command(self, text):
        if text == '=':
            return self.calculate
        elif text in '+-*/':
            return lambda t=text: self.add_to_display(t)
        elif text == 'C':
            return self.clear_display
        elif text == '←':
            return self.backspace
        elif text == '±':
            return self.negate
        elif text == '%':
            return self.percentage
        else:
            return lambda t=text: self.add_to_display(t)

    def handle_keypress(self, event):
        key = event.char
        if key.isdigit() or key in '+-*/.':
            self.add_to_display(key)
        elif key == '\r':
            self.calculate()
        elif key == '\x08':
            self.backspace()
        elif key == '\x1b':
            self.clear_display()

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
        except Exception as e:
            messagebox.showerror("Error", str(e))

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