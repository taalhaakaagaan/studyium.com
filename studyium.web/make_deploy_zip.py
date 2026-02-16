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
    zip_filename_base = 'deploy_15.zip'
    base_dir = os.getcwd()

    # 1. Directories to include
    nextjs_out_dir = os.path.join(base_dir, 'out')
    output_zip_path = os.path.join(base_dir, '../', zip_filename_base)
    php_api_dir = os.path.join(base_dir, 'public', 'api') # Kept this as it's used later
    deploy_extras_dir = os.path.join(base_dir, 'deploy_public_html')

    # 2. Verify existence
    if not os.path.exists(nextjs_out_dir):
        print(f"Error: Next.js build directory '{nextjs_out_dir}' not found. Run 'npm run build' first.")
        # exit(1) # Don't exit strictly, try to pack what we have if user insists, but warning is key.
    
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        print("Adding Next.js static build (out/)...")
        if os.path.exists(nextjs_out_dir):
            zipdir(nextjs_out_dir, zipf, "") # Root of zip

        print("Adding PHP API (public/api -> /api)...")
        if os.path.exists(php_api_dir):
            zipdir(php_api_dir, zipf, "api")

        print("Adding Deploy Extras (deploy_public_html/ -> /)...")
        if os.path.exists(deploy_extras_dir):
            zipdir(deploy_extras_dir, zipf, "")
        
        # 3. Application setup is hosted on GitHub, so we don't include it in the web deployment package.
        print("Application file is hosted on GitHub (not included in this zip).")

        # Actually, best approach:
        # 1. Zip 'out' (contains website + public assets like downloads/Setup.exe).
        # 2. Zip 'public/api' (backend).
        # 3. Stop there. 
        # The previous script was ADDING extra exes found in other folders.
        # So removing the recursive walk is the fix.
        
        # We'll just print what we are doing.
        print("Application file should be inside 'out/downloads' (from public/downloads).")

    print(f"\nCreated {zip_filename_base} successfully.")
    print(f"Size: {os.path.getsize(output_zip_path) / 1024 / 1024:.2f} MB")

