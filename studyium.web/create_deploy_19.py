
import os
import zipfile
import shutil

def zipdir(path, ziph, root_path_in_zip=""):
    # ziph is zipfile handle
    if root_path_in_zip == ".":
        root_path_in_zip = ""

    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            # Calculate path inside zip
            rel_path = os.path.relpath(file_path, path)
            arcname = os.path.join(root_path_in_zip, rel_path)
            # Ensure forward slashes
            arcname = arcname.replace(os.sep, '/')
            
            try:
                ziph.getinfo(arcname)
                print(f"Skipping duplicate: {arcname}")
            except KeyError:
                ziph.write(file_path, arcname)
                print(f"Added: {arcname}")

if __name__ == '__main__':
    zip_filename_base = 'deploy_19.zip'
    base_dir = os.getcwd()

    # 1. Directories to include
    nextjs_out_dir = os.path.join(base_dir, 'out')
    output_zip_path = os.path.join(base_dir, '../', zip_filename_base)
    php_api_dir = os.path.join(base_dir, 'public', 'api')
    deploy_extras_dir = os.path.join(base_dir, 'deploy_public_html')

    # 2. Verify existence
    if not os.path.exists(nextjs_out_dir):
        print(f"Error: Next.js build directory '{nextjs_out_dir}' not found. Run 'npm run build' first.")
    
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        print("Adding Next.js static build (out/)...")
        if os.path.exists(nextjs_out_dir):
            zipdir(nextjs_out_dir, zipf, "") # Root of zip

        # Check if api exists in out/api.
        api_in_out = os.path.join(nextjs_out_dir, 'api')
        if not os.path.exists(api_in_out) and os.path.exists(php_api_dir):
             print("Adding PHP API separately (public/api -> api/)...")
             zipdir(php_api_dir, zipf, "api")

        print("Adding Deploy Extras (deploy_public_html/ -> /)...")
        if os.path.exists(deploy_extras_dir):
            zipdir(deploy_extras_dir, zipf, "")
            
        print("Ensuring pdf.worker.min.js is included...")
        try:
            zipf.getinfo('pdf.worker.min.js')
            print("pdf.worker.min.js already in zip.")
        except KeyError:
             worker_src = os.path.join(base_dir, 'public', 'pdf.worker.min.js')
             if os.path.exists(worker_src):
                 zipf.write(worker_src, 'pdf.worker.min.js')
                 print("Added pdf.worker.min.js from public/")
             else:
                 print("Error: pdf.worker.min.js not found!")

        # Also include .htaccess just in case
        print("Ensuring .htaccess is included...")
        try:
            zipf.getinfo('.htaccess')
        except KeyError:
             htaccess_src = os.path.join(base_dir, 'public', '.htaccess')
             if os.path.exists(htaccess_src):
                 zipf.write(htaccess_src, '.htaccess')
                 print("Added .htaccess from public/")


    print(f"\nCreated {zip_filename_base} successfully.")
    print(f"Output: {output_zip_path}")
    print(f"Size: {os.path.getsize(output_zip_path) / 1024 / 1024:.2f} MB")
