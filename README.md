# Reactor

Reactor is a library that allows you to write functions that automatically respond to variable changes within them. This allows you to think of your project as a single, static state instead of the constantly changing mess inherent to large projects. Stop tracking changes to your variables and start writing beautiful, intuitive code.


## Installation

### Node

```bash
$ npm install reactor-lib
```

```javascript
var Reactor = require('reactor-lib');
```

### CDN

```html
<script src="//cdn.jsdelivr.net/reactor/latest/reactor.min.js"></script>
```

### Manual

```html
<script src="path/to/reactor.min.js"></script>
```

> **NOTE:** For sourcemap support, include *reactor.js* and *reactor.min.js.map* in the same directory as *reactor.min.js*.

## Quick Start

The following example:

1. Creates a Reactor with a default value
2. Runs a function that retrieves and logs its value
3. Changes the value of the Reactor which automatically runs the previous function and logs the new value

```javascript
var my_name = new Reactor('Sammy');

Reactor(function() {
	console.log(my_name.get());
});

my_name.set('Bobby');
```

Output:
```
Sammy
Bobby
```

## Slow Start

#### Creating Reactors

Reactors are created using ***new Reactor()***. They can hold values and can optionally be initialized with a default value. Their values can then be retrieved/changed anywhere using the **get()**/**set()** methods.

```javascript
var my_name = new Reactor();
var my_age  = new Reactor(92);

my_name.set('Sammy');

console.log(my_name.get());
console.log(my_age.get());
```

Output:
```
Sammy
92
```

> **NOTE:** You must use the *new* keyword when creating a Reactor


#### Creating Reactor Functions

Reactor Functions are created using ***Reactor(&lt;function&gt;)***. Within the passed in function, if a Reactor's value is retrieved via **get()**, the function is registered as dependent on that value and will be re-run when the value changes. If the value of a Reactor is not needed but you still want a function dependent on it, you can use the **depend()** method.

Reactor Functions can contain any number of Reactors. Conversely, Reactors can be used within any number of Reactor Functions.

```javascript
// This function is dependent on my_name and my_age
Reactor(function() {
	var name = my_name.get();
	var age  = my_age.get();

	console.log(name + ' ' + age);
});

// This function is also dependent on my_name and my_age
Reactor(function() {
	my_age.depend();

	console.log('Hello, ' + my_name.get());
});
```

> **NOTE:** Do not use the *new* keyword when creating a Reactor Function


#### Triggering a Reaction

Any time a Reactor's value is changed using **set()**, all functions dependent on it will be re-run. This is called a reaction. A reaction only occurs if the new value fails a strict equality comparison with the previous value. A reaction can also be triggered without changing the value by calling **act()**.

```javascript
my_name.set('Bobby');
my_age.act();
```

Be careful when dealing with objects and arrays. Modifying a property on an object or array is not detected as a change when calling **set()** unless the object/array you are passing in is different than the one the Reactor is currently storing. If you want to force a reaction after modifying an object/array, use the **act()** method.

```javascript
var options    = {};
var my_options = new Reactor(options);

options.foo = true;

// This does not trigger a reaction because the Reactor already stores a reference to options
my_options.set(options);

// This triggers a reaction regardless of the value
my_options.act();

// This triggers a reaction because a different object is being set
my_options.set({foo : true});
```


#### Reaction timing and order

When a reaction is triggered, it is not executed immediately. Instead, it is scheduled for the next time the client is idle (typically after only a few milliseconds). This is to avoid recursion and to aggregrate rapid changes to multiple Reactors in a single reaction.

For simplicity, the order in which Reactor Functions are executed in a reaction is arbitrary. This is because the order of multiple Reactor Functions with shared Reactor dependencies becomes confusing, unpredictable, and not very useful in practical situations. Your Reactor Functions should be isolated units capable of being called at any time in any order.


#### Reactors without values

Reactors do not need to have values. In some cases, it's useful to have a Reactor whose sole purpose is to activate Reactor Functions explicitly.

Because they hold no values, use **depend()**/**act()** instead of **get()**/**set()**, respectively.

```javascript
var my_activator = new Reactor();

Reactor(function() {
	my_activator.depend();

	console.log(Math.random());
});

my_activator.act();
```

## API

#### new Reactor([default_value])

Creates a new Reactor with an optional default value.

#### Reactor(function, [context])

Runs a function with an optional context ("this"). If **get()**/**depend()** is called on a Reactor within the function, the function is registered as dependent on the Reactor and will be re-run if a reaction is triggered.

#### *&lt;Reactor&gt;*.get()

Returns the value of a Reactor

#### *&lt;Reactor&gt;*.set(value)

Sets the value of a Reactor. If the value is not strictly equal to the previous value, a reaction is scheduled.

#### *&lt;Reactor&gt;*.depend()

Similar to Reactor.get() except it does not return a value. This is useful for Reactors that do not hold values.

#### *&lt;Reactor&gt;*.act()

Similar to Reactor.set() except it does not accept a value. This is useful for Reactors that do not hold values or for forcing a reaction without changing the Reactor's value.
