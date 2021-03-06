/**
 * flatten.js file
 *
 * Contains function to flatten a parsed Tidal pattern
 *
 */

var Fraction = require('fraction.js');

/**
 * Flattens objects that resulted from parsing Tidal patterns
 * @param  {Object} group the nested (or not nested) object to be flattened
 * @return {Object}       the flattened object with correct fractions in a cycle
 */

module.exports.flatten =
  function flatten(group){

    let currentPosition = new Fraction(0) // Start at 0 and increase every iteration
    const flattened = {}

    /**
     * Recursive inner function to add proper fractions as keys to the flattened object
     * @param  {Object}   group    the group or subgroup to be flattened
     * @param  {Fraction} dur      the duration of each subgroup in the group
     */
    function calc( group, dur = new Fraction( 1, Object.keys(group).length - 1 ) ){

      for( let key in group ) {

        if( key === 'type' ) continue // No type specification in the flattened object

        const step = group[ key ]

        if( step.type === 'group' ) { // Nested step so do a recursive call
          const groupDur = new Fraction( 1, Object.keys( step ).length - 1 )
          calc( step, dur.mul( groupDur ) )
        }
        else{ // Step is flat so add to global flattened const
          flattened[ currentPosition.toFraction( false ) ] = step
          currentPosition = currentPosition.add( dur )
        }
      }
    }



    if (group.type === 'repeat'){

      let length = (Object.keys(group.value).length - 1) * group.repeatValue.value;
      let groupDur = new Fraction(1, length);

      if (group.value.type != 'group'){
        group.value = {'0': group.value}
      }

      for (var i = 0; i<group.repeatValue.value; i++){
        calc(group.value, groupDur);
        currentPosition = currentPosition.add(groupDur.mul(new Fraction(i)));
      }

      flattened.type = 'group';
    }

    else{
      calc(group) // Call to the inner function
    }

    return flattened // Final flattened object
  }
