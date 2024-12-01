var express = require('express');
var router = express.Router();
var optimizer = require('./backend/optimizer')
var dbConverter = require('./backend/dofusDbConverter')
var fs = require('fs')
/* GET home page. */

function DefaultInput(){
  return "#LEVEL\n" +
  "200\n" +
  "#TARGETED_SLOTS\n" +
  "amulet 1\n" +
  "hat 1\n" +
  "ring 2\n" +
  "weapon 1\n" +
  "shield 1\n" +
  "belt 1\n" +
  "back 1\n" +
  "boots 1\n" +
  "dofus 6\n" +
  "prysmaradite 1\n" +
  "pet 1\n" +
  "#BASE_STATS\n" +
  "cha 100\n" +
  "str 100\n" +
  "int 100\n" +
  "agi 100\n" +
  "pa 1\n" +
  "pm 1\n" +
  "#OBJECTIVE\n" +
  "str 1.\n" +
  "pui 1.\n" +
  "#CONSTRAINTS\n" +
  "vit >= 2999\n" +
  "#LOCK_ITEMS\n" +
  "-shaker"
}
router.get('/', function(req, res, next) {4
  res.render('index', { title: 'Express', name: 'inputText', defaultText: DefaultInput()});
});


router.post('/compute', async (req, res) => {
  try {

    console.log(new Date().toString() + " : run optimisation query");

    var success = true
    await fs.writeFile("optimizer/src/discord.json", req.body.text, (err)=>{
      if (err){
        console.error("Error while writing discord.json")
        success = false;
      }
    })

    if (!success){
      res.json({error:"Error while writing discord.json"})
      return;
    }
    
    if (process.platform === 'win32'){
      res.json({error:"win32 server"})
      return;
    }
    
    
    const optimization = await optimizer.RunOptimisationAsync();
    console.log(new Date().toString() + " : run optimisation completed : " + optimization);
    
    if (optimization.error){
      res.json({error:optimization.error });
      return;
    }
    
    
    const result = await dbConverter.TreatJson();

    if (result.link) {
      console.log(new Date().toString() + " : run optimisation completed : " + optimization);
      res.json({link: result.link, result: result.value});
    } else {
      console.log(`Sending JSON response: ${result.error}`);
      res.json({ error:result.error });
    }
  } catch (error) {
    console.error('Error during async tasks:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

module.exports = router;
