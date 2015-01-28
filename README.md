# Reactor

A micro reactive programming library for JS

## Overview

Reactor is a library that allows you to write functions that automatically respond to changes to variables used within them. This allows you to think of your project as a single, static state instead of the constantly changing mess inherent to large projects. Stop tracking changes to your variables and start writing beautiful, intuitive code.

## Quick Start

The following example creates a Reactor variable with a default value and then runs a function that retrieves and logs its value. Afterwards, the value is changed causing the previous function to run again and log the new value.

```javascript
var my_name = new Reactor('Sammy');

Reactor(function() {
	console.log(my_name.get());
});

my_name.set('Bobby');
```

The above code outputs the following to the console:
```
Sammy
Bobby
```

## Slow Start

### Creating Reactors

Reactors are created using *new Reactor()*. They can hold values and can optionally be initialized with a default value. Their values can then be retrieved/changed anywhere using the *get()*/*set()* methods.

```javascript
var my_name = new Reactor('Sammy');
var my_age  = new Reactor();

my_age.set(12);

console.log(my_name.get());
console.log(my_age.get());
```

> **NOTE:** You must use the *new* keyword when creating a Reactor


### Creating Reactor Functions

Reactor Functions are created using *Reactor(function() {})*. Within the passed in function, if a Reactor's value is retrieved via *get()*, the function is registered as dependent on that value and will be re-run when the value changes.

Reactor Functions can contain any number of Reactors. Conversely, Reactors can be used within any number of Reactor Functions.

```javascript
// This function is dependent on my_name and my_age
Reactor(function() {
	var name = my_name.get();
	var age  = my_age.get();

	console.log(name + ' ' + age);
});

// This function is dependent on my_name
Reactor(function() {
	console.log('Hello, ' + my_name.get());
});
```

> **NOTE:** Do not use the *new* keyword when creating a Reactor Function


### Triggering a Reaction

Any time a Reactor's value is changed using *set()*, all functions dependent on it will be re-run. This is called a reaction.

A reaction only occurs if the new value fails strict equality with the previous value. This helps prevent infinite loops when *set()* is called within a Reactor Function.

```javascript
my_name.set('Bobby');

Reactor(function() {
	my_name.set('Willy');
});
```

When a reaction is triggered, it is not executed immediately. Instead, it is scheduled for the next time the client is idle (typically after only a few milliseconds). This is so that multiple, rapid changes to the value are aggregated into a single reaction.


### Reactors without values

Reactors do not need to have values. In some cases, it's useful to have a Reactor whose sole purpose is to activate Reactor Functions explicitly.

Because they hold no values, use *depend()*/*act()* instead of *get()*/*set()*, respectively.

```javascript
var my_activator = new Reactor();

Reactor(function() {
	my_activator.depend();

	console.log(Math.random());
});

my_activator.act();
```

## API

### new Reactor([default_value])

Creates a new Reactor with an optional default value.

### Reactor(function, [context])

Runs a function with an optional context ("this"). If *get()*/*depend()* is called on a Reactor within the function, the function is registered as dependent on the Reactor and will be re-run if a reaction is triggered.

### *&lt;Reactor&gt;*.get()

Returns the value of a Reactor

### *&lt;Reactor&gt;*.set(value)

Sets the value of a Reactor. If the value is not strictly equal to the previous value, a reaction is scheduled.

### *&lt;Reactor&gt;*.depend()

Similar to Reactor.get() except it does not return a value. This is useful for Reactors that do not hold values.

### *&lt;Reactor&gt;*.act()

Similar to Reactor.set() except it does not accept a value. This is useful for Reactors that do not hold values or for forcing a reaction without changing the Reactor's value.
