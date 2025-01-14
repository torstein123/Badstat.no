import pandas as pd
import os
import glob

# File path
path = r"C:\Users\Torstein\Documents\rankinglist-master (2)\rankinglist-master\badmintonstats\rankinglister\DS"

all_files = glob.glob(os.path.join(path, "*.csv"))

# Empty DataFrame which we will add to
final_df = pd.DataFrame()

# Track club information per player per year
club_info = {}

for year in range(2013, 2025):
    yearly_files = [file for file in all_files if str(year) in file]

    # Empty DataFrame for the current year
    yearly_df = pd.DataFrame()

    for file in yearly_files:
        df = pd.read_csv(file)
        split_names = df['Navn'].str.split(',', n=1, expand=True)
        df['Navn'] = split_names[0].str.strip()
        df['Klubb'] = split_names[1].str.strip() if split_names.shape[1] > 1 else ''

        # Track club for "Current Club" determination
        for index, row in df.iterrows():
            spiller_id = row['Spiller-Id']
            club = row['Klubb']
            if spiller_id not in club_info:
                club_info[spiller_id] = {'clubs': set(), 'current_club': club}
            club_info[spiller_id]['clubs'].add(club)
            # Assuming the last processed file/year has the current club
            club_info[spiller_id]['current_club'] = club

        if not yearly_df.empty:
            yearly_df = pd.concat([yearly_df, df])
        else:
            yearly_df = df

    yearly_df.drop(columns=['Klubb'], inplace=True)  # Remove 'Klubb' column before merge
    yearly_df = yearly_df.groupby(['Spiller-Id', 'Navn']).agg({'Poeng': 'sum'}).reset_index()
    yearly_df = yearly_df.rename(columns={'Poeng': str(year)})

    if not final_df.empty:
        final_df = pd.merge(final_df, yearly_df, on=['Spiller-Id', 'Navn'], how='outer')
    else:
        final_df = yearly_df

# Add "All Clubs" and "Current Club" columns
final_df['All Clubs'] = final_df['Spiller-Id'].apply(lambda x: '|'.join(club_info[x]['clubs']))
final_df['Current Club'] = final_df['Spiller-Id'].apply(lambda x: club_info[x]['current_club'])

# Replace NaN with 0 in point columns
point_columns = [str(year) for year in range(2013, 2025)]
final_df[point_columns] = final_df[point_columns].fillna(0)

# Reset the index
final_df.reset_index(drop=True, inplace=True)

# Reorder the columns to include 'Spiller-Id', 'Navn', 'All Clubs', 'Current Club', and the years
columns = ['Spiller-Id', 'Navn', 'All Clubs', 'Current Club'] + point_columns

# Select the final columns
final_df = final_df[columns]

# Save the final DataFrame to a new CSV file
final_df.to_csv(os.path.join(path, "combined_rankingsDS.csv"), index=False)
