from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import csv
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
import selenium.webdriver.support.expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys

chrome_options = Options()
chrome_options.add_argument("--ignore-certificate-errors")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
driver.get('https://badmintonportalen.no/NBF/Turnering/VisResultater/')  # change to your website

wait = WebDriverWait(driver, 10)

try:
    button = wait.until(EC.element_to_be_clickable((By.ID, "ButtonSearchSeasonPlan")))
    
    # Set the desired date
    date_input = wait.until(EC.presence_of_element_located((By.ID, "TextBoxSeasonPlanDate1")))
    date_input.clear()
    date_input.send_keys("12.05.2011")
    date_input.send_keys(Keys.RETURN)  # Press Enter to trigger the search
    
    button.click()
    print("Button clicked")
    time.sleep(1)

    # CSV writer setup
    csv_file = open('tournament_results.csv', 'w', newline='', encoding='utf-8')
    writer = csv.writer(csv_file)
    writer.writerow(['Tournament Name', 'Date', 'Team 1 Player 1', 'Team 1 Player 2', 'Team 2 Player 1', 'Team 2 Player 2', 'Result', 'Winner'])

    scraped_tournaments = []  # List to keep track of scraped tournaments

    def scrape_match_details(tournament_name, tournament_date, page_source):
        soup = BeautifulSoup(page_source, 'html.parser')
        matches = soup.find_all('tr')

        for match in matches:
            # Check if it's a mixed doubles game
            if match.find('td', class_='headrow'):
                section_title = match.find('td', colspan='4').text.strip()
                continue

            players = match.find_all('a')
            result = match.find('td', class_='result')

            # Skip matches without players or result
            if not players or not result:
                continue

            try:
                # Extract player names and result
                player_names = [player.text.strip() for player in players]
                result = result.text.strip()

                # Skip matches without enough player names
                if len(player_names) < 2:
                    continue

                # Extract winner
                if len(player_names) == 4:
                    winner = player_names[:2] if result.startswith('21/') else player_names[2:]
                else:
                    winner = player_names[:1] if result.startswith('21/') else player_names[1:]

                # Write data to CSV
                if len(player_names) == 4:
                    writer.writerow([tournament_name, tournament_date, player_names[0], player_names[1], player_names[2], player_names[3], result, ' '.join(winner)])
                else:
                    writer.writerow([tournament_name, tournament_date, '', player_names[0], '', player_names[1], result, ' '.join(winner)])

            except Exception as e:
                print(f"An exception occurred while processing match: {e}. Skipping the match.")
                continue
    # Loop through tournaments
    while True:
        try:
            # Find all tournament rows
            tournaments = driver.find_elements(By.XPATH, '//tr[contains(@class, "row")]')

            # If all tournaments have been scraped, exit the loop
            if len(scraped_tournaments) == len(tournaments):
                break

           # Find the next tournament to scrape
            tournament = None
            for t in tournaments:
                # Extract the tournament name from the row
                tournament_name = t.find_element(By.XPATH, './td[@class="title"]').text
                formatted_tournament_name = tournament_name.replace(':', '').strip()
                if any(name.strip() == formatted_tournament_name for name in scraped_tournaments):
                    continue
                tournament = t
                break


            if tournament is None:
                print("No more tournaments to scrape.")
                break

            # Click the tournament row
            tournament.click()

            # Wait for the element with partial link text "Vis alle kamper" to be clickable
            alle_kamper = WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, 'Vis alle kamper')))
            alle_kamper.click()

            # Get page HTML
            page_source = driver.page_source

            # Extract tournament name and date
            soup = BeautifulSoup(page_source, 'html.parser')
            tournament_info = soup.find('div', class_='selectedtournamentspan')
            tournament_name = tournament_info.h2.text.split(' ', 1)[1]
            tournament_date = tournament_info.h2.text.split(' ', 1)[0]

            # Scrape match details for the initial tab
            scrape_match_details(tournament_name, tournament_date, page_source)

            # Find the dropdown menu
            dropdown_menu = wait.until(EC.presence_of_element_located((By.XPATH, "//div[@id='DivSelectedTournament1']//select[@class='selectbox']")))

            # Get the dropdown element
            dropdown = Select(dropdown_menu)

            # Wait for the dropdown options to be loaded
            wait.until(EC.presence_of_all_elements_located((By.XPATH, "//div[@id='DivSelectedTournament1']//select[@class='selectbox']//option")))

            # Get the updated dropdown element after options are loaded
            dropdown = Select(driver.find_element(By.CLASS_NAME, "selectbox"))

            # Get the number of dropdown options
            num_options = len(dropdown.options)

            # Loop through dropdown options
            for i in range(num_options):
                try:
                    # Find the dropdown and select the option inside the loop each time
                    dropdown = Select(driver.find_element(By.CLASS_NAME, "selectbox"))
                    dropdown.select_by_index(i)

                    # Wait for the element with partial link text "Vis alle kamper" to be clickable
                    alle_kamper = WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, 'Vis alle kamper')))
                    alle_kamper.click()

                    # Get page HTML
                    page_source = driver.page_source

                    # Scrape match details for the current option
                    scrape_match_details(tournament_name, tournament_date, page_source)

                    # Find and click on tabs
                    tab_xpaths = ["//a[normalize-space()='Herresingle']",
                                  "//a[normalize-space()='Damesingle']",
                                  "//a[normalize-space()='Herredouble']",
                                  "//a[normalize-space()='Damedouble']",
                                  "//a[normalize-space()='Mixeddouble']"]

                    # Loop through tabs
                    for xpath in tab_xpaths:
                        try:
                            # Wait for the element with xpath to be clickable
                            tab = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
                            tab.click()

                            # Get page HTML
                            page_source = driver.page_source

                            # Scrape match details for the current tab and option
                            scrape_match_details(tournament_name, tournament_date, page_source)

                        except TimeoutException:
                            print(f"Timeout while waiting for tab with xpath: {xpath}")

                except TimeoutException:
                    print(f"Timeout while waiting for option: {i}")

            # Add the tournament name to the scraped_tournaments list
            scraped_tournaments.append(tournament_name)

            # Go back to the main page with the same date and season
            driver.get('https://badmintonportalen.no/NBF/Turnering/VisResultater/')  # change to your website
            time.sleep(0.5)
            # Set the desired date
            date_input = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.ID, "TextBoxSeasonPlanDate1")))
            date_input.clear()
            date_input.send_keys("12.05.2011")
            date_input.send_keys(Keys.RETURN)  # Press Enter to trigger the search
    
            button = wait.until(EC.element_to_be_clickable((By.ID, "ButtonSearchSeasonPlan")))
            button.click()
            time.sleep(0.5)

        except StaleElementReferenceException:
            print("StaleElementReferenceException occurred. Trying again...")

finally:
    csv_file.close()
