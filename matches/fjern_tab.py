import csv

def fix_csv(input_filename, output_filename):
    with open(input_filename, 'r', newline='', encoding='iso-8859-1') as infile, open(output_filename, 'w', newline='', encoding='iso-8859-1') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames
        
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for row in reader:
            if row["Tab"]:
                if row["Team 1 Player 2"]:
                    # This is a doubles match
                    row["Winner Player 2"] = row["Winner Player 1"]
                    row["Winner Player 1"] = row["Result"]
                    row["Result"] = row["Team 2 Player 2"]
                    row["Team 2 Player 2"] = row["Team 2 Player 1"]
                    row["Team 2 Player 1"] = row["Team 1 Player 2"]
                    row["Team 1 Player 2"] = row["Team 1 Player 1"]
                    row["Team 1 Player 1"] = row["Tab"]
                else:
                    # This is a singles match
                    row["Winner Player 2"] = ""
                    row["Winner Player 1"] = row["Result"]
                    row["Result"] = row["Team 2 Player 2"]
                    row["Team 2 Player 2"] = row["Team 2 Player 1"]
                    row["Team 2 Player 1"] = row["Tab"]
                    row["Tab"] = ""
            writer.writerow(row)

input_filename = "C:\\Users\\Torstein\\Documents\\rankinglist-master (2)\\rankinglist-master\\badmintonstats\\matches\\all_matches_combined.csv"
output_filename = "C:\\Users\\Torstein\\Documents\\rankinglist-master (2)\\rankinglist-master\\badmintonstats\\matches\\all_matches_combined_fixed.csv"

fix_csv(input_filename, output_filename)
