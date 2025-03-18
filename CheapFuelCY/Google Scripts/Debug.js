function findCheapestFuelPrice() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Fuel_Prices_1');
    if (!sheet) {
      Logger.log("Error: Sheet 'Fuel_Prices_3' not found.");
      return;
    }
  
    var data = sheet.getDataRange().getValues(); // Get all data from the sheet
    var headerRow = data[0]; // Assuming the first row contains headers
    var fuelPriceIndex = headerRow.indexOf("Fuel Price");
  
    if (fuelPriceIndex === -1) {
      Logger.log("Error: 'Fuel Price' column not found.");
      return;
    }
  
    var minPrice = Infinity; // Start with a very high number
    var minRow = -1; // Store row number for debugging
  
    for (var i = 1; i < data.length; i++) { // Start from row 1 (skip header)
      var price = parseFloat(data[i][fuelPriceIndex]); // Convert to number
  
      if (!isNaN(price) && price < minPrice) {
        minPrice = price;
        minRow = i + 1; // Convert zero-based index to spreadsheet row number
      }
    }
  
    if (minPrice === Infinity) {
      Logger.log("No valid fuel prices found.");
    } else {
      Logger.log("Cheapest Fuel Price: " + minPrice + " found at row " + minRow);
    }
  }
  //DEBUG ID PART
  function DebugID() {
    Logger.log("Debugging Stored Correlation IDs...");
  
    // Retrieve stored CorrelationIDs
    var storedCorrelationIDs = JSON.parse(PropertiesService.getScriptProperties().getProperty("fuelCorrelationIDs") || "{}");
  
    if (Object.keys(storedCorrelationIDs).length === 0) {
      Logger.log("No Correlation IDs found! Run requestAllFuelTypes() first.");
      return;
    }
  
  
    //Check and print each Correlation ID
    var fuelTypes = {
      1: "Unleaded 95",
      2: "Unleaded 98",
      3: "Diesel",
      4: "Heating Diesel",
      5: "Kerosene"
    };
  
    Object.keys(fuelTypes).forEach(function(fuelType) {
      if (storedCorrelationIDs[fuelType]) {
        Logger.log(`${fuelTypes[fuelType]} (Fuel Type ${fuelType}): Correlation ID = ${storedCorrelationIDs[fuelType]}`);
      } else {
        Logger.log(`Missing Correlation ID for ${fuelTypes[fuelType]} (Fuel Type ${fuelType})`);
      }
    });
  
    Logger.log("Debugging complete!");
  }
  
  