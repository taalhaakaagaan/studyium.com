
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
            # Ensure forward slashes for cross-platform compatibility
            arcname = arcname.replace(os.sep, '/')
            ziph.write(file_path, arcname)

if __name__ == '__main__':
    zip_filename_base = 'deploy_16.zip'
    base_dir = os.getcwd()

    # 1. Directories to include
    nextjs_out_dir = os.path.join(base_dir, 'out')
    output_zip_path = os.path.join(base_dir, '../', zip_filename_base)
    php_api_dir = os.path.join(base_dir, 'public', 'api')
    # Use deploy_public_html if it exists, otherwise just rely on api
    deploy_extras_dir = os.path.join(base_dir, 'deploy_public_html')

    # 2. Verify existence
    if not os.path.exists(nextjs_out_dir):
        print(f"Error: Next.js build directory '{nextjs_out_dir}' not found. Run 'npm run build' first.")
        # We proceed cautiously, maybe user just wants api + extras? Usually no.
        
    
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
            
        print("Ensuring pdf.worker.min.mjs is included if in out/ (it should be copy of public/)")
        # Next.js build copies public/ -> out/, so verify it exists in out/
        worker_path = os.path.join(nextjs_out_dir, 'pdf.worker.min.mjs')
        if not os.path.exists(worker_path) and os.path.exists(os.path.join(base_dir, 'public', 'pdf.worker.min.mjs')):
             print("Warning: Worker not found in out/, adding manually from public/...")
             zipf.write(os.path.join(base_dir, 'public', 'pdf.worker.min.mjs'), 'pdf.worker.min.mjs')


    print(f"\nCreated {zip_filename_base} successfully.")
    print(f"Output: {output_zip_path}")
    print(f"Size: {os.path.getsize(output_zip_path) / 1024 / 1024:.2f} MB")
