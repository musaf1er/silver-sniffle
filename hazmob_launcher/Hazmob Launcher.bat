@echo off
REM ============================================
REM Hazmob Pro Launcher - Windows Batch Launcher
REM ============================================
REM This script launches the Hazmob Pro Launcher Python application
REM ============================================

REM Set the title of the CMD window
TITLE Hazmob Pro Launcher

REM Set text color to green for better visibility (optional)
COLOR 0A

REM ============================================
REM CONFIGURATION SECTION
REM Edit this path to match your project location
REM ============================================

REM Option 1: Use relative path (if .bat is in same folder as main.py)
REM Simply use current directory
SET "PROJECT_DIR=%~dp0"

REM Option 2: Use absolute path (uncomment and modify as needed)
REM SET "PROJECT_DIR=D:\Kelas Industri Hummatech\hazmob_launcher"

REM ============================================
REM NAVIGATION SECTION
REM ============================================

REM Display current working directory
ECHO ========================================
ECHO Hazmob Pro Launcher - Starting...
ECHO ========================================
ECHO.

REM Navigate to the project directory
ECHO Navigating to project folder...
CD /D "%PROJECT_DIR%"

REM Check if navigation was successful
IF %ERRORLEVEL% NEQ 0 (
    ECHO ERROR: Failed to navigate to project directory!
    ECHO Path: %PROJECT_DIR%
    ECHO.
    ECHO Please check if the path is correct.
    PAUSE
    EXIT /B 1
)

ECHO Current directory: %CD%
ECHO.

REM ============================================
REM FILE CHECK SECTION
REM ============================================

REM Check if main.py exists
IF NOT EXIST "main.py" (
    ECHO ERROR: main.py not found in current directory!
    ECHO Please ensure main.py exists in: %CD%
    ECHO.
    PAUSE
    EXIT /B 1
)

REM ============================================
REM PYTHON CHECK SECTION
REM ============================================

REM Check if Python is available
WHERE python >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO WARNING: 'python' command not found. Trying 'py'...
    WHERE py >nul 2>nul
    IF %ERRORLEVEL% NEQ 0 (
        ECHO ERROR: Python is not installed or not in PATH!
        ECHO.
        ECHO Please install Python from https://python.org
        ECHO Make sure to check "Add Python to PATH" during installation.
        PAUSE
        EXIT /B 1
    ) ELSE (
        SET "PYTHON_CMD=py"
        ECHO Using 'py' command to run Python...
    )
) ELSE (
    SET "PYTHON_CMD=python"
    ECHO Using 'python' command to run Python...
)

REM Display Python version
ECHO.
%PYTHON_CMD% --version
ECHO.

REM ============================================
REM DEPENDENCY CHECK SECTION (Optional)
REM ============================================

REM Check if customtkinter is installed
%PYTHON_CMD% -c "import customtkinter" 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO WARNING: Required packages may not be installed!
    ECHO.
    ECHO To install requirements, run:
    ECHO %PYTHON_CMD% -m pip install customtkinter Pillow
    ECHO.
    ECHO Continuing anyway (application might fail)...
    ECHO.
    TIMEOUT /T 3 /NOBREAK >nul
)

REM ============================================
REM LAUNCH SECTION
REM ============================================

ECHO ========================================
ECHO Launching Hazmob Pro Launcher...
ECHO ========================================
ECHO.

REM Run the Python application
%PYTHON_CMD% main.py

REM ============================================
REM EXIT HANDLING SECTION
REM ============================================

REM Check if the application closed normally
IF %ERRORLEVEL% EQU 0 (
    ECHO.
    ECHO ========================================
    ECHO Application closed successfully.
    ECHO ========================================
) ELSE (
    ECHO.
    ECHO ========================================
    ECHO Application exited with error code: %ERRORLEVEL%
    ECHO ========================================
)

REM ============================================
REM KEEP CMD WINDOW OPEN
REM ============================================

ECHO.
ECHO Press any key to close this window...
PAUSE >nul

REM Exit the batch script
EXIT /B %ERRORLEVEL%