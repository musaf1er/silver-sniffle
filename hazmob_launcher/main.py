"""
Hazmob Pro Launcher - Main Entry Point
Production-ready standalone executable application
"""

import sys
import os

# Add project directories to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ui.main_window import HazmobProLauncher


def main():
    """
    Main entry point for Hazmob Pro Launcher
    Initializes and runs the application
    """
    try:
        # Create and run application
        app = HazmobProLauncher()
        app.run()
    except KeyboardInterrupt:
        print("\nApplication closed by user")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}")
        # Show error dialog if GUI fails
        try:
            from tkinter import messagebox
            messagebox.showerror("Fatal Error", f"Failed to start application:\n{str(e)}")
        except:
            pass
        sys.exit(1)


if __name__ == "__main__":
    main()