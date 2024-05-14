from fpdf import FPDF
import pandas as pd
from datetime import datetime

def load_json(filepath):
    return pd.read_json(filepath)

def calculate_score_difference(result):
    """Calculate the absolute score difference and number of sets."""
    games = result.split(',')
    # Changed to absolute difference to determine closest matches properly
    score_difference = sum(abs(int(score.split('/')[0]) - int(score.split('/')[1])) for score in games)
    return score_difference, len(games)

def get_best_two_set_match(matches):
    """Retrieve the best two-set match where the player won based on the highest score difference."""
    matches['Score Difference'], matches['Sets Count'] = zip(*matches['Result'].apply(calculate_score_difference))
    two_set_wins = matches[(matches['Sets Count'] == 2) & (matches['Is Win'] == True)]
    return two_set_wins.loc[two_set_wins['Score Difference'].idxmax()] if not two_set_wins.empty else None


def get_closest_three_set_match(matches):
    matches['Score Difference'], matches['Sets Count'] = zip(*matches['Result'].apply(calculate_score_difference))
    three_set_matches = matches[matches['Sets Count'] == 3]
    closest_match = three_set_matches.loc[three_set_matches['Score Difference'].idxmin()] if not three_set_matches.empty else None
    print(f"Closest Three Set Match: {closest_match}")  # Debugging output
    return closest_match


def parse_matches(matches, player_name, season):
    print("Player Name:", player_name)
    filtered_matches = matches[
        (matches['Season'] == season) & (
            (matches['Team 1 Player 1'] == player_name) |
            (matches['Team 1 Player 2'] == player_name) |
            (matches['Team 2 Player 1'] == player_name) |
            (matches['Team 2 Player 2'] == player_name)
        )
    ]

    results = []
    for _, match in filtered_matches.iterrows():
        if player_name in (match['Team 1 Player 1'], match['Team 1 Player 2']):
            team_players = [match['Team 1 Player 1'], match['Team 1 Player 2']]
            opponent_players = [match['Team 2 Player 1'], match['Team 2 Player 2']]
        else:
            team_players = [match['Team 2 Player 1'], match['Team 2 Player 2']]
            opponent_players = [match['Team 1 Player 1'], match['Team 1 Player 2']]

        scores = match['Result'].split(',')
        player_scores = [int(score.split('/')[0]) if player_name in team_players else int(score.split('/')[1]) for score in scores]
        opponent_scores = [int(score.split('/')[1]) if player_name in team_players else int(score.split('/')[0]) for score in scores]

        player_score_total = sum(player_scores)
        opponent_score_total = sum(opponent_scores)
        score_diff = player_score_total - opponent_score_total
        is_win = (player_name == match['Winner Player 1']) or (player_name == match['Winner Player 2'])

        # Filter out the player's name and NaN from the opponents
        opponents = [op for op in opponent_players if not pd.isna(op) and op != player_name]

        results.append({
            'Date': match['Date'],
            'Tournament Name': match['Tournament Name'],
            'Result': match['Result'],
            'Opponents': " & ".join(opponents),
            'Is Win': is_win,
            'Score Difference': score_diff
        })

    return pd.DataFrame(results)






def get_nemesis(matches):
    # Filter matches where the player lost
    lost_matches = matches[matches['Is Win'] == False]

    # Group lost matches by opponent
    opponent_groups = lost_matches['Opponents'].value_counts()

    if not opponent_groups.empty:
        # Select the opponent with the highest count of losses
        nemesis = opponent_groups.idxmax()
        # Retrieve all matches against the nemesis
        nemesis_matches = matches[matches['Opponents'].str.contains(nemesis, na=False)]
        return nemesis, nemesis_matches
    else:
        return "No matches", pd.DataFrame()  # Return an empty DataFrame if there is no nemesis


def get_match_stats(data, player_name, season):
    print(data.head())  # Initial data check
    matches = parse_matches(data, player_name, season)
    print(matches.head())  # Check parsed matches

    if not matches.empty:
        nemesis, nemesis_matches = get_nemesis(matches)  # Correctly unpack both values
        best_two_set_match = get_best_two_set_match(matches)
        closest_three_set_match = get_closest_three_set_match(matches)

        return {
            "For lett?": best_two_set_match if best_two_set_match is not None else "No matches",
            "Nervepirrende?": closest_three_set_match if closest_three_set_match is not None else "No matches",
            "Nemesis": nemesis,
            "Nemesis Details": nemesis_matches,
            "Total Wins": matches['Is Win'].sum()
        }
    return {
        "For lett?": "No matches",
        "Nervepirrende?": "No matches",
        "Nemesis": "No matches",
        "Nemesis Details": pd.DataFrame(),
        "Total Wins": 0
    }



class PDF(FPDF):
    def header(self):
        # Logo
        self.image('C:/Users/Torstein/Documents/rankinglist-master (2)/rankinglist-master/badmintonstats/src/img/Badstat.png', 10, 8, 33)
        # Set font for the title, move to the right to center the title after the logo
        self.set_font('Arial', 'B', 16)
        self.cell(80)  # Move to the right to make space for the title next to the logo
        self.ln(20)  # Line break to move below the header


    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def format_date(date):
    """Formats a pandas Timestamp object to a string in the format '%d.%m.%Y'."""
    if pd.notna(date):
        return date.strftime('%d.%m.%Y')
    return "N/A"

def create_pdf(player_name, match_stats):
    pdf = PDF()
    pdf.add_page()

    # Title
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, f"Tilbakeblikk for {player_name}", 0, 1, 'C')
    pdf.ln(10)

    # Performance Summary Section
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Sesongen 2023/2024", 0, 1, 'C')
    pdf.ln(5)

   # Matches sections
    sections = ['For lett?', 'Nervepirrende?']
    for section in sections:
        match_data = match_stats.get(section)
        if match_data is not None and isinstance(match_data, pd.Series):
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, section, 0, 1)
            pdf.set_font("Arial", "", 12)
            # Ensure data is not NaN; replace NaN with "Not Available"
            tournament_name = match_data['Tournament Name'] if pd.notna(match_data['Tournament Name']) else ""
            date = format_date(match_data['Date']) if pd.notna(match_data['Date']) else ""
            result = match_data['Result'] if pd.notna(match_data['Result']) else ""
            opponents = match_data['Opponents'] if pd.notna(match_data['Opponents']) else ""
            score_diff = match_data['Score Difference'] if pd.notna(match_data['Score Difference']) else ""
            outcome = "Won" if match_data['Is Win'] else "Lost"
            pdf.multi_cell(0, 10, f"Turnering: {tournament_name}")
            pdf.multi_cell(0, 10, f"Poeng: {result}")
            pdf.multi_cell(0, 10, f"Mostandere: {opponents}")
            pdf.ln(5)
        else:
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, f"No data for {section}", 0, 1)
            pdf.ln(5)

    # Nemesis Section
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Nemesis", 0, 1)
    pdf.set_font("Arial", "", 12)
    if 'Nemesis' in match_stats and match_stats['Nemesis'] != "No matches":
        nemesis_name = " & ".join([name for name in match_stats['Nemesis'].split(' & ') if name != 'NaN'])
        pdf.multi_cell(0, 10, f"{nemesis_name} har for øyeblikket overtaket på deg. Tren hardt, hevnen er søt...")
        pdf.ln(5)

        # Nemesis Details Table
    if 'Nemesis Details' in match_stats and isinstance(match_stats['Nemesis Details'], pd.DataFrame):
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Nylige kamper mot din Nemesis", 0, 1)
        col_widths = [20, 60, 30, 40, 30]
        pdf.cell(col_widths[0], 10, "Dato", 1)
        pdf.cell(col_widths[1], 10, "Turnering", 1)
        pdf.cell(col_widths[2], 10, "Resultat", 1)
        pdf.cell(col_widths[3], 10, "Mostander", 1)
        pdf.cell(col_widths[4], 10, "Utfall", 1)
        pdf.ln()

        for _, row in match_stats['Nemesis Details'].iterrows():
            date = format_date(row['Date']) if pd.notna(row['Date']) else "Not Available"
            tournament = row['Tournament Name'] if pd.notna(row['Tournament Name']) else "Not Available"
            result = row['Result'] if pd.notna(row['Result']) else "Not Available"
            # Explicitly remove NaN values and join with " & "
            opponents_list = [op for op in str(row['Opponents']).split(' & ') if pd.notna(op) and op != 'NaN']
            opponents = " & ".join(opponents_list)
            outcome = "Won" if row['Is Win'] else "Lost"
            pdf.set_font("Arial", "", 10)
            pdf.cell(col_widths[0], 10, date, 1)
            pdf.cell(col_widths[1], 10, tournament, 1)
            pdf.cell(col_widths[2], 10, result, 1)
            pdf.cell(col_widths[3], 10, opponents, 1)
            pdf.cell(col_widths[4], 10, outcome, 1)
            pdf.ln()


    pdf.output(f"{player_name.replace(' ', '_').lower()}_diploma.pdf")
    print("PDF generated successfully.")






if __name__ == "__main__":
    data = load_json(r'C:\Users\Torstein\Documents\rankinglist-master (2)\rankinglist-master\badmintonstats\src\cleaned_file.json')
    player_name = input("Enter the player name: ")
    season = "2023/2024"  # Specify the desired season here
    match_stats = get_match_stats(data, player_name, season)
    create_pdf(player_name, match_stats)
    print(f"Diploma PDF generated for {player_name} with detailed match statistics.")
