import shutil
import os

src = r"c:\Users\Talha Kağan Tosun\studyium\studyium.com\out"
dst = r"c:\Users\Talha Kağan Tosun\studyium\studyium.com\studyium_deployment"

print("Zipping...")
shutil.make_archive(dst, 'zip', src)
print("Done.")
