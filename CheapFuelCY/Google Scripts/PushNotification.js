function storeDailyLowestPrices() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var fuelSheets = [
      { name: "Fuel_Prices_1", type: "Unleaded95" },
      { name: "Fuel_Prices_2", type: "Unleaded98" },
      { name: "Fuel_Prices_3", type: "Diesel" },
      { name: "Fuel_Prices_4", type: "Heating Diesel" },
      { name: "Fuel_Prices_5", type: "Kerosene" }
    ];
    
    var dailySheet = sheet.getSheetByName("Daily_Cheapest_Prices");
    if (!dailySheet) {
      dailySheet = sheet.insertSheet("Daily_Cheapest_Prices");
      dailySheet.appendRow(["City", "Fuel Type", "Lowest Price", "Date Recorded"]);
    }
  
    var today = new Date();
    var todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
  
    var lowestPrices = {}; // Store lowest prices per city & fuel type
  
    // 🔹 Loop through each fuel type sheet
    fuelSheets.forEach(fuel => {
      var fuelSheet = sheet.getSheetByName(fuel.name);
      if (!fuelSheet) return;
  
      var fuelData = fuelSheet.getDataRange().getValues();
      var headers = fuelData[0];
      var cityIndex = headers.indexOf("City");
      var priceIndex = headers.indexOf("Fuel Price");
  
      for (var i = 1; i < fuelData.length; i++) {
        var city = fuelData[i][cityIndex];
        var price = parseFloat(fuelData[i][priceIndex]);
  
        if (!lowestPrices[city]) lowestPrices[city] = {};
        if (!lowestPrices[city][fuel.type] || price < lowestPrices[city][fuel.type]) {
          lowestPrices[city][fuel.type] = price;
        }
      }
    });
  
    // 🔹 Store today's lowest prices
    for (var city in lowestPrices) {
      for (var fuelType in lowestPrices[city]) {
        var newPrice = lowestPrices[city][fuelType];
        dailySheet.appendRow([city, fuelType, newPrice, todayStr]);
      }
    }
  }
  