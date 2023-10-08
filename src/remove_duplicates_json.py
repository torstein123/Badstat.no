
import json

def remove_duplicates_from_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    # Ensure the data is a list, if not, return without modification
    if not isinstance(data, list):
        print("The JSON file does not contain a list. Exiting without changes.")
        return

    unique_matches = {}
    for record in data:
        # Create a tuple based on the fields which define uniqueness of a match
        match_key = (
            record["Season"],
            record["Tournament Name"],
            record["Date"],
            record["Team 1 Player 1"],
            record["Team 1 Player 2"],
            record["Team 2 Player 1"],
            record["Team 2 Player 2"]
        )
        if match_key not in unique_matches:
            unique_matches[match_key] = record

    unique_data = list(unique_matches.values())

    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(unique_data, file, indent=4, ensure_ascii=False)


    print(f"Removed {len(data) - len(unique_data)} duplicates from {file_path}")

# Call the function
file_path = "C:/Users/Torstein/Documents/rankinglist-master (2)/rankinglist-master/badmintonstats/src/cleaned_file.json"
remove_duplicates_from_file(file_path)
