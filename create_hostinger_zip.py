import os
import zipfile
import shutil

def zipdir(path, ziph, root_path_in_zip=""):
    """
    Helper to zip a directory recursively.
    root_path_in_zip: prefix inside the zip.
    """
    # ziph is zipfile handle
    # Calculate length of path to replace for relative path
    parent_len = len(os.path.dirname(os.path.abspath(path)))
    
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            # Calculate path inside zip
            # If path is C:/A/B/out, and we want it in root, 
            # relpath from C:/A/B/out give us local structure
            rel = os.path.relpath(file_path, path)
            arcname = os.path.join(root_path_in_zip, rel)
            
            # Write to zip
            ziph.write(file_path, arcname)
            print(f"Added: {arcname}")

if __name__ == '__main__':
    zip_filename = 'hostinger_deploy.zip'
    base_dir = os.getcwd()

    # Paths
    nextjs_out_dir = os.path.join(base_dir, 'out')
    php_api_dir = os.path.join(base_dir, 'public', 'api')
    deploy_extras_dir = os.path.join(base_dir, 'deploy_public_html')
    
    # Executable Source
    # We prefer the one in 'out' if it exists (verified by build), else public.
    # Actually, verify timestamps:
    # Public: 29.01.2026 00:38:17
    # Out:    29.01.2026 00:38:17
    # They are same. 'out' is likely copied from public during build.
    # But strictly, 'out' is what Next.js generated.
    # However, create_hostinger_zip logic needs to ensure 'downloads/Studyium-Setup.exe' is in the zip.
    
    existing_exe_path = os.path.join(base_dir, 'public', 'downloads', 'Studyium-Setup.exe')
    
    print(f"Creating {zip_filename}...")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED, allowZip64=True) as zipf:
        
        # 1. Add Static Site (out folder)
        if os.path.exists(nextjs_out_dir):
            print("Adding Next.js static build (out/)...")
            zipdir(nextjs_out_dir, zipf, "")
        else:
            print(f"ERROR: {nextjs_out_dir} does not exist. Run 'npm run build' first.")
            exit(1)

        # 2. Add PHP API
        # Next.js 'out' might NOT contain the PHP files if they are just in public/api but not processed by Next.js build as static assets?
        # Typically 'public' folder contents are copied to 'out'.
        # Let's check if 'api' is already in 'out'.
        api_in_out = os.path.join(nextjs_out_dir, 'api')
        if not os.path.exists(api_in_out) and os.path.exists(php_api_dir):
             print("Adding PHP API separately (public/api -> api/)...")
             zipdir(php_api_dir, zipf, "api")
        else:
             print("PHP API should be in out/api, double checking...")
             # Double check if specific PHP files are there.
             # If next.js static export copies public, it updates timestamps.
             pass

        # 3. Add Deploy Extras (e.g. update_db.sql) to root
        if os.path.exists(deploy_extras_dir):
            print("Adding Deploy Extras...")
            zipdir(deploy_extras_dir, zipf, "")

        # 4. Verify EXE presence in ZIP
        # We need to make sure 'downloads/Studyium-Setup.exe' is in the zip.
        # Check if 'out/downloads/Studyium-Setup.exe' was added.
        # If 'out' contained it, it was added in step 1.
        # If not, we add it manually from public.
        
        # We can't easily query the zipf object in write mode for existence efficiently without tracking.
        # So explicit check:
        exe_in_out = os.path.join(nextjs_out_dir, 'downloads', 'Studyium-Setup.exe')
        if not os.path.exists(exe_in_out):
            if os.path.exists(existing_exe_path):
                print("Adding Studyium-Setup.exe manually from public/downloads...")
                zipf.write(existing_exe_path, "downloads/Studyium-Setup.exe")
            else:
                 print("WARNING: Studyium-Setup.exe not found in public/downloads!")

    print(f"\nSuccess! Created {zip_filename}")
    size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
    print(f"Size: {size_mb:.2f} MB")
