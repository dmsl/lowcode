function convertCoordinates() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Loop through all fuel price sheets (1-5)
    for (var i = 1; i <= 5; i++) {
      var sheet = ss.getSheetByName("Fuel_Prices_" + i);
      if (!sheet) continue;
      
      var data = sheet.getDataRange().getValues();
      var updatedData = [];
      
      // Iterate over each row (skip header)
      for (var r = 1; r < data.length; r++) {
        var rawCoord = data[r][7]; // Assuming coordinates are in the 8th column (index 7)
        
        if (rawCoord && isDMSFormat(rawCoord)) {
          var convertedCoord = dmsToDecimal(rawCoord);
          data[r][7] = convertedCoord; // Replace with converted value
        }
        
        updatedData.push(data[r]);
      }
      
      // Write back updated data
      if (updatedData.length > 0) {
        sheet.getRange(2, 1, updatedData.length, updatedData[0].length).setValues(updatedData);
      }
    }
    
    Logger.log("Coordinate conversion completed.");
  }
  
  // Check if the coordinate is in Degrees, Minutes, Seconds (DMS) format
  function isDMSFormat(coord) {
    return /°|′|'|″/.test(coord);
  }
  
  // Convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees (DD)
  function dmsToDecimal(dms) {
    var regex = /(\d+)°(\d+)'([\d.]+)"?([NSEW]),\s*(\d+)°(\d+)'([\d.]+)"?([NSEW])/;
    var match = dms.match(regex);
  
    if (!match) return dms; // If format is incorrect, return original
  
    var lat = convertPart(match[1], match[2], match[3], match[4]);
    var lon = convertPart(match[5], match[6], match[7], match[8]);
  
    return lat + "," + lon;
  }
  
  // Convert DMS parts into Decimal Degrees
  function convertPart(degrees, minutes, seconds, direction) {
    var decimal = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;
    if (direction === "S" || direction === "W") decimal *= -1;
    return decimal.toFixed(6); // Keep 6 decimal places
  }
  