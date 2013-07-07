var parser = require('uglify-js').parser,
	traverse = require('traverse'),
	burrito = require('burrito'),
	fs = require('fs'),
	path = require('path'),
	nodes = [],
	sandbox = {
		'$$call': function(i) {
			var node = nodes[i];
			console.log('execute: ' + node.source());
			return function(expr) {
				return expr;
			}
		},
		'$$expr': function(i) {
			var node = nodes[i];
			console.log('execute: ' + node.source());
			return function(expr) {
				return expr;
			}
		},
		'$$stat': function(i) {
			var node = nodes[i];
			console.log('execute: ' + node.source());
		},
		console: console
	},
	vm = require('vm'),
	context = vm.createContext(sandbox);

var source = fs.readFileSync(path.join(__dirname, 'source.js'), 'utf-8'),
	ast = parser.parse(source);

var wrappedCode = burrito(source, function(node) {
	var index = nodes.length;
	if (node.name === 'call') {
		nodes.push(node);
		node.wrap('$$call(' + index + ')(%s)');
	} else if (/^stat|throw|var$/.test(node.name)) {
		nodes.push(node);
		node.wrap('{ $$stat(' + index + ');%s }');
	} else if (/^binary|unary-postfix|unary-prefix$/.test(node.name)) {
		nodes.push(node);
		node.wrap('$$expr(' + index + ')(%s)');
	}
});

//console.log(wrappedCode);
vm.runInNewContext(wrappedCode, sandbox);