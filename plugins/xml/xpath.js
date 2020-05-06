/*\
title: $:/plugins/flibbles/xml/xpath.js
type: application/javascript
module-type: library

Makes available XPath, either through a browser's native support, or
the node.JS library
\*/

if ($tw.browser) {
	exports.XPathResult = XPathResult;
	exports.evaluate = function(xpathExpression, contextNode, namespaceResolver, resultType, result) {
		var doc = contextNode.ownerDocument || contextNode;
		return doc.evaluate(xpathExpression, contextNode, namespaceResolver, resultType, result);
	}
	exports.createNSResolver = function(node) {
		var doc = node.ownerDocument || node;
		return doc.createNSResolver(node);
	}
} else {
	try {
		var xpath = require('xpath');
		exports.XPathResult = xpath.XPathResult;
		exports.evaluate = xpath.evaluate;
		exports.createNSResolver = xpath.createNSResolver;
	} catch (e) {
		function unresolved() {
			throw "xpath is required on Node.JS for this operation. Install xpath with 'npm install xpath'";
		};
		exports.evaluate = unresolved;
		exports.createNSResolver = unresolved;
		exports.XPathResult = Object.create(null);
	}
}

/**This attempts to build a consistent error message from an xpath
 * "evaluate" exception. Different implementations act differently. This
 * Tries to reconcile them all into an error message in a tiddler language
 * string.
 */
exports.getError = function(exception, query) {
	var code, msg;
	switch (exception.name) {
		case "NamespaceError":
		case "SyntaxError":
			code = exception.name;
			break;
		case "Error":
			if (exception.message.indexOf("Cannot resolve QName") == 0) {
				code = "NamespaceError";
			} else if (exception.message.indexOf("Invalid expression") == 0) {
				code = "SyntaxError";
			}
			break;
	}
	if (code) {
		msg = $tw.language.getString("flibbles/xml/Error/XPath/" + code,
			{variables: {xpath: query}});
	} else {
		// This message will be wildly inconsistent across implementations,
		// but it's better that we show this than something generic.
		msg = exception.message;
		console.warn(exception.code);
		console.warn(exception.name);
		console.warn(exception.message);
		console.warn(exception);
	}
	return msg;
};