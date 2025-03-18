// Main function to calculate and save history for all fuel types
function calculateAllFuelTypesHistory() {
    calculateHistory("Fuel_Prices_1", "U95_History"); // Unleaded 95
    calculateHistory("Fuel_Prices_2", "U98_History"); // Unleaded 98
    calculateHistory("Fuel_Prices_3", "D_History"); // Diesel
    calculateHistory("Fuel_Prices_4", "HD_History"); // Heating Diesel
    calculateHistory("Fuel_Prices_5", "K_History"); // Kerosene
  }
  
  // Function to calculate history for a specific fuel type
  function calculateHistory(fuelSheetName, historySheetName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get sheets
    const fuelPricesSheet = sheet.getSheetByName(fuelSheetName);
    const historySheet = sheet.getSheetByName(historySheetName);
    
    // Get all data from Fuel_Prices sheet
    const data = fuelPricesSheet.getDataRange().getValues();
    
    // Define the cities we are interested in (hardcoded inside the function)
    const cities = ['ΠΑΦΟΣ', 'ΛΕΜΕΣΟΣ', 'ΛΑΡΝΑΚΑ', 'ΛΕΥΚΩΣΙΑ', 'ΑΜΜΟΧΩΣΤΟΣ'];
    
    // Prepare an object to store the price data for each city
    const cityData = {};
    
    cities.forEach(city => {
      cityData[city] = [];
    });
    
    // Loop through the data to group fuel prices by city
    for (let i = 1; i < data.length; i++) {
      const city = data[i][2]; // Column C for city
      const fuelPrice = data[i][5]; // Column F for Fuel Price
      
      // Only proceed if the city is in the list of cities we're tracking
      if (cityData[city] && !isNaN(fuelPrice)) {
        cityData[city].push(fuelPrice);
      }
    }
    
    // Calculate the average and standard deviation for each city
    const historyData = [];
    const currentTime = new Date();
    
    // For each city, calculate the average and standard deviation
    const results = cities.map(city => {
      const prices = cityData[city];
      if (prices.length > 0) {
        const avgPrice = calculateAverage(prices);
        const stdDevPrice = calculateStandardDeviation(prices, avgPrice);
        return [roundToThreeDecimals(avgPrice), roundToThreeDecimals(stdDevPrice)];
      } else {
        return [null, null]; // If no data, return null for both
      }
    });
  
    // Flatten the results and add the current timestamp
    const historyEntry = [currentTime, ...results.flat()];
    historyData.push(historyEntry);
    
    // Append the calculated data to the appropriate history sheet
    if (historyData.length > 0) {
      historySheet.getRange(historySheet.getLastRow() + 1, 1, historyData.length, historyData[0].length).setValues(historyData);
    }
  }
  
  // Function to calculate average
  function calculateAverage(prices) {
    if (prices.length === 0) return null; // If no prices, return null
    const sum = prices.reduce((acc, price) => acc + price, 0);
    return sum / prices.length;
  }
  
  // Function to calculate standard deviation
  function calculateStandardDeviation(prices, average) {
    if (prices.length === 0) return null; // If no prices, return null
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - average, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }
  
  // Function to round to 3 decimal places
  function roundToThreeDecimals(value) {
    if (value === null || value === undefined) {
      return null;
    }
    return Math.round(value * 1000) / 1000; // Round to 3 decimal places
  }
  