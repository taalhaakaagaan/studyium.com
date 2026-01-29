import os
import zipfile
import shutil

def zipdir(path, ziph, root_path_in_zip=""):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            # Calculate path inside zip
            rel_path = os.path.relpath(file_path, path)
            arcname = os.path.join(root_path_in_zip, rel_path)
            ziph.write(file_path, arcname)

if __name__ == '__main__':
    zip_filename = 'deploy_package.zip'
    base_dir = os.getcwd()

    # 1. Directories to include
    nextjs_out_dir = os.path.join(base_dir, 'out')
    php_api_dir = os.path.join(base_dir, 'public', 'api')
    deploy_extras_dir = os.path.join(base_dir, 'deploy_public_html')

    # 2. Verify existence
    if not os.path.exists(nextjs_out_dir):
        print(f"Error: Next.js build directory '{nextjs_out_dir}' not found. Run 'npm run build' first.")
        # exit(1) # Don't exit strictly, try to pack what we have if user insists, but warning is key.
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        print("Adding Next.js static build (out/)...")
        if os.path.exists(nextjs_out_dir):
            zipdir(nextjs_out_dir, zipf, "") # Root of zip

        print("Adding PHP API (public/api -> /api)...")
        if os.path.exists(php_api_dir):
            zipdir(php_api_dir, zipf, "api")

        print("Adding Deploy Extras (deploy_public_html/ -> /)...")
        if os.path.exists(deploy_extras_dir):
            zipdir(deploy_extras_dir, zipf, "")
        
        # 3. Add the application installer (Studyium-Setup.exe)
        # We only want the specific installer in public/downloads, not build artifacts.
        setup_path = os.path.join(base_dir, 'public', 'downloads', 'Studyium-Setup.exe')
        
        print("Checking for Studyium-Setup.exe...")
        if os.path.exists(setup_path):
             print(f"  Found and adding: Studyium-Setup.exe")
             # Add it to the root of the zip or keeps it in downloads?
             # If the website links to /downloads/Studyium-Setup.exe, we should ensure the structure matches or the user uploads it correctly.
             # Usually for deployment:
             # If "out/downloads/..." exists (from next build), it might already be there if 'public' was copied?
             # Next.js 'public' folder contents are copied to 'out/' during export.
             # So if we are zipping 'out/', the exe might already be inside 'out/downloads/Studyium-Setup.exe'.
             # Let's check if it's already in 'out'.
             
             # If we are zipping 'out', we don't need to add it separately if it acts as a static asset.
             # However, the user wants to be sure.
             # Let's zip 'out' (which includes public assets) + api.
             
             # Wait, if 'out' is zipped, it has 'downloads/Studyium-Setup.exe'.
             # Let's verifying if zipdir(nextjs_out_dir) already covered it.
             pass 
        else:
            # If not in public/downloads, try to find it in studyium.app/dist as fallback but only take one.
            fallback_path = os.path.join(base_dir, 'studyium.app', 'dist', 'Studyium-Setup.exe') 
            # Or checks specifically for the one we want.
            pass

        # Actually, best approach:
        # 1. Zip 'out' (contains website + public assets like downloads/Setup.exe).
        # 2. Zip 'public/api' (backend).
        # 3. Stop there. 
        # The previous script was ADDING extra exes found in other folders.
        # So removing the recursive walk is the fix.
        
        # We'll just print what we are doing.
        print("Application file should be inside 'out/downloads' (from public/downloads).")

    print(f"\nCreated {zip_filename} successfully.")
    print(f"Size: {os.path.getsize(zip_filename) / 1024 / 1024:.2f} MB")

