var express = require('express');
var router = express.Router();
var optimizer = require('./backend/optimizer')
var dbConverter = require('./backend/dofusDbConverter')
var fs = require('fs')
/* GET home page. */

function Doc(){
  return "% air resistance => rpa\n" +
  "% earth resistance => rpt\n" +
  "% fire resistance => rpf\n" +
  "% melee damage => dpm\n" +
  "% melee resistance => rpm\n" +
  "% neutral resistance => rpn\n" +
  "% ranged damage => dpd\n" +
  "% ranged resistance => rpd\n" +
  "% spell damage => dps\n" +
  "% water resistance => rpe\n" +
  "% weapon damage => dpa\n" +
  "ap => pa\n" +
  "ap parry => pap\n" +
  "ap reduction => par\n" +
  "agility => agi\n" +
  "air damage => doa\n" +
  "air resistance => rea\n" +
  "chance => cha\n" +
  "critical => cri\n" +
  "critical damage => doc\n" +
  "critical resistance => rec\n" +
  "damage => do\n" +
  "dodge => fui\n" +
  "earth damage => dot\n" +
  "earth resistance => ret\n" +
  "fire damage => dof\n" +
  "fire resistance => ref\n" +
  "heals => so\n" +
  "initiative => ini\n" +
  "intelligence => int\n" +
  "lock => tac\n" +
  "mp => pm\n" +
  "mp parry => pmp\n" +
  "mp reduction => pmr\n" +
  "neutral damage => don\n" +
  "neutral resistance => ren\n" +
  "power => pui\n" +
  "power (traps) => tpu\n" +
  "prospecting => pp\n" +
  "pushback damage => dop\n" +
  "pushback resistance => rep\n" +
  "range => po\n" +
  "reflect => voi\n" +
  "strength => str\n" +
  "summons => inv\n" +
  "trap damage => tdo\n" +
  "vitality => vit\n" +
  "water damage => doe\n" +
  "water resistance => ree\n" +
  "wisdom => sa\n" +
  "pods => pod\n" +
  "set_bonus => sb"
}
function DefaultInput(){
  return "#LEVEL\n" +
      "200\n" +
      "#MIN_CRIT\n" +
      "%Enter a value only if you want to take\n" +
      "%critical strike into account in the computation.\n" +
      "%Solver will assume you have this cc in your stuf\n"+
      "50\n" +
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
      "sa 100\n" +
      "vit 100\n" +
      "pa 1\n" +
      "pm 1\n" +
      "#DMG_LINES\n" +
      "%decimation entaille x2\n" +
      "terre 15 29 32 35 38\n" +
      "terre 25 47 51 56 61\n" +
      "terre 25 47 51 56 61\n" +
      "#CONSTRAINTS\n" +
      "%stat_name (>=|<=|=) value\n" +
      "pa >= 12\n" +
      "pm >= 5\n" +
      "#LOCK_ITEMS\n" +
      "%(+|-)item_name_in_english_with_no_cap.\n"
}
router.get('/', function(req, res, next) {4
  res.render('index', { title: 'Express', name: 'inputText', defaultText: DefaultInput(), doc: Doc()});
});


router.post('/compute', async (req, res) => {
  try {

    console.log(new Date().toString() + " : run optimisation query");

    let success = true;
    fs.writeFile("optimizer/src/inputfiles/discord.in", req.body.text, (err)=>{
      if (err){
        console.error("Error while writing discord.json")
        success = false;
      }
      console.log("Finished writing json file")
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
      console.log(new Date().toString() + " : link finished : " + result.link);
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
