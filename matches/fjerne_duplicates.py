import pandas as pd
file_path = r'C:\Users\Torstein\Documents\rankinglist-master (2)\rankinglist-master\badmintonstats\matches\all_matches_combined_fixed.csv'
# Read the CSV file
data = pd.read_csv(file_path, encoding='ISO-8859-1')


# Remove duplicates
data_no_duplicates = data.drop_duplicates()

# Save the cleaned data back to a CSV
data_no_duplicates.to_csv("cleaned_file.csv", index=False, encoding='ISO-8859-1')
