
import zipfile
import os

def zip_folder(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                # Compute relative path for zip entry
                arcname = os.path.relpath(file_path, folder_path)
                # FORCE FORWARD SLASHES for Linux compatibility
                arcname = arcname.replace(os.path.sep, '/')
                zipf.write(file_path, arcname)
            
            # Explicitly add directories to ensure they exist
            for d in dirs:
                dir_path = os.path.join(root, d)
                arcname = os.path.relpath(dir_path, folder_path)
                arcname = arcname.replace(os.path.sep, '/') + '/'
                zipf.writestr(zipfile.ZipInfo(arcname), '')

if __name__ == "__main__":
    # Target the prepared directory 'dist_deploy'
    if os.path.exists('dist_deploy'):
        print("Zipping dist_deploy to hostinger_deploy.zip with correct paths...")
        zip_folder('dist_deploy', 'hostinger_deploy.zip')
        print("Done.")
    else:
        print("Error: dist_deploy folder not found.")
