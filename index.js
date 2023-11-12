import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import moment from "moment";

import htm from "htm";
import vhtml from "vhtml";
const html = htm.bind(vhtml);

import { plot } from 'svg-line-chart'


const app = express();
const port = 3000;
const API_URL = "https://api.frankfurter.app";


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("index.ejs")
  });

app.get("/latest_rates", async (req, res) => {
  try {
    const response = await axios.get(API_URL+"/latest");
    const result = response.data;
    res.render("latest.ejs", { data: result.rates });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("latest.ejs", {
      error: error.message,
    });
  }
});

app.post("/latest_rates", async (req, res) => {
  try {
    const currency = req.body.currencies;
    const response = await axios.get(API_URL+`/latest?from=${currency}`);
    const result = response.data;
    res.render("latest.ejs", {
      data: result.rates,
    });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("latest.ejs", {
      error: "No currencies that match your criteria.",
    });
  }
});

app.get("/conversion", async(req, res) => {
  try {
    const response = await axios.get(API_URL+"/latest");
    const result = response.data;
    res.render("conversion.ejs", { data: result.rates });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("conversion.ejs", {
      error: error.message,
    });
  }
});

app.post("/conversion", async(req, res) => {
  try {
    const from_currency = req.body.currenciesF;
    const to_currency=req.body.currenciesT;
    const amount=req.body.amount;
    const response2=await axios.get(API_URL+"/latest");
    const result2=response2.data;
    const checkDataType = +amount;


    if ((from_currency==to_currency) && (isNaN(checkDataType))){
      const statement2="Amount needs to be a number."
      const statement1="Please select 2 different currencies. "
      res.render("conversion.ejs", {
        data: result2.rates,
        info:statement1,
        info_correctNum:statement2      
      });
    }

    else if (from_currency==to_currency){
      const statement="Please select 2 different currencies. "
      res.render("conversion.ejs", {
        data: result2.rates,
        info:statement    
      });
    }

    else if (isNaN(checkDataType)){
      const statement="Amount needs to be a number."
      res.render("conversion.ejs", {
        data: result2.rates,
        info_correctNum:statement    
      });
    }

    else{
      
    const response = await axios.get(API_URL+`/latest?amount=${amount}&from=${from_currency}&to=${to_currency}`);
    const result = response.data;
   
    res.render("conversion.ejs", {
      data: result2.rates,
      From:from_currency,
      To:to_currency,
      amount:result.amount,
      converted:Object.values(result.rates)[0],
    });

  }} catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("conversion.ejs", {
      error: "No currencies that match your criteria.",
    });
  }


});

app.get("/historical_rates", async(req, res) => {
  try {
    const response = await axios.get(API_URL+"/latest");
    const result = response.data;
    res.render("historical.ejs", { data: result.rates });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("historical.ejs", {
      error: error.message,
    });
  }
});


app.post("/historical_rates", async(req, res) => {
  try {
    
    const curr_currency = req.body.currency;
    const base_currency=req.body.base;
    const start_date=req.body.start_date;
    const end_date=req.body.end_date;
    const response2=await axios.get(API_URL+"/latest");
    const result2=response2.data;
    const validStartDate = moment(start_date,'YYYY-MM-DD',true).isValid();
    const validEndDate = moment(end_date,'YYYY-MM-DD',true).isValid();
    var validTime_StartDate=false;
    var validTime_EndDate=false;
    if (validStartDate==true){
      validTime_StartDate = moment(start_date).isAfter();
    }
    if (validEndDate==true){
      validTime_EndDate = moment(end_date).isAfter();
    }
    

    if ((curr_currency==base_currency) && (validStartDate==false || validEndDate==false)){
      const dateFormat_Error="Invalid Date Entered."
      const statement="Selected Currency and Base Currency can't be the same. Please select 2 different currencies. "
      res.render("historical.ejs", {
        data: result2.rates,
        info:statement,      
        info_dateFormat: dateFormat_Error   
      });
    }

    else if ((curr_currency==base_currency) && (validTime_EndDate==true || validTime_StartDate==true)){
      const dateFormat_Error="Invalid Date Entered."
      const statement="Selected Currency and Base Currency can't be the same. Please select 2 different currencies. "
      res.render("historical.ejs", {
        data: result2.rates,
        info:statement,      
        info_dateFormat: dateFormat_Error   
      });
    }


    else if ((curr_currency==base_currency) && (start_date>=end_date)){
      const statement="Selected Currency and Base Currency can't be the same. Please select 2 different currencies. "
      const date_Error="Selected Initial Date can't be lesser than or equal to End Date. Please select Initial date atleast 5 days lesser than End Date for chart to be displayed."
      res.render("historical.ejs", {
        data: result2.rates,
        info:statement,
        info_date: date_Error    
      });
    }

    else if(validTime_EndDate==true|| validTime_StartDate==true){
      const dateFormat_Error="Invalid Date Entered."
      res.render("historical.ejs", {
        data: result2.rates,
        info_dateFormat: dateFormat_Error 
      });
    }


    else if (curr_currency==base_currency){
      const statement="Selected Currency and Base Currency can't be the same. Please select 2 different currencies. "
      res.render("historical.ejs", {
        data: result2.rates,
        info:statement    
      });
    }
  
    else if (validStartDate==false || validEndDate==false){
      const dateFormat_Error="Invalid Date Entered."
      res.render("historical.ejs", {
        data: result2.rates,
        info_dateFormat: dateFormat_Error 
      });
    }

    else if(start_date>=end_date){
      const date_Error="Selected Initial Date can't be lesser than or equal to End Date. Please select Initial date atleast 5 days lesser than End Date for chart to be displayed."
      res.render("historical.ejs", {
        data: result2.rates,
        info_date: date_Error 
      });
    }



    else{
      const response = await axios.get(API_URL+`/${start_date}..${end_date}?from=${base_currency}&to=${curr_currency}`);
      const result = response.data;

      const arr1=Object.keys(result.rates);
      const arr2=Object.values(result.rates).map(rate => rate[curr_currency]);

      const x = arr1.map((d) => new Date(d));
      const y = arr2;

      if (arr1.length <5){
        const dateGap_Error="Please select Initial date atleast 5 days lesser than End Date for chart to be displayed."
        res.render("historical.ejs", {
          data: result2.rates,
          info_dateGap: dateGap_Error 
        });
      }
    
      // chart is a html string that can be rendered by the browser
      const chart = plot(html)(
        { x, y },
        {
          props: {
            style: "display:block; margin-left: auto; margin-right: auto;",
            
          },
          margin: 0.001,
          width: 100,
          height: 40,
          title: "A line chart",
          polygon: {
            fill: 'none',
            style: 'fill:url(#polygrad);',
            strokeWidth: 0.01,
            stroke: "white",
          },
          line: {
            fill: "none",
            strokeWidth: 0.1,
            stroke: "black",
          },
          polygonGradient: {
            offSet1: "0%",
            stopColor1: "#ffffff00",
            offSet2: "100%",
            stopColor2: "#ffffff00",
          },
          xAxis: {
            strokeWidth: 0.1,
            stroke: "black",
          },
          yAxis: {
            strokeWidth: 0.1,
            stroke: "black",
          },
          xLabel: {
            fontSize: 0.8,
            name: "DATE",
            writingMode: "vertical-lr",
            
          },
          yLabel: {
            fontSize: 0.8,
            name: "CURRENCY",
            locale: "en-US",
          },
          xGrid: {
            strokeWidth: 0.05,
            stroke: "lightgrey",
          },
          yGrid: {
            strokeWidth: 0.05,
            stroke: "lightgrey",
          },
          yNumLabels: 10
        }
      )
    
      res.render("historical.ejs", {
        data: result2.rates,
        currency:curr_currency,
        base:base_currency,
        startDate:start_date,
        endDate:end_date,
        history:result.rates,
        chart:chart
        
      });
  }}catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("historical.ejs", {
      error: "No currencies that match your criteria.",
    });
  }
});





app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
  