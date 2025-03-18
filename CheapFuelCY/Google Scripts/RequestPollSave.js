//First scheduled function. Will call the sendRequest function five times so that the postman protocol can prepare the data for us to pull. The unique IDs for this data will be stored in the enviroment.
function requestAllFuelTypes() {
  var fuelTypes = [1, 2, 3, 4, 5]; // Fuel types (Unleaded95 → Kerosene)
  var correlationIDs = {}; // Store CorrelationIDs
  Logger.log("Requesting Correlation IDs for all fuel types...");
  for (var i = 0; i < fuelTypes.length; i++) {
    var fuelType = fuelTypes[i];
    
    try {
      var correlationID = sendSubmissionRequest(fuelType); // Call API
      
      if (correlationID) {
        correlationIDs[fuelType] = correlationID;
        Logger.log("Stored Correlation ID for Fuel Type " + fuelType + ": " + correlationID);
      } else {
        Logger.log("Failed to retrieve Correlation ID for Fuel Type " + fuelType);
      }
    } catch (error) {
      Logger.log("Error requesting Fuel Type " + fuelType + ": " + error.message);
    }
    Utilities.sleep(2000); // Prevent API spam by adding a delay
  }
  // Store all correlation IDs in script properties
  PropertiesService.getScriptProperties().setProperty("fuelCorrelationIDs", JSON.stringify(correlationIDs));
  
  // Verify stored Correlation IDs
  var storedCorrelationIDs = JSON.parse(PropertiesService.getScriptProperties().getProperty("fuelCorrelationIDs") || "{}");

  Logger.log("Verifying stored Correlation IDs...");
  fuelTypes.forEach(fuelType => {
    if (storedCorrelationIDs[fuelType]) {
      Logger.log("Verified: Fuel Type " + fuelType + " -> Correlation ID: " + storedCorrelationIDs[fuelType]);
    } else {
      Logger.log("Missing Correlation ID for Fuel Type " + fuelType + ". Check request logs.");
    }
  });

  Logger.log("All fuel types requested. Ready for polling.");
}




function sendSubmissionRequest(fuelType) {
  var url = "https://cge.cyprus.gov.cy/gg/submission";
  var xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
  <GovTalkMessage xmlns="http://www.govtalk.gov.uk/CM/envelope">
    <EnvelopeVersion>2.0</EnvelopeVersion>
    <Header>
      <MessageDetails>
        <Class>PBL_MCIT_Petrol_PricesMob</Class>
        <Qualifier>request</Qualifier>
        <Function>submit</Function>
        <CorrelationID/>
      </MessageDetails>
      <SenderDetails>
        <IDAuthentication>
          <SenderID>MarkosF2002</SenderID>
          <Authentication>
            <Method>clear</Method>
            <Value>Menamojeff=1</Value>
          </Authentication>
        </IDAuthentication>
      </SenderDetails>
    </Header>
    <Body>
      <Message xmlns="http://gateway.gov/schema/common/v1">
        <Header>
          <Vendor>Ariadni Team</Vendor>
        </Header>
        <Body>
          <PetroleumPriceRequestMob xmlns="http://gateway.gov/schema/mcit/v1">
            <PetroleumType>${fuelType}</PetroleumType> <!-- Dynamic Fuel Type -->
          </PetroleumPriceRequestMob>
        </Body>
      </Message>
    </Body>
  </GovTalkMessage>`;

  var options = {
    method: "post",
    contentType: "application/xml",
    payload: xmlRequest
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseText = response.getContentText();

  // Extract CorrelationID
  var correlationIdMatch = responseText.match(/<CorrelationID>(.*?)<\/CorrelationID>/);
  if (correlationIdMatch) {
    Logger.log(`Fuel Type ${fuelType}: Correlation ID = ${correlationIdMatch[1]}`);
    return correlationIdMatch[1]; // Return correlation ID
  }

  Logger.log(`Failed to get Correlation ID for Fuel Type ${fuelType}`);
  return null;
}


///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////// CHECKPOINT 1 EVERYTHING WORKS
///////////////////////////////////////////////////////////////////////////////////////////


function pollAllFuelTypes() {
  var correlationIDs = JSON.parse(PropertiesService.getScriptProperties().getProperty("fuelCorrelationIDs") || "{}");

  if (Object.keys(correlationIDs).length === 0) {
    Logger.log(" No correlation IDs found. Run requestAllFuelTypes() first.");
    return;
  }

  Logger.log("Starting to poll for all fuel types...");

  for (var fuelType in correlationIDs) {
    if (correlationIDs.hasOwnProperty(fuelType)) {
      var correlationID = correlationIDs[fuelType];
      Logger.log(` Polling data for Fuel Type ${fuelType} (Correlation ID: ${correlationID})...`);

      var isDataReady = false;
      var maxRetries = 5;  // Allow up to 5 retries
      var retryCount = 0;

      while (!isDataReady && retryCount < maxRetries) {
        isDataReady = pollForFuelPrices(correlationID, fuelType);
        if (!isDataReady) {
          Logger.log(`Data not ready for Fuel Type ${fuelType}. Retrying in 20 seconds... (${retryCount + 1}/${maxRetries})`);
          Utilities.sleep(20000); // Wait 20 seconds before retrying
          retryCount++;
        }
      }

      if (isDataReady) {
        Logger.log(`Data successfully retrieved for Fuel Type ${fuelType}`);
      } else {
        Logger.log(`Data could not be retrieved for Fuel Type ${fuelType} after ${maxRetries} attempts.`);
      }
    }
  }

  Logger.log("All fuel types processed and saved!");
}

//DEBUG//
function debugpoll(){
  var correlationID = 'A166F05D7B214AB1A716A476469C7BAD'
  var fuelType = 1;
  pollForFuelPrices(correlationID, fuelType);
}
function pollForFuelPrices(correlationID, fuelType) {
  var url = "https://cge.cyprus.gov.cy/gg/poll";

  var xmlPollRequest = `<?xml version="1.0" encoding="utf-8"?>
  <GovTalkMessage xmlns="http://www.govtalk.gov.uk/CM/envelope">
    <EnvelopeVersion>2.0</EnvelopeVersion>
    <Header>
      <MessageDetails>
        <Class>PBL_MCIT_Petrol_PricesMob</Class>
        <Qualifier>poll</Qualifier>
        <Function>submit</Function>
        <CorrelationID>${correlationID}</CorrelationID>
      </MessageDetails>
      <SenderDetails>
        <IDAuthentication>
          <SenderID />
          <Authentication>
            <Method>clear</Method>
            <Value />
          </Authentication>
        </IDAuthentication>
      </SenderDetails>
    </Header>
    <GovTalkDetails>
      <Keys>
        <Key Type="" />
      </Keys>
    </GovTalkDetails>
    <Body />
  </GovTalkMessage>`;

  var options = {
    method: "post",
    contentType: "text/xml", // Try changing from "application/xml" to "text/xml"
    payload: xmlPollRequest
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseText = response.getContentText();

    // Log the full response for debugging
    Logger.log(`Full API Response for Fuel Type ${fuelType}:`);
    Logger.log(responseText);

    if (responseText.includes("<Qualifier>response</Qualifier>")) {
      Logger.log(`Fuel price data ready for Fuel Type ${fuelType}`);

      // Create or get sheet
      var sheetName = `Raw_Fuel_Data_${fuelType}`;
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

      if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
      }

      sheet.clear();
      sheet.appendRow(["Fuel Price API Response"]);
      sheet.appendRow([responseText]);

      Logger.log(`Response saved in '${sheetName}'`);

      saveDataToSheet(responseText, fuelType);
      return true;
    } else {
      Logger.log(`Data NOT ready for Fuel Type ${fuelType}. Retrying later...`);
      return false;
    }
  } catch (error) {
    Logger.log(`Error polling Fuel Type ${fuelType}: ${error.message}`);
    return false;
  }
}



function extractXMLTag(xmlString, tagName) {
  var regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`);
  var match = xmlString.match(regex);
  return match ? match[1].trim() : "N/A"; // Return value or "N/A" if missing
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function saveDataToSheet(xmlData, fuelType) {
  if (!xmlData) {
    Logger.log(`No XML data found for Fuel Type ${fuelType}. Skipping...`);
    return;
  }

  // Get the correct raw data sheet name
  var sheetName = `Raw_Fuel_Data_${fuelType}`;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log(`No raw data found for Fuel Type ${fuelType}. Run pollForFuelPrices() first.`);
    return;
  }

  //Get the correct structured data sheet name
  var fuelSheetName = `Fuel_Prices_${fuelType}`;
  var fuelSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(fuelSheetName);

  if (!fuelSheet) {
    fuelSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(fuelSheetName);
    fuelSheet.appendRow(["Fuel Company", "Station Name", "City", "District", "Address", "Fuel Price", "Date Modified", "Coordinates"]);
  } else {
    fuelSheet.clear(); 
    fuelSheet.appendRow(["Fuel Company", "Station Name", "City", "District", "Address", "Fuel Price", "Date Modified", "Coordinates"]);
  }

  //Extract station data using regex
  var stations = xmlData.match(/<PetroleumPriceDetails1>[\s\S]*?<\/PetroleumPriceDetails1>/g);
  if (!stations) {
    Logger.log(`No station data found for Fuel Type ${fuelType}`);
    return;
  }

  //Process extracted stations
  var extractedData = stations.map(station => [
    extractXMLTag(station, "fuel_company_name"),
    extractXMLTag(station, "station_name"),
    extractXMLTag(station, "station_city"),
    extractXMLTag(station, "station_district"),
    extractXMLTag(station, "station_address1"),
    extractXMLTag(station, "Fuel_Price"),
    extractXMLTag(station, "price_modification_date"),
    extractXMLTag(station, "map_coordinates")
  ]);

  //Batch insert instead of appending row by row (faster)
  fuelSheet.getRange(fuelSheet.getLastRow() + 1, 1, extractedData.length, extractedData[0].length).setValues(extractedData);

  Logger.log(`Fuel prices saved for Fuel Type ${fuelType}!`);
}


