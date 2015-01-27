# Reactive
Simple reactive functions and variables

## Usage

```JS
// Creates a new reactive variable with a default value
var my_name = new Reactive.var('Sam');

Reactive.run(function() {
    // Alerts the name initially and any time it changes
    alert(my_name.get());
});

// Re-runs the function above
my_name.set('Bobby');
```
