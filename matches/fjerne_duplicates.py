import pandas as pd

# Read the CSV file
data = pd.read_csv("matches/all_matches_combined.csv", encoding='ISO-8859-1')

# Remove duplicates
data_no_duplicates = data.drop_duplicates()

# Save the cleaned data back to a CSV
data_no_duplicates.to_csv("cleaned_file.csv", index=False, encoding='ISO-8859-1')
