var express = require('express');
var router = express.Router();
var Bird = require('../models/bird');

/* GET home page. */
router.get('/', function(req, res, next) {
  Bird.find().select({name: 1, description: 1}).sort({name: 1})
    .then((docs)=>{
        console.log(docs);
        res.render('index', {title: 'All Birds', birds: docs});
    })
    .catch((err)=>{
        next(err);
    });
});

/* POST to create new bird in birds collection */
router.post('/addbird', function (req, res, next) {

  var bird = Bird(req.body);

  //Have to re-arrange the form data to match the nested schema.
  //Form data can only be key-value pairs.
  bird.nest = {
      location: req.body.nestLocation,
      materials: req.body.nestMaterials
    }

  bird.save()
    .then((doc) =>{
      console.log(doc);
      res.redirect('/')
    })
    .catch((err) =>{
      if (err.name === 'ValidationError'){
          //check for validation errors, whether negative number of eggs or missing name
          req.flash('error', err.message);
          res.redirect('/');
      }
      else {
          next(err);
      }
    });
});

/* GET info about one bird */
router.get('/bird/:_id', function (req, res, next) {

  Bird.findOne({_id: req.params._id})
    .then((doc)=>{
      if(doc){
          //sorting the date of the sighting that was recorded from earliest to latest
          doc.datesSeen = doc.datesSeen.sort( function (a,b) {
              if (a && b){
                  return a.getTime() - b.getTime();
              }
          });
        res.render('bird', {bird: doc});
      }else{
        res.status(404);
        next(Error("Bird not found"));
      }
    })
    .catch((err)=>{
        next(err);
    });
});

/* POSt to add any bird sightings*/
router.post('/addSighting', function (req, res, next) {

    //add the date of the sighting of a bird
    //must be in correct format
    Bird.findOneAndUpdate({_id: req.body._id}, {$push : {datesSeen: req.body.date}}, {runValidators: true})
        .then((doc)=>{
            if(doc) {
                res.redirect('/bird/' + req.body._id);
            }
            else {
                res.status(404); next(Error("Attempt to add sighting to bird not in database"))
            }
        })
        .catch((err)=>{
            console.log(err);
            if(err.name === 'CastError'){
                req.flash('error', 'Date must be in a valid date format: mm/dd/yyyy');
                res.redirect('/bird/' + req.body._id);
            }else if(err.name === 'ValidationError'){
                req.flash('error', err.message);
                res.redirect('/bird/' + req.body._id);
            }else {
                next(err);
            }
        });
});
/* POST to delete any bird sightings */
router.post('/delete', function(req, res, next){

    //delete a bird sighting
    Bird.deleteOne({_id : req.body._id})
        .then((result)=>{
            if(result.deletedCount === 1) {
                res.redirect('/')
            }
        })
        .catch((err) => {
            next(err);
        });
});
module.exports = router;
