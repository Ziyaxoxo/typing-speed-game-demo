import os
import sys

dir_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, dir_path)

import generate_deliverables

pdf_path = os.path.join(dir_path, "SRS_Implementation_Summary.pdf")
zip_path = os.path.join(dir_path, "typing-speed-game.zip")

print("Generating PDF...")
generate_deliverables.build_pdf(pdf_path)

print("Generating ZIP...")
generate_deliverables.build_zip(dir_path, zip_path)

print("Check PDF exists:", os.path.exists(pdf_path), os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0)
print("Check ZIP exists:", os.path.exists(zip_path), os.path.getsize(zip_path) if os.path.exists(zip_path) else 0)
