var express = require('express');
var router = express.Router();

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
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', name: 'inputText', defaultText: DefaultInput()});
});


router.post('/compute', async (req, res) => {
  try {
    // Extract data from the incoming request body
    const { text } = req.body;

    // Run all asynchronous tasks in parallel using Promise.all
    const results = await new Promise(resolve => setTimeout(() => resolve('Task 1 Complete'), 2000));

    // Send the response with the results of the tasks
    res.json({ message: 'All tasks completed successfully!', results, receivedText: text });

  } catch (error) {
    // Handle any errors that occur during the async operations
    console.error('Error during async tasks:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

module.exports = router;
