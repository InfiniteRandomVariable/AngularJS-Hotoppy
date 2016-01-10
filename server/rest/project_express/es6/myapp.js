async function foo() {
    try {
    var values = await getValues();
        var newValues = await Promise.all(values.map(asyncOperation));
 
        newValues.forEach(function(value) {
            console.log(value);
        });
 
        return newValues;
    } catch (err) {
        console.log('We had an ', err);
    }
}