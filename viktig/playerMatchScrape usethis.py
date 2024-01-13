from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import csv
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
import re
import os


chrome_options = Options()
chrome_options.add_argument("--ignore-certificate-errors")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
driver.get('https://badmintonportalen.no/NBF/Turnering/VisResultater/')  # Change to your website
driver.maximize_window()
driver.implicitly_wait(10)
wait = WebDriverWait(driver, 10)

print("Current Working Directory: ", os.getcwd())
scraped_tournies = r'C:\Users\Torstein\Documents\rankinglist-master (2)\rankinglist-master\badmintonstats\viktig\scraped_tournaments.csv'

# scraped_tournies = 'scraped_tournaments'
try:
    with open(scraped_tournies, 'r', encoding='utf-8') as f:
        scraped_tournaments = [line.strip() for line in f.readlines()]
except FileNotFoundError:
    scraped_tournaments = []



def apply_filters():
    season_dropdown_menu = wait.until(EC.presence_of_element_located((By.ID, "DropDownListSeasonPlanSeason")))
    season_dropdown = Select(season_dropdown_menu)
    season_dropdown.select_by_value(current_season['value'])
    time.sleep(1)

    date_input = wait.until(EC.presence_of_element_located((By.ID, "TextBoxSeasonPlanDate1")))
    date_input.clear()
    date_input.send_keys("12.05.2011")
    date_input.send_keys(Keys.RETURN)
    time.sleep(1)

def scrape():
    tournaments = driver.find_elements(By.XPATH, '//tr[contains(@class, "row")]')
    for i in range(len(tournaments)):
        try:
            tournaments = driver.find_elements(By.XPATH, '//tr[contains(@class, "row")]')
            tournament = tournaments[i]
            try:
                tournament_name = tournament.find_element(By.XPATH, './td[@class="title"]').text
                formatted_tournament_name = tournament_name.replace(':', '').strip()
            except NoSuchElementException:
                continue    

            unique_tournament_identifier = f"{formatted_tournament_name} - {current_season['text']}"
            if any(name.strip() == unique_tournament_identifier for name in scraped_tournaments):
                continue  # skip if this tournament for this season has already been scraped
            # aaaaa sleep
            tournament.click()
            print('SCRAPING ----> ', tournament_name)
            time.sleep(2)
            scrape_tournament_details(formatted_tournament_name)
            driver.get('https://badmintonportalen.no/NBF/Turnering/VisResultater/')
            apply_filters()
        except Exception as e:
            print('Exception;', e)
            continue



def scrape_tournament_details(formatted_tournament_name):
    sanitized_name = re.sub(r'[<>:"/\\|?*]', '_', formatted_tournament_name)
    unique_file_name = f"{sanitized_name}_{current_season['text'].replace('/', '-')}.csv"  # Appended the season to the filename
    
    # Open file once here for writing the headers
    with open(unique_file_name, 'w', newline='', encoding='utf-8') as csv_file:
        writer = csv.writer(csv_file)
        # Additional Columns for Individual Winners
        writer.writerow(['Season', 'Tournament Name', 'Date', 'Tournament Class','Match', 'Tab', 'Team 1 Player 1', 'Team 1 Player 2', 'Team 2 Player 1', 'Team 2 Player 2', 'Result', 'Winner Player 1', 'Winner Player 2'])

    # Correcting the nested function definition and writer issues here
    time.sleep(2)
    page_source = driver.page_source
    soup = BeautifulSoup(page_source, 'html.parser')
    tournament_info = soup.find('div', class_='selectedtournamentspan')
    try:
         tournament_name = tournament_info.h2.text.split(' ', 1)[1]
         
    except:
        tournament_name = ''     
    tournament_date = tournament_info.h2.text.split(' ', 1)[0]    
    
    try:
        optionss = driver.find_elements(By.XPATH, "//select[@onchange='return SelectTournamentClass1(this.value);']/option")
        optionss_dec = {}
        options_value_list = []
        for i in optionss:
            optionss_dec = {
                'value': i.get_attribute('value'),
                'name': i.text
            }
            options_value_list.append(optionss_dec)

    except (NoSuchElementException, TimeoutException, StaleElementReferenceException):
        print(f"No results found for {formatted_tournament_name}. Skipping...")
        scraped_tournaments.append(formatted_tournament_name)  # Add to scraped tournaments list
        driver.get('https://badmintonportalen.no/NBF/Turnering/VisResultater/')  # navigate back
        apply_filters()  # reapply the filters
        return
    url = driver.current_url
    for i in options_value_list:
        try:
            time.sleep(1)
            url = url.split('#')[0]+'#'+i['value']
            driver.get(url)
            tournament_class = i['name']
            time.sleep(1)
            optionss = driver.find_elements(By.XPATH, "//select[@onchange='return SelectTournamentClass1(this.value);']/option")
        except Exception as e:
            print('Exception; ', e)
            continue    
        try:
            WebDriverWait(driver, 7).until(
            EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, 'Vis alle kamper')))
            driver.find_elements(By.XPATH, "//a[text()='Vis alle kamper']")[0].click()
            time.sleep(2)
            page_source = driver.page_source
            # scrape_match_details(unique_file_name , tournament_name, tournament_date, page_source, tournament_class,match)
        except TimeoutException:
            print(f"No 'Alle kamper' button found for dropdown index {i}. Moving on to the next dropdown...")
            continue
        
        tab_xpaths = [
            "//a[normalize-space()='Herresingle']",
                      "//a[normalize-space()='Damesingle']",
                      "//a[normalize-space()='Herredouble']",
                      "//a[normalize-space()='Damedouble']",
                      "//a[normalize-space()='Mixeddouble']",]
                        # "//a[normalize-space()='''''']"]

        for xpath in tab_xpaths:
            try:
        
                tab = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, xpath)))
                tab.click()
                time.sleep(2)               
                page_source = driver.page_source
                match_name = xpath.split("='")[-1].split("']")[0]
                scrape_match_details(unique_file_name , tournament_name, tournament_date, page_source, tournament_class,match_name)
            except (NoSuchElementException, TimeoutException, StaleElementReferenceException) as e:
                # print('Exeption in tabs; ',e)

                continue

    with open(scraped_tournies, 'a', encoding='utf-8') as f:
        unique_tournament_identifier = f"{formatted_tournament_name} - {current_season['text']}"
        scraped_tournaments.append(unique_tournament_identifier)
        f.write(f"{unique_tournament_identifier}\n")





def scrape_match_details(file_name, tournament_name, tournament_date, page_source, tournament_class,match_name):
    try:
        time.sleep(1)
        with open(file_name, 'a', newline='', encoding='utf-8') as csv_file:  # Use the file_name with the season appended
            writer = csv.writer(csv_file)

            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Get all tables with class 'matchlist'
            for table in soup.find_all('table', class_='matchlist'):
                # Loop through each row in the table
                for match in table.find_all('tr'):
                    
                    # Check if the row has class 'headrow' and skip it
                    if 'headrow' in match.get('class', []):
                        continue  # skip header rows
                    
                    # Get all td elements with class 'player'
                    players_td = match.find_all('td', class_='player')
                    
                    # Check if there are at least 2 player TDs
                    if len(players_td) < 2:
                        print(f"Skipping row with less than 2 player TDs. Row: {match}")
                        continue
                    
                    # Determine the winner and loser td
                    winner_td, loser_td = (players_td[0], players_td[1]) if 'winner' in players_td[0].get('class', []) else (players_td[1], players_td[0])
                    
                    # Get the text content of all anchor tags within the winner and loser tds
                    winner_players = [a.get_text(strip=True) for a in winner_td.find_all('a')]
                    loser_players = [a.get_text(strip=True) for a in loser_td.find_all('a')]
                    
                    # Find the result td and get its text content
                    result_td = match.find('td', class_='result')
                    if not result_td:
                        print(f"Skipping row with no result TD. Row: {match}")
                        continue

                    result = result_td.get_text(strip=True)
                    
                    # Skip games with 'W.O.'
                    if 'W.O.' in result:
                        continue

                    try:
                        if len(winner_players) == 2 and len(loser_players) == 2:  # Doubles
                            writer.writerow([current_season['text'], tournament_name, tournament_date, tournament_class,match_name, winner_players[0], winner_players[1], loser_players[0], loser_players[1], result, winner_players[0], winner_players[1]])
                        elif len(winner_players) == 1 and len(loser_players) == 1:  # Singles
                            writer.writerow([current_season['text'], tournament_name, tournament_date, tournament_class,match_name, '', winner_players[0], '', loser_players[0], result, winner_players[0], ''])
                        else:
                            print(f"Skipping row with unexpected number of players. Winner Players: {winner_players}, Loser Players: {loser_players}")
                    except Exception as e:  # Catch any other unexpected values and skip
                        print(f"Error writing row. Error: {str(e)}")
    except Exception as e:
        print('Exception in match details; ', e)
season_dropdown_menu = wait.until(EC.presence_of_element_located((By.ID, "DropDownListSeasonPlanSeason")))
season_dropdown = Select(season_dropdown_menu)
seasons = [{'value': option.get_attribute('value'), 'text': option.text} for option in season_dropdown.options]

try:
    for season in seasons:
        current_season = season
        apply_filters()
        scrape()
finally:
    driver.quit()
