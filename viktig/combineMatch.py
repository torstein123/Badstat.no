import csv
import os

input_folder = r'C:\Users\Torstein\Documents\rankinglist-master (2)\rankinglist-master\badmintonstats\turneringer'
output_file = 'all_matches_combined.csv'

all_files = [f for f in os.listdir(input_folder) if f.endswith('.csv')]

# Create a list to store rows
all_rows = []

# Go through each file and read the content
for file in all_files:
    with open(os.path.join(input_folder, file), mode='r', encoding='ISO-8859-1') as infile:
        reader = csv.reader(infile)
        if not all_rows:  # if all_rows is empty, i.e., this is the first file being read
            header = next(reader)  # read the header and skip to the next row
        else:
            next(reader)  # skip header row for subsequent files
        for row in reader:
            row = ['NaN' if value == '' else value for value in row]  # Replace empty strings with 'NaN'
            all_rows.append(row)

# Write the combined content to the output file
with open(output_file, mode='w', newline='', encoding='ISO-8859-1') as outfile:
    writer = csv.writer(outfile)
    writer.writerow(header)  # Write header
    writer.writerows(all_rows)  # Write rows
