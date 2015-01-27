# Reactor
Simple reactive JavaScript functions and variables

## Usage

```JS
// Creates a new reactive variable with a default value
var my_name = Reactor('Sam');

// Run a function reactively
// Any changes to reactive variables within the function will cause it to re-run
Reactor.run(function() {
	// Get the current value of my_name
	var name = my_name();

	console.log(name);
});

// Change the value of my_name
// This causes all functions that rely on the value to re-run
my_name('Bobby');
```
