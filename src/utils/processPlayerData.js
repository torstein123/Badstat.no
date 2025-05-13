const processPlayerData = (playerName) => {
    const playerMatches = require('../cleaned_file.json'); // Adjust the path as necessary

    const filteredMatches = playerMatches.filter(match =>
        match['Team 1 Player 1'] === playerName || match['Team 1 Player 2'] === playerName ||
        match['Team 2 Player 1'] === playerName || match['Team 2 Player 2'] === playerName
    );

    // Initialize counters for each category
    let deciderWins = 0;
    let deciderMatches = 0;
    let singleDeciderWins = 0;
    let singleDeciderMatches = 0;
    let doubleDeciderWins = 0;
    let doubleDeciderMatches = 0;
    let mixDeciderWins = 0;
    let mixDeciderMatches = 0;

    const comebackWinScores = [];
    let strongThirdSets = 0;

    filteredMatches.forEach(match => {
        const sets = match.Result.split(',').map(set => set.split('/').map(Number));
        
        if (sets.length === 3) { // The match went to a deciding set
            deciderMatches++;

            // Determine match type
            const isSingles = match['Event']?.toLowerCase() === 'herresingle' || 
                            match['Event']?.toLowerCase() === 'damesingle';
            
            const isMixed = match['Event']?.toLowerCase() === 'mixeddouble';
            
            // Increment category-specific counters
            if (isSingles) {
                singleDeciderMatches++;
            } else if (isMixed) {
                mixDeciderMatches++;
            } else {
                doubleDeciderMatches++;
            }

            const playerWon = (match['Winner Player 1'] === playerName || match['Winner Player 2'] === playerName);

            if (playerWon) {
                deciderWins++;
                // Increment category-specific wins
                if (isSingles) {
                    singleDeciderWins++;
                } else if (isMixed) {
                    mixDeciderWins++;
                } else {
                    doubleDeciderWins++;
                }
            }

            // Existing comeback win logic
            const firstSetLoss = (match['Team 1 Player 2'] === playerName || match['Team 1 Player 1'] === playerName) ? 
                                    sets[0][1] - sets[0][0] : sets[0][0] - sets[0][1];
            const playerWonLastSet = (sets[2][0] > sets[2][1] && match['Winner Player 1'] === playerName) ||
                                      (sets[2][1] > sets[2][0] && match['Winner Player 2'] === playerName);
            if (firstSetLoss > 10 && playerWonLastSet) {
                comebackWinScores.push(match.Result);
            }

            if (playerWon) {
                strongThirdSets++;
            }
        }
    });

    // Calculate win rates for each category
    const deciderWinRate = deciderMatches > 0 ? (deciderWins / deciderMatches) * 100 : 0;
    const singleDeciderWinRate = singleDeciderMatches > 0 ? (singleDeciderWins / singleDeciderMatches) * 100 : 0;
    const doubleDeciderWinRate = doubleDeciderMatches > 0 ? (doubleDeciderWins / doubleDeciderMatches) * 100 : 0;
    const mixDeciderWinRate = mixDeciderMatches > 0 ? (mixDeciderWins / mixDeciderMatches) * 100 : 0;

    const comebackWin = comebackWinScores.length > 0;
    const strongThirdSetPercentage = deciderMatches > 0 ? parseFloat((strongThirdSets / deciderMatches * 100).toFixed(0)) : 0;
    const comebackGames = comebackWinScores.length;
    const deciderDominator = deciderWinRate > 60;

    return {
        gamesPlayed: filteredMatches.length,
        comebackWin,
        comebackWinScores,
        comebackGames,
        // Overall stats
        deciderWins,
        deciderMatches,
        deciderWinRate,
        // Singles stats
        singleDeciderWins,
        singleDeciderMatches,
        singleDeciderWinRate,
        // Doubles stats
        doubleDeciderWins,
        doubleDeciderMatches,
        doubleDeciderWinRate,
        // Mixed stats
        mixDeciderWins,
        mixDeciderMatches,
        mixDeciderWinRate,
        // Other achievements
        deciderDominator,
        strongThirdSetPercentage,
    };
};

export default processPlayerData;
