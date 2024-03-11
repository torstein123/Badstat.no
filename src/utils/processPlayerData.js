const processPlayerData = (playerName) => {
    const playerMatches = require('../cleaned_file.json'); // Adjust the path as necessary

    const filteredMatches = playerMatches.filter(match =>
        match['Team 1 Player 1'] === playerName || match['Team 1 Player 2'] === playerName ||
        match['Team 2 Player 1'] === playerName || match['Team 2 Player 2'] === playerName
    );

    let deciderWins = 0;
    let deciderMatches = 0;
    const comebackWinScores = [];
    let strongThirdSets = 0;

    console.log(`Processing data for: ${playerName}, Total filtered matches: ${filteredMatches.length}`);
    
    filteredMatches.forEach(match => {
        const sets = match.Result.split(',').map(set => set.split('/').map(Number));
        
        if (sets.length === 3) { // The match went to a deciding set
            console.log(`Deciding set match found:`, match); // Simplified log
            deciderMatches++;

            const playerWon = (match['Winner Player 1'] === playerName || match['Winner Player 2'] === playerName) &&
                              (sets[2][0] > sets[2][1] || sets[2][1] > sets[2][0]);

            if (playerWon) {
                deciderWins++;
                console.log(`Deciding Set Win: ${match.Result}`, match); // Log 2: Wins in deciding sets
            }

            // Your existing logic for "Comeback Win"
            const firstSetLoss = (match['Team 1 Player 2'] === playerName || match['Team 1 Player 1'] === playerName) ? 
                                    sets[0][1] - sets[0][0] : sets[0][0] - sets[0][1];
            const playerWonLastSet = (sets[2][0] > sets[2][1] && match['Winner Player 1'] === playerName) ||
                                      (sets[2][1] > sets[2][0] && match['Winner Player 2'] === playerName);
            if (firstSetLoss > 10 && playerWonLastSet) {
                comebackWinScores.push(match.Result);
            }

            // Logic to track "Sterk 3.sett" achievement
            if (playerWon) {
                strongThirdSets++;
            }
        }
    });

    const comebackWin = comebackWinScores.length > 0;
    const deciderWinRate = deciderMatches > 0 ? (deciderWins / deciderMatches) * 100 : 0; // Calculate win rate in deciding sets
    const strongThirdSetPercentage = deciderMatches > 0 ? parseFloat((strongThirdSets / deciderMatches * 100).toFixed(0)) : 0;

    // Number of games affected by "Tidenes comeback"
    const comebackGames = comebackWinScores.length;

    // Determine if the player has achieved "Decider Dominator"
    const deciderDominator = deciderWinRate > 60; // Check if win rate exceeds 70%

    return {
        gamesPlayed: filteredMatches.length,
        comebackWin,
        comebackWinScores,
        comebackGames,
        deciderWins,
        deciderMatches,
        deciderWinRate,
        deciderDominator, // Indicates if the player has achieved "Decider Dominator"
        strongThirdSetPercentage, // Percentage of strong third sets won
    };
};

export default processPlayerData;
