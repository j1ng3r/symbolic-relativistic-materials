math = (() => {
	class AbstractNode extends Function {
		constructor() {
			super("...args", "return this.call(...args)");
			return this.bind(this);
		}
		getDerivative(n) {
			let derivatives = this.getDerivatives();
			if(n < derivatives.length) {
				return derivatives[n];
			} else {
				return null;
			}
		}
		call(...fs) {
			if(fs.includes(null)) return null;
			return new EmbeddedNode(this, fs);
		}
	}

	class EmbeddedNode extends AbstractNode {
		constructor(root, children) {
			super();
			this.root = root;
			this.children = children;
			this.arity = Math.max(...this.children.map(child => child.arity));
			if(this.root.arity != this.children.length) {
				console.warn("The root node has a different arity than the number of children!");
			}
		}
		evaluate(...args) {
			return this.root(...this.children(child => child.evaluate(...args)));
		}
		getDerivatives() {
			return new Array(this.arity).map((_, argIndex), 
				sumNodelist(
					this.children.map(
						(child, childIndex) => multiply(
							this.root.getDerivative(childIndex),
							child.getDerivative(argIndex)
						)
					).filter(v => v != null)
				)
			);
		}
		
	}

	class LeafNode extends AbstractNode {
		constructor(obj) {
			super();
			this.arity = obj.arity;
			this.evaluate = obj.evaluate;
			this.derivatives = obj.derivatives;
			if(this.arity != this.derivatives.length) {
				console.warn("Different number of arguments and derivatives in call to math.fn!");
			}
		}
		getDerivatives() {
			return this.derivatives;
		}
	}

	function sumNodelist(nodelist) {
		return new Fn({
			arity: nodelist.length,
			evaluate: (...args) => args.reduce((sum, arg) => sum + arg, 0),
			derivatives: new Array(arity).fill(math.constant(1))
		})(nodelist);
	}

	function constant(v) {
		return new LeafNode({
			arity: 0,
			evaluate: () => v,
			derivatives: []
		})
	}
	let zero = constant(0);
	function isZero(node) {
		return node.arity == 0 && node.evaluate() == 0;
	}

	function argument(n) {
		let derivatives = new Array(n + 1).fill(null);
		derivatives[n] = constant(1);
		return new LeafNode({
			arity: n + 1,
			evaluate: (...args) => args[n],
			derivatives
		})
	}

	return {
		AbstractNode,
		EmbeddedNode,
		LeafNode,
		fn: LeafNode,
		constant,
		argument
	}
})();
add(multiply, minus);
add(multiply(math.argument(0), math.argument(1)), minus(math.argument(0), math.argument(1)));
add = new math.Fn({
	arguments: 2,
	evaluate: (x,y) => x + y,
	derivatives: [math.constant(1), math.constant(1)]
})
minus = new math.Fn({
	arguments: 2,
	evaluate: (x,y) => x - y,
	derivatives: [math.constant(1), math.constant(-1)]
})
multiply = new math.Fn({
	arguments: 2,
	evaluate: (x,y) => x * y,
	derivatives: [math.argument(1), math.argument(0)]
})
square = new math.Fn({
	arguments: 1,
	evaluate: x=>x*x,
	derivatives: [multiply(2,math.argument(0))]
})
negativeFast = new math.Fn({
	arguments: 1,
	evaluate: x=>-x,
	derivatives: [math.constant(-1)]
})
negative = multiply(math.constant(-1), math.argument(0));
inverse = new math.Fn({
	arguments: 1,
	evaluate: x=>1/x,
	derivatives: [negative(inverse(square))]
})
log = new math.Fn({
	arguments: 1,
	evaluate: x=>Math.log(x),
	derivatives: [inverse]
})
pow = new math.Fn({
	arguments: 2,
	evaluate: (x,y)=>x**y,
	derivatives: [multiply(math.argument(1), pow(math.argument(0), minus(math.argument(1), math.constant(1)))), multiply(pow, log)]
})
//*/
cos = {
	arguments: 1,
	evaluate: Math.cos
};
sin = math.fn({
	arguments: 1,
	evaluate: Math.sin,
	derivative: cos
})
cos.derivative = negative(sin);
let zhat = {
	type: 'vector',
	size: 3,
	values: [
		zero,
		zero,
		one
	]
};
let theta = {
	type: 'operator',
	root: multiply,
	args: [
		{
			type: 'variable',
			name: 'omega'
		}, {
			type: 'variable',
			name: 's_z'
		}
	]
};
let costheta = {
	type: 'operator',
	root: cos,
	arg: theta
};
let sintheta = {
	type: 'operator',
	name: sin,
	arg: theta
}
scope.variables.set('Theta', {
	type: 'matrix',
	size: [3,3],
	values: [
		[costheta, negative(sintheta), zero],
		[sintheta, costheta, zero],
		[zero, zero, zero]
	]
});

{
	type: 'matrix',
	size: [2,2],
	values: [
		[
			{
				type: 'operator',
				name: 'cos',
				arg: {
					type: 'operator',
					name: 'multiply',
					args: [
						{
							type: 'variable',
							name: 'omega'
						}, {
							type: 'variable',
							name: 's_z'
						}
					]
				}
			}, {

			}
		], [
			{

			}, {

			}
		]
	]
}
{
	type: 'operator',
	value: 'multiply',

}


let math = require("mathjs");
const { multiply, sin, evaluate, cos, LN10, add, null, null, null } = require("mathjs");

expr1 = math.parse("x*cos(z)-y*sin(z)");
expr2 = math.parse("y*cos(z)+x*sin(z)");
r = math.matrix([expr1, expr2]);
P_inv = math.matrix(math.derivative(r,'x'),math.derivative(r,'y'));
