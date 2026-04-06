"""
Configuration Manager for Hazmob Pro Launcher
Handles persistent storage of user settings
"""

import json
import os
import sys
from typing import Dict, Any


class ConfigManager:
    """Manages application configuration with JSON persistence"""
    
    def __init__(self, config_path: str = "config.json"):
        """
        Initialize config manager
        
        Args:
            config_path: Path to JSON configuration file
        """
        # Handle PyInstaller打包后的路径
        if getattr(sys, 'frozen', False):
            # 运行在打包后的exe中
            application_path = os.path.dirname(sys.executable)
        else:
            # 运行在开发环境中
            application_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        self.config_path = os.path.join(application_path, config_path)
        self.default_config = {
            "delay": 5,
            "mode": "default",
            "browser": "default",
            "theme": "dark",
            "first_launch": True
        }
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """
        Load configuration from JSON file
        
        Returns:
            Dictionary with configuration values
        """
        if not os.path.exists(self.config_path):
            return self.create_default_config()
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                loaded_config = json.load(f)
                # Merge with defaults to ensure all keys exist
                merged_config = self.default_config.copy()
                merged_config.update(loaded_config)
                return merged_config
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading config: {e}")
            return self.create_default_config()
    
    def create_default_config(self) -> Dict[str, Any]:
        """
        Create default configuration file
        
        Returns:
            Default configuration dictionary
        """
        self.save_config(self.default_config)
        return self.default_config.copy()
    
    def save_config(self, config: Dict[str, Any] = None) -> bool:
        """
        Save configuration to JSON file
        
        Args:
            config: Configuration to save (uses current if None)
        
        Returns:
            True if successful, False otherwise
        """
        if config is None:
            config = self.config
        
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=4, ensure_ascii=False)
            return True
        except IOError as e:
            print(f"Error saving config: {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value
        
        Args:
            key: Configuration key
            default: Default value if key not found
        
        Returns:
            Configuration value
        """
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any) -> bool:
        """
        Set configuration value and save
        
        Args:
            key: Configuration key
            value: New value
        
        Returns:
            True if successful, False otherwise
        """
        self.config[key] = value
        return self.save_config()
    
    def get_all(self) -> Dict[str, Any]:
        """
        Get all configuration values
        
        Returns:
            Complete configuration dictionary
        """
        return self.config.copy()