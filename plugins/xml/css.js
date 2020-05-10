/*\
title: $:/plugins/flibbles/xml/css.js
type: application/javascript
module-type: library

Makes available querySelector, either through a browser's native support, or
the node.JS library
\*/

var _css = undefined;

exports.querySelector = function(cssSelector, contextNode) {
	return getCSS().querySelector(cssSelector, contextNode);
};

exports.querySelectorAll = function(cssSelector, contextNode) {
	return getCSS().querySelectorAll(cssSelector, contextNode);
};

exports.getError = function(exception, cssSelector) {
	// All we do currently is say that the query is bad. No details.
	if (exception.name === "TypeError") {
		// This is an unexpected type of error. Not syntax. Just print it.
		return exception.message;
	}
	return $tw.language.getString("flibbles/xml/Error/CSS/SyntaxError",
		{variables: {css: cssSelector}});
};

function getCSS() {
	if (_css === undefined) {
		_css = Object.create(null);
		if ($tw.browser) {
			_css.querySelector = function(cssSelector, contextNode) {
				return contextNode.querySelector(cssSelector);
			};
			_css.querySelectorAll = function(cssSelector, contextNode) {
				return contextNode.querySelectorAll(cssSelector);
			};
		} else {
			try {
				var querySelectorAll = require("query-selector").default;
				_css.querySelectorAll = querySelectorAll;
				_css.querySelector = function(cssSelector, contextNode) {
					var nodeList = querySelectorAll(cssSelector, contextNode);
					return nodeList[0];
				};
			} catch (e) {
				function unsupported() {
					throw "query-selector is required on Node.JS for this operation. Install xpath with 'npm install query-selector'";
				};
				_css.querySelector = unsupported;
				_css.querySelectorAll = unsupported;
			}
		}
	}
	return _css;
};
