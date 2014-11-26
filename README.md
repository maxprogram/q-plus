# Q+

**Q+** is a utility add-on for [the promise library Q](https://github.com/kriskowal/q). It adds flow-control methods to work with data between promises.

## Examples

```js
var Q = require('q-plus');

Q(['1145d024','4b4897c2','c89a11ec'])
.mapSeries(function(id) {
    return Animal.duplicate(id);
}).then(function(animals) {
    console.log(animals); //= Array of duplicate animals
})

var africanMammalLocations = [];
Animal.where({ type: 'Mammal' })
.map(function(animal) {
    return animal.getHabitat();
})
.eachSeries(function(habitat) {
    if (habitat.continent == 'Africa')
        africanMammalLocations.push(habitat.name);
}).thenResolve(africanMammalLocations);
```

---------------------------------------
## Documentation

<a name="eachSeries" />
### Q(object).eachSeries(iterator)

```js
// Typical 'forEach' usage:
Q([1, 2, 3, 4]).eachSeries(function(num, i) {
    if (num * 3 < 10) storage.push(num);
});
// With a promise as iterator:
Q([{ name: 'Mark' }, { name: 'Sarah' }])
.eachSeries(function(person, i) {
    // use a return statement if using a promise:
    return People.new(person.name); 
});
// Using an object instead of an array:
Q({ one: 1, two: 2, three: 3 }).eachSeries(function(num, key) {
    console.log(key, num); //= one 1, two 2, three 3
});
```

---------------------------------------
<a name="mapSeries" />
### Q(object).mapSeries(iterator)

*TODO*

---------------------------------------
<a name="map" />
### Q(object).each(iterator)

*TODO*

---------------------------------------
<a name="map" />
### Q(object).map(iterator)

*TODO*