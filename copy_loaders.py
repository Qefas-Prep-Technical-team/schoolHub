import os
import shutil

admin_dir = r"c:\Users\HP\Documents\GitHub\Qefas Project\schoolHub\frontend\src\app\dashboard\admin"
src_loading = os.path.join(admin_dir, "loading.tsx")

if not os.path.exists(src_loading):
    print("Source loading.tsx not found")
    exit(1)

for item in os.listdir(admin_dir):
    item_path = os.path.join(admin_dir, item)
    if os.path.isdir(item_path):
        page_path = os.path.join(item_path, "page.tsx")
        if os.path.exists(page_path):
            dest_loading = os.path.join(item_path, "loading.tsx")
            shutil.copy2(src_loading, dest_loading)
            print(f"Copied to {dest_loading}")

os.remove(src_loading)
print("Removed original loading.tsx")
