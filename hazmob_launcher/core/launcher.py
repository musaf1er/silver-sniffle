"""
Launcher Core Logic for Hazmob Pro Launcher
Handles browser automation, URL launching, and threading
"""

import webbrowser
import threading
import time
import random
import sys
import os
from typing import Optional, Callable
from urllib.parse import urlparse


class LauncherCore:
    """Core launcher functionality with multi-threading support"""
    
    # Application URLs
    GAME_URL = "https://www.crazygames.com/id/game/hazmob-fps-online-shooter"
    MUSIC_URL = "https://youtu.be/8NnQs3EtoqU?si=7ZdiqoLb2zVE2jSy"
    
    # Available launch modes
    MODES = {
        "default": "Game + Music (Default)",
        "game_only": "Game Only",
        "music_only": "Music Only",
        "random_delay": "Random Delay Mode"
    }
    
    def __init__(self, browser_preference: str = "default"):
        """
        Initialize launcher core
        
        Args:
            browser_preference: Preferred browser (default, chrome, firefox, etc.)
        """
        self.browser_preference = browser_preference
        self.is_launching = False
        self.current_thread: Optional[threading.Thread] = None
        self.status_callback: Optional[Callable] = None
        self.error_callback: Optional[Callable] = None
    
    def set_status_callback(self, callback: Callable[[str], None]) -> None:
        """
        Set callback for status updates
        
        Args:
            callback: Function that receives status string
        """
        self.status_callback = callback
    
    def set_error_callback(self, callback: Callable[[str], None]) -> None:
        """
        Set callback for error messages
        
        Args:
            callback: Function that receives error string
        """
        self.error_callback = callback
    
    def update_status(self, status: str) -> None:
        """
        Update application status
        
        Args:
            status: Status message
        """
        if self.status_callback:
            self.status_callback(status)
    
    def report_error(self, error: str) -> None:
        """
        Report error
        
        Args:
            error: Error message
        """
        if self.error_callback:
            self.error_callback(error)
        else:
            print(f"Error: {error}")
    
    def validate_url(self, url: str) -> bool:
        """
        Validate URL format
        
        Args:
            url: URL to validate
        
        Returns:
            True if valid, False otherwise
        """
        try:
            parsed = urlparse(url)
            return bool(parsed.scheme and parsed.netloc)
        except Exception:
            return False
    
    def open_url(self, url: str) -> bool:
        """
        Open URL in specified browser
        
        Args:
            url: URL to open
        
        Returns:
            True if successful, False otherwise
        """
        if not self.validate_url(url):
            self.report_error(f"Invalid URL: {url}")
            return False
        
        try:
            # Handle browser preference
            if self.browser_preference and self.browser_preference != "default":
                # Try to register and use specific browser
                try:
                    browser_paths = {
                        "chrome": ["chrome", "google-chrome", "chromium-browser", "chrome.exe"],
                        "firefox": ["firefox", "firefox.exe"],
                        "edge": ["microsoft-edge", "msedge", "msedge.exe"],
                        "opera": ["opera", "opera.exe"]
                    }
                    
                    if self.browser_preference in browser_paths:
                        for browser_path in browser_paths[self.browser_preference]:
                            try:
                                webbrowser.register(self.browser_preference, None, 
                                                  webbrowser.GenericBrowser(browser_path))
                                webbrowser.get(self.browser_preference).open(url)
                                return True
                            except:
                                continue
                    
                    # Fallback to default
                    webbrowser.open(url)
                    return True
                except Exception as e:
                    self.report_error(f"Browser error: {str(e)}")
                    webbrowser.open(url)
                    return True
            else:
                # Use system default browser
                webbrowser.open(url)
                return True
                
        except Exception as e:
            self.report_error(f"Failed to open URL: {str(e)}")
            return False
    
    def launch_game(self) -> bool:
        """
        Launch Hazmob game
        
        Returns:
            True if successful, False otherwise
        """
        self.update_status("Launching Hazmob game...")
        success = self.open_url(self.GAME_URL)
        if success:
            self.update_status("Game launched successfully")
        else:
            self.update_status("Failed to launch game")
        return success
    
    def launch_music(self, delay_seconds: int = 0) -> bool:
        """
        Launch YouTube playlist with optional delay
        
        Args:
            delay_seconds: Seconds to wait before launching
        
        Returns:
            True if successful, False otherwise
        """
        if delay_seconds > 0:
            self.update_status(f"Waiting {delay_seconds} seconds before music...")
            
            # Wait with progress (check for cancellation)
            for i in range(delay_seconds):
                if not self.is_launching:
                    self.update_status("Launch cancelled")
                    return False
                time.sleep(1)
                if i < delay_seconds - 1:
                    self.update_status(f"Music starting in {delay_seconds - i - 1}s...")
        
        self.update_status("Launching YouTube playlist...")
        success = self.open_url(self.MUSIC_URL)
        if success:
            self.update_status("Music playlist launched successfully")
        else:
            self.update_status("Failed to launch music playlist")
        return success
    
    def launch_random_delay(self) -> bool:
        """
        Launch with random delay between 1-10 seconds
        
        Returns:
            True if successful, False otherwise
        """
        random_delay = random.randint(1, 10)
        self.update_status(f"Random delay mode: {random_delay} seconds delay")
        
        # Launch game first
        game_success = self.launch_game()
        
        if not game_success:
            return False
        
        # Wait random delay
        if random_delay > 0:
            self.update_status(f"Waiting {random_delay} seconds before music...")
            for i in range(random_delay):
                if not self.is_launching:
                    self.update_status("Launch cancelled")
                    return False
                time.sleep(1)
        
        # Launch music
        music_success = self.launch_music(0)
        
        return game_success and music_success
    
    def launch_default(self, delay_seconds: int = 0) -> bool:
        """
        Default launch: game + music with delay
        
        Args:
            delay_seconds: Delay before music starts
        
        Returns:
            True if successful, False otherwise
        """
        game_success = self.launch_game()
        
        if not game_success:
            return False
        
        if delay_seconds > 0:
            self.update_status(f"Waiting {delay_seconds} seconds before music...")
            for i in range(delay_seconds):
                if not self.is_launching:
                    self.update_status("Launch cancelled")
                    return False
                time.sleep(1)
        
        music_success = self.launch_music(0)
        
        return game_success and music_success
    
    def launch_game_only(self) -> bool:
        """
        Launch only the game
        
        Returns:
            True if successful, False otherwise
        """
        return self.launch_game()
    
    def launch_music_only(self, delay_seconds: int = 0) -> bool:
        """
        Launch only the music
        
        Args:
            delay_seconds: Delay before music starts
        
        Returns:
            True if successful, False otherwise
        """
        if delay_seconds > 0:
            self.update_status(f"Waiting {delay_seconds} seconds before music...")
            for i in range(delay_seconds):
                if not self.is_launching:
                    self.update_status("Launch cancelled")
                    return False
                time.sleep(1)
        
        return self.launch_music(0)
    
    def launch_mode(self, mode: str, delay_seconds: int = 0) -> bool:
        """
        Launch based on selected mode
        
        Args:
            mode: Launch mode (default, game_only, music_only, random_delay)
            delay_seconds: Delay for music (if applicable)
        
        Returns:
            True if successful, False otherwise
        """
        if self.is_launching:
            self.report_error("Already launching...")
            return False
        
        self.is_launching = True
        
        try:
            if mode == "game_only":
                success = self.launch_game_only()
            elif mode == "music_only":
                success = self.launch_music_only(delay_seconds)
            elif mode == "random_delay":
                success = self.launch_random_delay()
            else:  # default mode
                success = self.launch_default(delay_seconds)
            
            if success:
                self.update_status("Launch complete!")
            else:
                self.update_status("Launch failed!")
            
            return success
            
        except Exception as e:
            self.report_error(f"Launch error: {str(e)}")
            self.update_status("Error during launch")
            return False
        finally:
            self.is_launching = False
    
    def launch_async(self, mode: str, delay_seconds: int = 0, 
                     callback: Optional[Callable[[bool], None]] = None) -> threading.Thread:
        """
        Launch in separate thread to prevent UI freezing
        
        Args:
            mode: Launch mode
            delay_seconds: Delay for music
            callback: Optional callback with success result
        
        Returns:
            Thread object
        """
        def target():
            result = self.launch_mode(mode, delay_seconds)
            if callback:
                callback(result)
        
        self.current_thread = threading.Thread(target=target, daemon=True)
        self.current_thread.start()
        return self.current_thread
    
    def cancel_launch(self) -> None:
        """
        Cancel current launch attempt
        """
        self.is_launching = False
        self.update_status("Launch cancelled")
    
    def is_launching_in_progress(self) -> bool:
        """
        Check if launch is in progress
        
        Returns:
            True if launching, False otherwise
        """
        return self.is_launching