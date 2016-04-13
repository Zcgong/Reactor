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

### Browser

```html
<script src="path/to/reactor.js"></script>
```

## Quick Start

The following example will:

1. Create a Reactor with a default value
2. Run a function that retrieves and logs its value
3. Change the value of the Reactor which will automatically run the previous function

```javascript
var my_name = new Reactor('Sammy');

Reactor(function() {
	console.log(my_name());
});

my_name('Bobby');
```

**Output:**
```
Sammy
Bobby
```

## Slow Start

### Creating Reactors

Reactors are created using ***new Reactor([default_value])***. They can hold values and can optionally be initialized with a default value.

```javascript
var my_name = new Reactor();
var my_age  = new Reactor(24);

my_name('Sammy');

console.log(my_name());
console.log(my_age());
```

**Output:**
```
Sammy
24
```

> **NOTE:** You must use the *new* keyword when creating a Reactor


### Creating Reactor Functions

Reactor Functions are creating using ***Reactor(function, [context])***. This runs the function immediately. Within the passed in function, if a Reactor's value is retrieved, the function is registered as dependent on that value and will be re-run when the value changes.

Reactor Functions can contain any number of Reactors. Conversely, Reactors can be used within any number of Reactor Functions.

```javascript
// This function is dependent on my_name and my_age
Reactor(function() {
	var name = my_name();
	var age  = my_age();

	console.log(name + ' ' + age);
});

// This function is also dependent on my_name and my_age
Reactor(function() {
	my_age();

	console.log('Hello, ' + my_name());
});
```

> **NOTE:** Do not use the *new* keyword when creating a Reactor Function


### Triggering a Reaction

Any time a Reactor's value is changed, all functions dependent on it will be re-run. This is called a reaction. A reaction only occurs if the new value fails a strict equality comparison with the previous value. A reaction can also be triggered without changing the value by calling **&lt;Reactor&gt;.trigger()**.

```javascript
// Implicitly trigger a reaction by setting the Reactor's value
my_name('Bobby');

// Explicity trigger a reaction by calling trigger()
my_age.trigger();
```

Be careful when dealing with objects and arrays. Modifying a property on an object/array is not detected as a change. If you want to force a reaction after modifying an object/array's properties, use the **&lt;Reactor&gt;.trigger()** method.

```javascript
var options    = {};
var my_options = new Reactor(options);

options.foo = true;

// This does not trigger a reaction because the Reactor already stores a reference to options
my_options(options);

// This triggers a reaction regardless of the value
my_options.trigger();

// This triggers a reaction because a different object is being set
my_options({foo : true});
```


### Reactors without values

Reactors do not need to have values. In some cases, it's useful to have a Reactor whose sole purpose is to activate Reactor Functions explicitly (similar to the pub/sub pattern).

Because they hold no values, use **&lt;Reactor&gt;.trigger()** to trigger a reaction.

```javascript
var generate_random_number = new Reactor();

Reactor(function() {
	// Registers generate_random_number as a dependency
	generate_random_number();

	console.log(Math.random());
});

// Triggers a reaction
generate_random_number.trigger();
```


### Reaction timing and order

When a reaction is triggered, it is not executed immediately. Instead, it is scheduled for the next time the client is idle (typically a few milliseconds). This is to avoid recursion and to aggregrate rapid changes to multiple Reactors in a single reaction.

For simplicity, the order in which Reactor Functions are executed in a reaction is arbitrary. This is because the order of multiple Reactor Functions with shared Reactor dependencies becomes confusing, unpredictable, and not very useful in practical situations. Your Reactor Functions should be isolated units capable of being called at any time in any order.


## Examples

### Linking a Reactor to an input

```javascript
var name       = new Reactor('Sammy');
var name_input = document.getElementById('name-input');

Reactor(function() {
	name_input.value = name.value();
});

name_input.addEventListener('change', function() {
	name(this.value);
});
```

### Rendering a [Handlebars](http://handlebarsjs.com/) template

```javascript
var template  = Handlebars.compile(user_info_template);
var container = document.getElementById('user-info-container');

Reactor(function() {
	container.innerHTML = template({
		first_name : first_name(),
		last_name  : last_name(),
	});
});
```


## API

### Reactor(function, [context])

Runs a function with an optional context. If a Reactor's value is retrieved within the function, the function is registered as dependent on the Reactor and will be re-run if a reaction is triggered.

### new Reactor([default_value])

Creates a new Reactor with an optional default value

### *&lt;Reactor&gt;*()

Returns the value of a Reactor

### *&lt;Reactor&gt;*(value)

Sets the value of a Reactor. If the value is not strictly equal to the previous value, a reaction is scheduled.

### *&lt;Reactor&gt;*.trigger()

Triggers a reaction without setting the Reactor's value
