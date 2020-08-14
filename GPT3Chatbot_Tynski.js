
'use strict';
const axios = require('axios');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements



exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  //console.log('Dialogflow Request body: ' + JSON.stringify(request.body));



    async function rhymingWordHandler(agent) {
          
          try{
           const echoText = agent.parameters.echoText;
         //agent.add(echoText);
           

            const fromdatabase = await axios.get("https://theaioracle-db93.restdb.io/rest/convo/yourdatabaseentry",{
        headers: 
          { 'cache-control': 'no-cache',
          'x-apikey': 'yourapikey' },
            json: true});
            
      //agent.add(JSON.stringify(fromdatabase.data.context));
      //console.log(JSON.stringify(fromdatabase.data.context));

      var togpt3 = fromdatabase.data.context;
        const fromgpt3 = await axios.post("https://api.openai.com/v1/engines/davinci/completions",{
                    prompt: togpt3 +  "\nYou:" + echoText + "\nHeather:",
                    max_tokens: 75,
                    temperature: 0.7,
                    top_p: 1,
                    n: 1,
                    stream: false,
                    logprobs: null,
                    stop: "\n"
                    },{
            headers: 
            { 'Authorization': `yourgpt3key` }});
            
        agent.add(fromgpt3.data.choices[0].text);
        
            
            
            
            
                var responsefromgpt3 = fromgpt3.data.choices[0].text;
            
                const todatabase = await axios.put( "https://theaioracle-db93.restdb.io/rest/convo/yourdatabaseentry",
                     {context: togpt3 + "\nYou:"+ echoText + "\nHeather:" +  responsefromgpt3 },
                    {headers: 
            { 'cache-control': 'no-cache',
            'x-apikey': 'yourkey' }});

          //agent.add(responsefromgpt3);




      return fromdatabase,fromgpt3,todatabase;
            
          }
          catch (err) {
        console.error(err);
    }

        }






    
 
 let intentMap = new Map();
  //intentMap.set('Default Welcome Intent', welcome);
  //intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('RhymingWord', rhymingWordHandler);


  //intentMap.set('looping test', loopingHandler);
  agent.handleRequest(intentMap);  

      });      