"""
Main UI Window for Hazmob Pro Launcher
Modern dark-themed interface using CustomTkinter
"""

import customtkinter as ctk # type: ignore
from threading import Thread
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.launcher import LauncherCore
from core.config_manager import ConfigManager


class HazmobProLauncher(ctk.CTk):
    """Main application window"""
    
    def __init__(self):
        super().__init__()
        
        # Initialize core components
        self.config_manager = ConfigManager()
        self.launcher = LauncherCore(
            browser_preference=self.config_manager.get("browser", "default")
        )
        
        # Application state
        self.current_status = "Idle"
        self.is_launching = False
        
        # Configure window
        self.title("Hazmob Pro Launcher")
        self.geometry("600x700")
        self.resizable(False, False)
        self.center_window()
        
        # Set appearance
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")
        
        # Configure grid layout
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Create main container
        self.main_container = ctk.CTkFrame(self, corner_radius=15)
        self.main_container.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        self.main_container.grid_columnconfigure(0, weight=1)
        
        # Build UI sections
        self.create_header()
        self.create_game_info()
        self.create_mode_selection()
        self.create_delay_control()
        self.create_launch_button()
        self.create_status_area()
        self.create_footer()
        
        # Set up callbacks
        self.launcher.set_status_callback(self.update_status)
        self.launcher.set_error_callback(self.show_error)
        
        # Load saved settings
        self.load_saved_settings()
        
        # Show welcome message on first launch
        if self.config_manager.get("first_launch", True):
            self.show_welcome_message()
            self.config_manager.set("first_launch", False)
        
        # Bind window close event
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def center_window(self) -> None:
        """Center window on screen"""
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_header(self) -> None:
        """Create application header"""
        # Title
        self.title_label = ctk.CTkLabel(
            self.main_container,
            text="HAZMOB PRO LAUNCHER",
            font=ctk.CTkFont(size=34, weight="bold"),
            text_color="#00ff87"
        )
        self.title_label.grid(row=0, column=0, pady=(25, 5))
        
        # Subtitle
        self.subtitle_label = ctk.CTkLabel(
            self.main_container,
            text="Professional Gaming Launcher",
            font=ctk.CTkFont(size=14, slant="italic"),
            text_color="#888888"
        )
        self.subtitle_label.grid(row=1, column=0, pady=(0, 20))
        
        # Decorative separator
        self.separator = ctk.CTkFrame(self.main_container, height=2, fg_color="#00ff87")
        self.separator.grid(row=2, column=0, padx=50, pady=(0, 20), sticky="ew")
    
    def create_game_info(self) -> None:
        """Create game information panel"""
        info_frame = ctk.CTkFrame(self.main_container, corner_radius=10)
        info_frame.grid(row=3, column=0, padx=20, pady=(0, 15), sticky="ew")
        info_frame.grid_columnconfigure(0, weight=1)
        
        info_text = """
        ⚡ GAME: HAZMOB FPS ONLINE SHOOTER ⚡
        
        • Intense multiplayer FPS action
        • Tactical team-based combat
        • Epic gaming music playlist included
        • Optimized launcher for best experience
        """
        
        self.info_label = ctk.CTkLabel(
            info_frame,
            text=info_text,
            font=ctk.CTkFont(size=12),
            justify="left"
        )
        self.info_label.grid(row=0, column=0, padx=20, pady=15)
    
    def create_mode_selection(self) -> None:
        """Create mode selection dropdown"""
        mode_frame = ctk.CTkFrame(self.main_container, corner_radius=10)
        mode_frame.grid(row=4, column=0, padx=20, pady=(0, 15), sticky="ew")
        mode_frame.grid_columnconfigure(0, weight=1)
        
        # Mode label
        mode_label = ctk.CTkLabel(
            mode_frame,
            text="LAUNCH MODE",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#00ff87"
        )
        mode_label.grid(row=0, column=0, padx=20, pady=(15, 5), sticky="w")
        
        # Mode dropdown
        mode_values = list(LauncherCore.MODES.values())
        self.mode_var = ctk.StringVar(value=mode_values[0])
        self.mode_dropdown = ctk.CTkOptionMenu(
            mode_frame,
            values=mode_values,
            variable=self.mode_var,
            command=self.on_mode_change,
            dynamic_resizing=False,
            width=350,
            height=40,
            font=ctk.CTkFont(size=13)
        )
        self.mode_dropdown.grid(row=1, column=0, padx=20, pady=(0, 10))
        
        # Mode description
        self.mode_desc_label = ctk.CTkLabel(
            mode_frame,
            text="Launches both game and music with configurable delay",
            font=ctk.CTkFont(size=11, slant="italic"),
            text_color="#666666"
        )
        self.mode_desc_label.grid(row=2, column=0, padx=20, pady=(0, 15))
    
    def create_delay_control(self) -> None:
        """Create delay slider control"""
        delay_frame = ctk.CTkFrame(self.main_container, corner_radius=10)
        delay_frame.grid(row=5, column=0, padx=20, pady=(0, 15), sticky="ew")
        delay_frame.grid_columnconfigure(0, weight=1)
        
        # Delay label
        delay_label = ctk.CTkLabel(
            delay_frame,
            text="MUSIC DELAY (SECONDS)",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#00ff87"
        )
        delay_label.grid(row=0, column=0, padx=20, pady=(15, 10), sticky="w")
        
        # Slider and value container
        slider_container = ctk.CTkFrame(delay_frame, fg_color="transparent")
        slider_container.grid(row=1, column=0, padx=20, pady=(0, 15), sticky="ew")
        slider_container.grid_columnconfigure(0, weight=1)
        
        # Delay slider
        self.delay_slider = ctk.CTkSlider(
            slider_container,
            from_=0,
            to=15,
            number_of_steps=15,
            command=self.update_delay_label,
            width=350
        )
        self.delay_slider.grid(row=0, column=0, sticky="ew", padx=(0, 15))
        
        # Delay value label
        self.delay_value_label = ctk.CTkLabel(
            slider_container,
            text="5s",
            width=45,
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#00ff87"
        )
        self.delay_value_label.grid(row=0, column=1)
        
        # Delay hint
        delay_hint = ctk.CTkLabel(
            delay_frame,
            text="Delay before music starts after game launch",
            font=ctk.CTkFont(size=11, slant="italic"),
            text_color="#666666"
        )
        delay_hint.grid(row=2, column=0, padx=20, pady=(0, 15))
    
    def create_launch_button(self) -> None:
        """Create main launch button"""
        self.launch_button = ctk.CTkButton(
            self.main_container,
            text="▶ START GAMING",
            font=ctk.CTkFont(size=18, weight="bold"),
            height=55,
            corner_radius=12,
            fg_color="#00ff87",
            hover_color="#00cc6a",
            text_color="#000000",
            command=self.on_launch_click
        )
        self.launch_button.grid(row=6, column=0, padx=40, pady=20, sticky="ew")
        
        # Hover effects
        self.launch_button.bind("<Enter>", self.on_button_hover)
        self.launch_button.bind("<Leave>", self.on_button_leave)
    
    def create_status_area(self) -> None:
        """Create status display area"""
        status_frame = ctk.CTkFrame(self.main_container, corner_radius=10)
        status_frame.grid(row=7, column=0, padx=20, pady=(0, 15), sticky="ew")
        status_frame.grid_columnconfigure(0, weight=1)
        
        # Status header
        status_header = ctk.CTkLabel(
            status_frame,
            text="STATUS",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="#888888"
        )
        status_header.grid(row=0, column=0, padx=20, pady=(10, 5), sticky="w")
        
        # Status indicator and text
        status_container = ctk.CTkFrame(status_frame, fg_color="transparent")
        status_container.grid(row=1, column=0, padx=20, pady=(0, 10), sticky="w")
        
        self.status_indicator = ctk.CTkLabel(
            status_container,
            text="●",
            font=ctk.CTkFont(size=16),
            text_color="#00ff87"
        )
        self.status_indicator.grid(row=0, column=0, padx=(0, 5))
        
        self.status_label = ctk.CTkLabel(
            status_container,
            text="Idle",
            font=ctk.CTkFont(size=13),
            text_color="#ffffff"
        )
        self.status_label.grid(row=0, column=1)
        
        # Progress bar (hidden by default)
        self.progress_bar = ctk.CTkProgressBar(status_frame, width=450, height=8)
        self.progress_bar.set(0)
        # Progress bar will be shown only during launch
    
    def create_footer(self) -> None:
        """Create footer with version info"""
        footer_frame = ctk.CTkFrame(self.main_container, fg_color="transparent")
        footer_frame.grid(row=8, column=0, pady=(0, 15))
        
        version_label = ctk.CTkLabel(
            footer_frame,
            text="Version 2.0.0 | Standalone Executable | © 2024 Hazmob Pro Launcher",
            font=ctk.CTkFont(size=10),
            text_color="#555555"
        )
        version_label.grid(row=0, column=0)
    
    def on_mode_change(self, choice: str) -> None:
        """
        Handle mode selection change
        
        Args:
            choice: Selected mode display text
        """
        # Find mode key from display value
        mode_key = None
        for key, value in LauncherCore.MODES.items():
            if value == choice:
                mode_key = key
                break
        
        if mode_key:
            # Update UI based on mode
            if mode_key == "music_only":
                self.delay_slider.configure(state="normal")
                self.mode_desc_label.configure(
                    text="Launches only the music playlist with configured delay"
                )
            elif mode_key == "random_delay":
                self.delay_slider.configure(state="disabled")
                self.mode_desc_label.configure(
                    text="Random delay between 1-10 seconds before music starts"
                )
            elif mode_key == "game_only":
                self.delay_slider.configure(state="disabled")
                self.mode_desc_label.configure(
                    text="Launches only the game, no music delay needed"
                )
            else:  # default
                self.delay_slider.configure(state="normal")
                self.mode_desc_label.configure(
                    text="Launches both game and music with configurable delay"
                )
            
            # Save to config
            self.config_manager.set("mode", mode_key)
    
    def update_delay_label(self, value: float) -> None:
        """
        Update delay value display
        
        Args:
            value: Slider value
        """
        delay = int(value)
        self.delay_value_label.configure(text=f"{delay}s")
    
    def on_launch_click(self) -> None:
        """Handle launch button click"""
        if self.is_launching:
            return
        
        # Get selected mode
        mode_display = self.mode_var.get()
        mode_key = None
        for key, value in LauncherCore.MODES.items():
            if value == mode_display:
                mode_key = key
                break
        
        if not mode_key:
            mode_key = "default"
        
        # Get delay (only for modes that use it)
        delay = int(self.delay_slider.get())
        if mode_key in ["game_only", "random_delay"]:
            delay = 0
        
        # Save settings
        self.config_manager.set("delay", delay)
        self.config_manager.set("mode", mode_key)
        
        # Update UI for launching state
        self.is_launching = True
        self.launch_button.configure(
            text="⏳ LAUNCHING...",
            fg_color="#ffaa00",
            state="disabled"
        )
        self.update_status("Starting launch sequence...")
        self.show_progress_bar()
        
        # Launch in background thread
        self.launcher.launch_async(mode_key, delay, callback=self.on_launch_complete)
    
    def on_launch_complete(self, success: bool) -> None:
        """
        Handle launch completion
        
        Args:
            success: True if launch succeeded, False otherwise
        """
        self.is_launching = False
        self.hide_progress_bar()
        
        if success:
            self.launch_button.configure(
                text="✓ LAUNCHED!",
                fg_color="#00cc6a",
                state="normal"
            )
            self.update_status("Ready for action! Game launched successfully")
            # Reset button after delay
            self.after(2000, self.reset_launch_button)
        else:
            self.launch_button.configure(
                text="⚠ LAUNCH FAILED",
                fg_color="#ff4444",
                state="normal"
            )
            self.update_status("Launch failed - check your connection and try again")
            self.after(2000, self.reset_launch_button)
    
    def reset_launch_button(self) -> None:
        """Reset launch button to normal state"""
        if not self.is_launching:
            self.launch_button.configure(
                text="▶ START GAMING",
                fg_color="#00ff87",
                state="normal"
            )
    
    def on_button_hover(self, event) -> None:
        """Handle button hover effect"""
        if not self.is_launching:
            self.launch_button.configure(fg_color="#00cc6a")
    
    def on_button_leave(self, event) -> None:
        """Handle button leave effect"""
        if not self.is_launching:
            self.launch_button.configure(fg_color="#00ff87")
    
    def update_status(self, status: str) -> None:
        """
        Update status display
        
        Args:
            status: Status message
        """
        self.current_status = status
        self.status_label.configure(text=status)
        
        # Change indicator color based on status
        if "error" in status.lower() or "failed" in status.lower():
            self.status_indicator.configure(text_color="#ff4444")
        elif "complete" in status.lower() or "success" in status.lower():
            self.status_indicator.configure(text_color="#00ff87")
        elif "launching" in status.lower() or "starting" in status.lower():
            self.status_indicator.configure(text_color="#ffaa00")
        else:
            self.status_indicator.configure(text_color="#00ff87")
    
    def show_error(self, error: str) -> None:
        """
        Show error message
        
        Args:
            error: Error message
        """
        self.update_status(f"Error: {error}")
    
    def show_progress_bar(self) -> None:
        """Show and animate progress bar"""
        self.progress_bar.grid(row=1, column=0, padx=20, pady=(0, 10), sticky="ew")
        self.progress_bar.set(0)
        self.animate_progress(0)
    
    def animate_progress(self, value: float) -> None:
        """Animate progress bar"""
        if self.is_launching and value < 0.95:
            value += 0.05
            self.progress_bar.set(value)
            self.after(200, self.animate_progress, value)
        elif not self.is_launching:
            self.progress_bar.set(1.0)
    
    def hide_progress_bar(self) -> None:
        """Hide progress bar"""
        self.progress_bar.grid_forget()
        self.progress_bar.set(0)
    
    def load_saved_settings(self) -> None:
        """Load saved settings from config"""
        # Load delay
        delay = self.config_manager.get("delay", 5)
        self.delay_slider.set(delay)
        self.update_delay_label(delay)
        
        # Load mode
        mode_key = self.config_manager.get("mode", "default")
        mode_display = LauncherCore.MODES.get(mode_key, LauncherCore.MODES["default"])
        self.mode_var.set(mode_display)
        self.on_mode_change(mode_display)
        
        # Load browser preference
        browser = self.config_manager.get("browser", "default")
        self.launcher.browser_preference = browser
    
    def show_welcome_message(self) -> None:
        """Show welcome message on first launch"""
        welcome_text = """Welcome to Hazmob Pro Launcher!

This application will help you launch:
• Hazmob FPS Online Shooter game
• Epic gaming music playlist

Features:
• Multiple launch modes
• Configurable music delay
• Random delay option
• Real-time status updates

Enjoy your gaming experience!"""
        
        from tkinter import messagebox
        messagebox.showinfo("Welcome to Hazmob Pro Launcher", welcome_text)
    
    def on_closing(self) -> None:
        """Handle window closing event"""
        if self.is_launching:
            self.launcher.cancel_launch()
        self.destroy()
    
    def run(self) -> None:
        """Run the application"""
        self.mainloop()