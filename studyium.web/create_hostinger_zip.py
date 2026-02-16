import os
import zipfile
import shutil

def zipdir(path, ziph, root_path_in_zip="", exclude_dirs=None):
    """
    Helper to zip a directory recursively.
    root_path_in_zip: prefix inside the zip.
    exclude_dirs: list of directory names to skip.
    """
    if exclude_dirs is None:
        exclude_dirs = []

    for root, dirs, files in os.walk(path):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            file_path = os.path.join(root, file)
            rel = os.path.relpath(file_path, path)
            arcname = os.path.join(root_path_in_zip, rel)
            
            # Additional check for file exclusion if needed
            ziph.write(file_path, arcname)
            print(f"Added: {arcname}")

if __name__ == '__main__':
    zip_filename = 'hostinger_deploy.zip'
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Paths
    nextjs_out_dir = os.path.join(base_dir, 'out')
    php_api_dir = os.path.join(base_dir, 'public', 'api')
    deploy_extras_dir = os.path.join(base_dir, 'deploy_public_html')
    
    # print(f"Creating {zip_filename}...")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED, allowZip64=True) as zipf:
        
        # 1. Add Static Site (out folder) - ESCAPE downloads
        if os.path.exists(nextjs_out_dir):
            print("Adding Next.js static build (out/)... (excluding downloads)")
            zipdir(nextjs_out_dir, zipf, "", exclude_dirs=["downloads"])
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

        pass

    print(f"\nSuccess! Created {zip_filename}")
    size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
    print(f"Size: {size_mb:.2f} MB")
