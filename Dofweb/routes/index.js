var express = require('express');
var router = express.Router();
var optimizer = require('./backend/optimizer')
var dbConverter = require('./backend/dofusDbConverter')
var fs = require('fs')
/* GET home page. */

const EventEmitter = require('events');
class IntermediateResultEventEmitter extends EventEmitter {
  onIntermediate(intermediateResult){
    this.emit('intermediate', intermediateResult)
  }
  onProgress(percentageProgress){
    this.emit('progress', percentageProgress)
  }
  
  onFinish(finalResult){
    this.emit('finish', finalResult)
  }
}
function Doc(){
  return "<h3 id=\"list-of-sections\">List of sections</h3>\n" +
      "<p>An input file is divided in various sections with a precse syntax for each.\n" +
      "You can precise a section by writing <code>#SECTION_NAME</code> in your file.\n" +
      "Here is the list of valid section names :</p>\n" +
      "<ul>\n" +
      "<li><code>LEVEL</code>, simple one, just print the level of your character.</li>\n" +
      "<li><code>MIN_CRIT</code>, used to specify if you actually want to take critical strike into account in the computation. Here you specify the minimum critical strike chance given by your stuff as an integer. The solver will assume that you have THIS amount of crit chance in your stuff when doing computation.</li>\n" +
      "<li><code>TARGETED_SLOTS</code>, the number of items you desire per slots. This section&#39;s syntax is <code>slot_name uint</code> where the valid slots names are :<ul>\n" +
      "<li><code>amulet</code>, default 1;</li>\n" +
      "<li><code>hat</code>, default 1;</li>\n" +
      "<li><code>ring</code>, default 1;</li>\n" +
      "<li><code>weapon</code>, default 1;</li>\n" +
      "<li><code>shield</code>, default 1;</li>\n" +
      "<li><code>belt</code>, default 1;</li>\n" +
      "<li><code>back</code>, default 1;</li>\n" +
      "<li><code>boots</code>, default 1;</li>\n" +
      "<li><code>dofus</code>, default 6;</li>\n" +
      "<li><code>prysmaradite</code>, default 1;</li>\n" +
      "<li><code>pet</code>, default 1.</li>\n" +
      "</ul>\n" +
      "</li>\n" +
      "<li><code>BASE_STATS</code> the additionnal stats of your character, mainly &quot;forgemagie&quot;. Syntax is the following ; <code>stat_name int</code>.</li>\n" +
      "<li><code>DMG_LINES</code>, this section is here to help you optimize a damage round. Here you ave to give information over each damage line you want to take into account (ex: 4 lines for zoth warrior axe). Here is the syntax for a damage line : <code>elt_name line_crit_rate min_nocri max_nocri min_cri max_cri</code>. These are all integral values except for elt wich must be one of <code>air, eau, feu, terre, neutre</code>. You have to give each of the six required values even if your spell does not crit, in this case <code>crit_rate</code>must be <code>0</code>.</li>\n" +
      "<li><code>OBJECIVE</code>, used to give simple objectives coeffs to the solver. Better not to use if already used dmg lines. Syntax : <code>stat_name int</code>.</li>\n" +
      "<li><code>CONSTRAINTS</code>, the constraints your stuff must satisfy (e.g ap &gt;= 11). Syntax : <code>stat_name (&gt;=|&lt;=|=) value</code>.</li>\n" +
      "<li><code>LOCK_ITEMS</code>, in this section you may force the solver to set certain items in or out from your stuff. Syntax : <code>(+|-)item_name_in_english_with_no_cap</code>.</li>\n" +
      "</ul>\n"
}
function Mots(){
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
  "set_bonus => sb" +
  "AIR => air\n" +
  "FEU => feu\n" +
  "TERRE => terre\n" +
  "EAU => eau\n" +
  "NEUTRE => neutre\n" +
  "POUSSEE => poussee"
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
      "%(+|-)nom de l'objet en francais sans majuscule\n"
}
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', name: 'inputText', defaultText: DefaultInput(), doc: Doc(), mots:Mots()});
});


router.post('/compute', async (req, res) => {
  try {

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    
    console.log(new Date().toString() + " : run optimisation query");

    /*let success = true;
    fs.writeFile("optimizer/src/inputfiles/discord.in", req.body.text, (err)=>{
      if (err){
        console.error("Error while writing discord.json")
        success = false;
      }
      console.log("Finished writing json file")
    })

    if (!success){
      res.write(`${JSON.stringify({error:"Error while writing discord.json"})}`)
      res.end()
      return;
    }*/
    
    const emitter = new IntermediateResultEventEmitter()
    emitter.on('intermediate', result => {
      console.log(result)
      res.write(`${JSON.stringify({link: result.link, score: result.value, intermediate:1, })}`)
    })
    emitter.on('progress', percentage => {
      console.log(percentage)
      res.write(`${JSON.stringify({percentage: percentage})}`)
    })
    emitter.on('finish', result => {
      console.log(result)
      res.write(`${JSON.stringify({link: result.link, score: result.value, items:result.items})}`)
      res.end()
    })
    const optimization = await optimizer.RunOptimisationAsync(emitter, req.body.text);
    
    console.log(new Date().toString() + " : run optimisation completed : " + optimization);
    
    /*
    if (optimization.error){
      res.write({error:optimization.error });
      res.end()
    }
    
    const result = dbConverter.TreatJson();

    if (result.link) {
      console.log(new Date().toString() + " : link finished : " + result.link);
      res.write(`${JSON.stringify({link: result.link, result: result.value, items: result.items})}`)
      res.end()
    } else {
      console.log(`Sending JSON response: ${result.error}`);
      res.write({ error:result.error });
      res.end()
    }*/
    
    
  } catch (error) {
    console.error('Error during async tasks:', error);
    res.write({ error: 'An error occurred while processing your request.' });
    res.end()
  }
});

module.exports = router;
