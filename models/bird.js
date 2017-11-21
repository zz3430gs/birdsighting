var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

/* Information about a bird species, and dates this bird was seen */

var birdSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Bird name is required"],
        unique: true,
        uniqueCaseInsensitive: true,                            //The names must be different and not be the
        validate: {                                             //same bird
          validator: function(n){
              return n.length >= 2;
          },
          message: '{VALUE} is not valid, bird name must be at least 2 letters'}},
    description: String,
    height: {type: Number, min: 1, max: 300}, //must be between the min and max
    averageEggs: {type: Number, min:1, max: 50},// numbers of eggs must not be negative numbers or pass 50
    endangered: {type: Boolean, default: false},
    datesSeen: [{
        type: Date,
        required: true,
        validate: {
          validator: function(d) {
              if(!d) {return false;}
              return d.getTime()<= Date.now();
          },
        message: "Date must be a valid date. Date must be now or in the past"}
    }], // An array of dates a bird of this species was seen. Must be now, or in the past
    nest: {
        location: String,
        materials: String
    }
});

var Bird = mongoose.model('Bird', birdSchema);
birdSchema.plugin(uniqueValidator);

module.exports = Bird;