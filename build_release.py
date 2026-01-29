import os
import shutil
import subprocess
import glob

def run_command(command, cwd=None):
    print(f"Running: {command} in {cwd or os.getcwd()}")
    try:
        subprocess.check_call(command, shell=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        exit(1)

def main():
    base_dir = os.getcwd()
    app_dir = os.path.join(base_dir, 'studyium.app')
    dist_dir = os.path.join(app_dir, 'dist')
    public_downloads_dir = os.path.join(base_dir, 'public', 'downloads')

    # 1. Build Electron App
    print("--- Step 1: Building Electron App ---")
    run_command('npm run electron-build', cwd=app_dir)

    # 2. Find and Move Installer
    print("--- Step 2: Moving Installer ---")
    # Looking for .exe in dist folder (not in win-unpacked)
    exe_files = glob.glob(os.path.join(dist_dir, '*.exe'))
    
    # Filter out blockmap/builder-debug if any, usually just want the Setup exe.
    # Typically named "Studyium Setup X.Y.Z.exe"
    setup_exe = None
    for f in exe_files:
        if 'Setup' in f and 'blockmap' not in f:
            setup_exe = f
            break
    
    if not setup_exe and exe_files:
        setup_exe = exe_files[0] # Fallback
        
    if setup_exe:
        print(f"Found installer: {setup_exe}")
        target_path = os.path.join(public_downloads_dir, 'Studyium-Setup.exe')
        
        if not os.path.exists(public_downloads_dir):
            os.makedirs(public_downloads_dir)
            
        shutil.copy2(setup_exe, target_path)
        print(f"Copied to: {target_path}")
    else:
        print("ERROR: No .exe installer found in studyium.app/dist")
        exit(1)

    # 3. Build Website
    print("--- Step 3: Building Website ---")
    run_command('npm run build', cwd=base_dir)

    # 4. Package for Hostinger
    print("--- Step 4: Packaging for Hostinger ---")
    # Using the existing script
    run_command('python create_hostinger_zip.py', cwd=base_dir)

    print("\n--- DONE ---")
    print("release built and packaged successfully.")

if __name__ == "__main__":
    main()
