import pandas as pd
import os
import glob
import re

# File path
path = r"C:\Users\Torstein\Documents\rankinglist-master (2)\rankinglist-master\badmintonstats\rankinglister\DS"

all_files = glob.glob(os.path.join(path, "*.csv"))

# Empty DataFrame which we will add to
final_df = pd.DataFrame()
print("All files:", all_files)
for year in range(2013, 2024):  # Adjusted the range to 2024 to include 2023
    yearly_files = [file for file in all_files if str(year) in file]
    print(f"Processing year: {year}")
    print(f"Files for {year}: {yearly_files}")


    # Empty DataFrame for the current year
    yearly_df = pd.DataFrame()

    for file in yearly_files:
        df = pd.read_csv(file)
        df['Klubb'] = df['Navn'].str.extract(r',\s(.*?)(?=,|$)')  # Extract the club from the 'Navn' column
        df['Navn'] = df['Navn'].str.extract(r'^(.*?),')  # Extract the name from the 'Navn' column
        print(f'Processing file: {os.path.basename(file)}')  # Debug line

        if not yearly_df.empty:
            yearly_df = pd.concat([yearly_df, df])
        else:
            yearly_df = df

    # Group by Spiller-Id and aggregate the points and clubs
    yearly_df = yearly_df.groupby(['Spiller-Id', 'Navn']).agg({'Klubb': '|'.join, 'Poeng': 'sum'}).reset_index()

    # Rename the columns to the year
    yearly_df = yearly_df.rename(columns={'Poeng': str(year)})

    # Drop the 'Klubb' column from both DataFrames before merging
    yearly_df.drop('Klubb', axis=1, inplace=True, errors='ignore')
    final_df.drop('Klubb', axis=1, inplace=True, errors='ignore')

    # Merge this yearly data into the final dataframe
    if not final_df.empty:
        final_df = pd.merge(final_df, yearly_df, on=['Spiller-Id', 'Navn'], how='outer')
    else:
        final_df = yearly_df

# Replace NaN with 0
final_df.fillna(0, inplace=True)

# Reset the index
final_df.reset_index(drop=True, inplace=True)

# Reorder the columns
columns = ['Spiller-Id', 'Navn'] + [str(year) for year in range(2013, 2024)]

# Select the final columns
final_df = final_df[columns]

# Save the final DataFrame to a new CSV file
final_df.to_csv(os.path.join(path, "combined_rankingsDS.csv"), index=False)
