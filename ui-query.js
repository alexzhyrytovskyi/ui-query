//======================================================================================================================
// uiQuery v1.1 - Minimal jQuery replacement
// author: Alex Zhyrytovskyi
//
// Contents:
//   [uiKitBase]
//   [uiQuery]
//   [uiUtility]
//
// 2022-07-10 (v1.1)
//  - Used more optimal way for adding and removing CSS class
//  - Removed color space part as redundant
// 2022-01-04 (v1.0)
//  - First public release
//======================================================================================================================
var ui;
(function() {
	//==================================================================================================================
	//  [uiKitBase]
	//==================================================================================================================
	function uiKit(selector) {
		return new _uiKit(selector);
	}

	function _uiKit(selector) {
		return this.uiQuery(selector);
	}

	_uiKit.prototype = uiKit.fn = uiKit.prototype = {
		constructor: uiKit,
		push: [].push,
		node: null,
		length: 0,
		extendUI: function(obj) {
			for (var prop in obj)
				this[prop] = obj[prop];
		}
	};
	ui = uiKit;
	//==================================================================================================================
	//  END OF: [uiKitBase]
	//==================================================================================================================

	//==================================================================================================================
	//  [uiQuery]
	//==================================================================================================================
	var uiQuery = ui;

	(function(e) {
		// Initializing cross browser selector matches
		if (!e.matches)
			e.matches = e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
	})(Element.prototype);

	ui.fn.uiQuery = function(selector) {
		if (typeof selector == 'string') {
			selector = selector.trim();
			if (selector != '') {
				if (selector.charAt(0) == '<') {
					this.node = createNodeFromHTML(selector);
					this.push(this.node);
				}
				else {
					this.node = document.querySelector(selector);
					if (this.node) {
						this.push(this.node);
						if (this.node.uiInterface)
							this.extendUI(this.node.uiInterface);
					}
				}
			}
		}
		else if (typeof selector == 'object') {
			if (!selector)
				return this;

			if (selector instanceof uiQuery) {
				if (selector.node && selector.node.uiInterface)
					selector.extendUI(selector.node.uiInterface);

				return selector;
			}

			else if (selector instanceof NodeList || selector instanceof HTMLCollection || selector instanceof Array) {
				for (var j = 0; j < selector.length; j++)
					this.push(selector[j]);
				if (selector.length > 0)
					this.node = selector[0];
			}
			else if (window['jQuery'] && selector instanceof jQuery && selector.length > 0) {
				this.node = selector[0];
				for (var i = 0; i < selector.length; i++)
					this.push(selector[i]);
			}
			else { // HTMLElement, SVGPathElement, document, window
				this.node = selector;
				this.push(this.node);
			}

			if (this.node && this.node.uiInterface)
				this.extendUI(this.node.uiInterface);
		}
		else if (typeof selector == 'function')
			window.addEventListener('load', selector, false);

		return this;
	};

	function createNodeFromHTML(html) {
		var template = document.createElement('template');
		template.innerHTML = html;
		return template.content.childNodes[0];
	}

	uiQuery.fn.hasClass = function(className) {
		return this.node.classList.contains(className);
	};

	uiQuery.fn.addClass = function(className) {
		this.node.classList.add(className);
	};

	uiQuery.fn.removeClass = function(className) {
		this.node.classList.remove(className);
	};

	uiQuery.fn.toggleClass = function(className, stateVal) {
		if (typeof stateVal !== 'boolean')
			stateVal = !this.hasClass(className);

		if (stateVal)
			this.addClass(className);
		else
			this.removeClass(className);
	};

	uiQuery.fn.show = function() {
		this.node.style.display = 'block';
	};

	uiQuery.fn.hide = function() {
		this.node.style.display = 'none';
	};

	uiQuery.fn.toggle = function(stateVal) {
		if (typeof stateVal !== 'boolean')
			stateVal = (window.getComputedStyle(this.node, null).getPropertyValue('display') == 'none');

		if (stateVal)
			this.show();
		else
			this.hide();
	};

	uiQuery.fn.css = function(name, value) {
		if (typeof name == 'string' && typeof value == 'undefined')
			return window.getComputedStyle(this.node, null).getPropertyValue(name.trim());

		if (typeof name == 'string') {
			this.node.style[name] = value;
			return null;
		}

		for (var prop in name)
			this.node.style[prop] = name[prop];
		return null;
	};

	uiQuery.fn.attr = function(name, value) {
		if (typeof name == 'string' && typeof value == 'undefined')
			return this.node.getAttribute(name);

		if (typeof name == 'string') {
			this.node.setAttribute(name, value);
			return null;
		}

		for (var prop in name)
			this.node.setAttribute(prop, name[prop]);
		return null;
	};

	uiQuery.fn.removeAttr = function(name) {
		this.node.removeAttribute(name);
	};

	uiQuery.fn.data = function(name, value) {
		this.node._uiData = this.node._uiData || {};

		if (typeof name == 'undefined')
			return this.node._uiData;

		if (typeof value == 'undefined')
			return this.node._uiData[name];

		this.node._uiData[name] = value;
		return null;
	};

	uiQuery.fn.removeData = function(name) {
		this.node._uiData = this.node._uiData || {};
		delete this.node._uiData[name];
	};

	uiQuery.fn.empty = function() {
		this.node.innerHTML = '';
	};

	uiQuery.fn.html = function(html) {
		if (typeof html == 'undefined')
			return this.node.innerHTML;

		this.node.innerHTML = html;
		return null;
	};

	uiQuery.fn.text = function(html) {
		if (typeof html == 'undefined')
			return this.node.innerText.trim();

		this.node.innerText = html;
		return null;
	};

	uiQuery.fn.remove = function() {
		this.node.parentNode.removeChild(this.node);
	};

	uiQuery.fn.detach = function() {
		return uiQuery(this.node.parentNode.removeChild(this.node));
	};

	uiQuery.fn.append = function(element) {
		if (typeof element == 'object') {
			if (element instanceof HTMLElement)
				this.node.appendChild(element);
			else if (element instanceof uiQuery)
				this.node.appendChild(element.node);
			else if (window['jQuery'] && element instanceof jQuery && element.length > 0)
				this.node.appendChild(element[0]);
		}
		else if (typeof element == 'string')
			this.node.appendChild(uiQuery(element).node);
	};

	function prependChild(node, newNode) {
		if (node.firstChild)
			node.insertBefore(newNode, node.firstChild);
		else
			node.appendChild(newNode);
	}

	uiQuery.fn.prepend = function(element) {
		if (typeof element == 'object') {
			if (element instanceof HTMLElement)
				prependChild(this.node, element);
			else if (element instanceof uiQuery)
				prependChild(this.node, element.node);
			else if (window['jQuery'] && element instanceof jQuery && element.length > 0)
				prependChild(this.node, element[0]);
		}
		else if (typeof element == 'string') {
			var newNode = uiQuery(element).node;
			if (newNode)
				prependChild(this.node, newNode);
		}
	};

	uiQuery.fn.appendTo = function(element) {
		if (element instanceof uiQuery)
			element.node.appendChild(this.node);
		else if (window['jQuery'] && element instanceof jQuery)
			element.append(this[0]);
		else // HTMLElement, SVGPathElement, document, window
			element.appendChild(this.node);
	};

	function insertBefore(element, referenceNode) {
		referenceNode.parentNode.insertBefore(element, referenceNode);
	}

	uiQuery.fn.insertBefore = function(element) {
		if (typeof element == 'string')
			element = uiQuery(element);

		if (element instanceof uiQuery)
			insertBefore(this.node, element.node);
		else if (window['jQuery'] && element instanceof jQuery && element.length)
			insertBefore(this[0], element.node);
		else // HTMLElement
			insertBefore(this, element.node);
	};
	
	function insertAfter(element, referenceNode) {
		referenceNode.parentNode.insertBefore(element, referenceNode.nextSibling);
	}

	uiQuery.fn.insertAfter = function(element) {
		if (element instanceof uiQuery)
			insertAfter(this.node, element.node);
		else if (window['jQuery'] && element instanceof jQuery && element.length)
			insertAfter(this[0], element.node);
		else // HTMLElement
			insertAfter(this, element.node);
	};

	uiQuery.fn.offset = function() {
		var left, top;
		var node = this.node;

		if (node.getBoundingClientRect) {
			var rect = node.getBoundingClientRect();
			left = rect.left + window.pageXOffset;
			top = rect.top + window.pageYOffset;
		}
		else {
			left = 0;
			top = 0;
			while (node) {
				left += node.offsetLeft;
				top += node.offsetTop;
				node = node.offsetParent;
			}
		}
		return {
			'left': left,
			'top': top
		};
	};

	uiQuery.fn.width = function(value) {
		if (typeof value == 'undefined')
			return parseInt(window.getComputedStyle(this.node, null).getPropertyValue('width'));

		this.node.style.width = ui.toInt(value) + 'px';
		return null;
	};

	uiQuery.fn.innerWidth = function(value) {
		if (typeof value == 'undefined') {
			if (this.node == window)
				return document.documentElement.clientWidth;

			return this.node.clientWidth || this.node.innerWidth;
		}

		this.node.style.width = (ui.toInt(value) + this.node.clientWidth - parseInt(window.getComputedStyle(this.node, null).getPropertyValue('width'))) + 'px';
		return null;
	};

	uiQuery.fn.outerWidth = function(value) {
		if (typeof value == 'undefined')
			return this.node.offsetWidth;

		this.node.style.width = (ui.toInt(value) + this.node.offsetWidth - parseInt(window.getComputedStyle(this.node, null).getPropertyValue('width'))) + 'px';
		return null;
	};

	uiQuery.fn.height = function(value) {
		if (typeof value == 'undefined')
			return parseInt(window.getComputedStyle(this.node, null).getPropertyValue('height'));

		this.node.style.height = ui.toInt(value) + 'px';
		return null;
	};

	uiQuery.fn.innerHeight = function(value) {
		if (typeof value == 'undefined') {
			if (this.node == window)
				return document.documentElement.clientHeight;

			return this.node.clientHeight || this.node.innerHeight;
		}

		this.node.style.height = (ui.toInt(value) + this.node.clientHeight - parseInt(window.getComputedStyle(this.node, null).getPropertyValue('height'))) + 'px';
		return null;
	};

	uiQuery.fn.outerHeight = function(value) {
		if (typeof value == 'undefined')
			return this.node.offsetHeight;

		this.node.style.height = (ui.toInt(value) + this.node.offsetHeight - parseInt(window.getComputedStyle(this.node, null).getPropertyValue('height'))) + 'px';
		return null;
	};

	uiQuery.fn.scrollLeft = function(value) {
		if (typeof value == 'undefined')
			return (this.node == window) ? window.pageXOffset : this.node.scrollLeft;

		if (this.node == window)
			window.scrollTo(value, window.pageYOffset);
		else
			this.node.scrollLeft = value;
		return null;
	};

	uiQuery.fn.scrollTop = function(value) {
		if (typeof value == 'undefined')
			return (this.node == window) ? window.pageYOffset : this.node.scrollTop;

		if (this.node == window)
			window.scrollTo(window.pageXOffset, value);
		else
			this.node.scrollTop = value;
		return null;
	};

	var eventNameOverrides = {
		'mouseenter': 'mouseover',
		'mouseleave': 'mouseout'
	};

	uiQuery.fn.on = function(eventName, selector, handler) {
		if (eventNameOverrides.hasOwnProperty(eventName))
			eventName = eventNameOverrides[eventName];

		if (typeof selector == 'function') {
			handler = selector;
			selector = null;
		}

		// If there multiple event names, than we create handler for each event name
		var parts = eventName.split(' ');
		if (parts.length > 1) {
			for (var i = 0; i < parts.length; i++)
				this.on(parts[i], selector, handler);
			return;
		}

		// Creating listener
		var node = this.node;
		var listener = function(event) {
			if (!selector) {
				handler.call(node, event);
				return;
			}

			var target = event.target;
			if (!event.target.matches(selector))
				target = event.target.closest(selector);
			if (target)
				handler.call(target, event);
		};

		// Registering event
		var events = ui.toArray(this.node._uiEvents);
		events.push({
			'name': eventName,
			'selector': selector,
			'listener': listener,
			'handler': handler
		});
		this.node._uiEvents = events;

		this.node.addEventListener(eventName, listener);
	};

	uiQuery.fn.off = function(eventName, selector, handler) {
		var i, event, events;

		if (typeof selector == 'function') {
			handler = selector;
			selector = null;
		}

		// Case #1: Removing all events
		if (typeof eventName == 'undefined') {
			// Removing events from current node
			events = ui.toArray(this.node._uiEvents);
			for (i = 0; i < events.length; i++) {
				event = events[i];
				this.node.removeEventListener(event.name, event.listener);
			}

			// Removing events from child nodes
			var savedNode = this.node;
			var childNodes = this.node.childNodes || [];
			for (i = 0; i < childNodes.length; i++) {
				var node = childNodes[i];
				events = ui.toArray(this.node._uiEvents);
				for (var j = 0; j < events.length; j++) {
					event = events[j];
					node.removeEventListener(event.name, event.listener);
				}
				delete node._uiEvents;
				this.node = node;
				this.off();
			}
			this.node = savedNode;
			return;
		}

		// Obtaining event list for current node
		events = ui.toArray(this.node._uiEvents);
		var newEvents = [];

		// Case #2: Removing all events by event name
		if (!selector && !handler) {
			for (i = 0; i < events.length; i++) {
				event = events[i];
				if (event.name == eventName)
					this.node.removeEventListener(event.name, event.listener);
				else
					newEvents.push(event);
			}
		}

		// Case #3: Removing events by event name and handler
		else if (ui.isFunction(handler)) {
			for (i = 0; i < events.length; i++) {
				event = events[i];
				if (event.name == eventName && event.handler == handler)
					this.node.removeEventListener(event.name, event.listener);
				else
					newEvents.push(event);
			}
		}

		// Case #4: Removing events by event name and selector
		else if (selector) {
			for (i = 0; i < events.length; i++) {
				event = events[i];
				if (event.name == eventName && event.selector == selector)
					this.node.removeEventListener(event.name, event.listener);
				else
					newEvents.push(event);
			}
		}

		// Updating event list
		this.node._uiEvents = newEvents;
		events = null;
	};

	uiQuery.fn.find = function(selector) {
		if (typeof selector == 'object') {
			var node;
			if (selector instanceof uiQuery)
				node = selector.node;
			else if (selector instanceof HTMLElement)
				node = selector;
			else if (window['jQuery'] && selector instanceof jQuery && selector.length)
				node = selector[0];
			else
				node = null;

			if (!node)
				return uiQuery(null);

			return uiQuery(find(node.childNodes));

			function find(nodeList) {
				for (var i = 0; i < nodeList.length; i++) {
					var itemNode = nodeList[i];
					if (itemNode == node)
						return itemNode;

					var resNode = find(itemNode.childNodes);
					if (resNode)
						return resNode;
				}
				return null;
			}
		}

		return uiQuery(this.node.querySelector(selector));
	};

	uiQuery.fn.findAll = function(selector) {
		if (typeof selector == 'object')
			return this.find(selector);

		return uiQuery(this.node.querySelectorAll(selector));
	};

	uiQuery.fn.closest = function(selector) {
		if (typeof selector == 'string')
			return uiQuery(this.node.closest(selector));

		var node = this.node;
		var selectorNode = uiQuery(selector).node;
		for (;;) {
			if (!node)
				return uiQuery(null);

			if (node == selectorNode)
				return uiQuery(node);

			node = node.parentNode;
		}
	};

	uiQuery.fn.is = function(element) {
		if (typeof element == 'string')
			return this.node.matches(element);

		if (typeof element == 'object') {
			if (element instanceof uiQuery)
				return (this.node == element.node);

			if (window['jQuery'] && element instanceof jQuery && element.length > 0)
				return (this.node == element[0]);
		}

		return (this.node == element);
	};

	uiQuery.fn.clone = function(deep) {
		if (deep === undefined)
			deep = true;

		return uiQuery(this.node.cloneNode(deep));
	};

	uiQuery.fn.trigger = function(eventName, eventData) {
		if (!this.node)
			return;

		var event;
		switch (eventName) {
			case 'click':
			case 'mousedown':
			case 'mouseup':
				event = document.createEvent('MouseEvents');
				event.initEvent(eventName, true, true);
				this.node.dispatchEvent(event);
				break;

			case 'focus':
			case 'change':
			case 'blur':
			case 'select':
				event = document.createEvent('HTMLEvents');
				event.initEvent(eventName, true, true);
				this.node.dispatchEvent(event);
				break;

			case 'resize':
				window.dispatchEvent(new Event('resize'));
				break;

			default:
				this.node.dispatchEvent(new CustomEvent(eventName, {
					'bubbles': true,
					'cancelable': true,
					'detail': ui.toObject(eventData)
				}));
		}
	};

	uiQuery.fn.click = function(selector, handler) {
		if (typeof selector != 'undefined' || typeof handler != 'undefined')
			this.on('click', selector, handler);
		else
			this.trigger('click');
	};

	uiQuery.fn.resize = function(selector, handler) {
		if (typeof selector != 'undefined' || typeof handler != 'undefined')
			this.on('resize', selector, handler);
		else
			this.trigger('resize');
	};

	uiQuery.fn.each = function(callback) {
		if (typeof callback != 'function')
			return;

		for (var i = 0; i < this.length; i++)
			callback.call(this[i], i);
	};

	uiQuery.fn.eq = function(index) {
		if (index < 0 || index >= this.length)
			return uiQuery(null);

		return uiQuery(this[index]);
	};

	uiQuery.fn.children = function(selector) {
		var element = uiQuery();
		var childNodes = this.node.childNodes;
		for (var i = 0; i < childNodes.length; i++) {
			var node = childNodes[i];
			if (node.nodeType != 3 && (!selector || node.matches(selector)))
				element.push(node);
		}

		element.node = element.length ? element[0] : null;
		return element;
	};

	uiQuery.fn.filter = function(callback) {
		if (callback == ':visible') {
			callback = function() {
				return this.style.display != 'none';
			};
		}

		var list = [];
		var i;

		for (i = 0; i < this.length; i++) {
			var flag = callback.call(this[i], i);
			if (flag)
				list.push(this[i]);
		}

		this.length = 0;
		for (i = 0; i < list.length; i++)
			this.push(list[i]);
		return this;
	};

	uiQuery.fn.focus = function() {
		if (this.node && this.node.focus)
			this.node.focus();
	};

	var easingFunctions = {
		'easeInQuad': function(p) {
			return p * p;
		},
		'easeOutQuad': function(p) {
			return -(p * (p - 2));
		},
		'easeInOutQuad':function(p) {
			if (p < 0.5)
				return 2 * p * p;
			else
				return (-2 * p * p) + (4 * p) - 1;
		},
		'easeInCubic': function(p) {
			return p * p * p;
		},
		'easeOutCubic': function(p) {
			var f = p - 1;
			return f * f * f + 1;
		},
		'easeInOutCubic': function(p) {
			if (p < 0.5) {
				return 4 * p * p * p;
			}
			else {
				var f = ((2 * p) - 2);
				return 0.5 * f * f * f + 1;
			}
		},
		'easeInQuart': function(p) {
			return p * p * p * p;
		},
		'easeOutQuart': function(p) {
			var f = (p-1);
			return f * f * f * (1 - p) + 1;
		},
		'easeInOutQuart': function(p) {
			if (p < 0.5) {
				return 8 * p * p * p * p;
			}
			else {
				var f = (p - 1);
				return -8 * f * f * f * f + 1;
			}
		},
		'easeInQuint': function(p) {
			return p * p * p * p * p;
		},
		'easeOutQuint': function(p) {
			var f = (p - 1);
			return f * f * f * f * f + 1;
		},
		'easeInOutQuint': function(p) {
			if (p < 0.5) {
				return 16 * p * p * p * p * p;
			}
			else {
				var f = ((2 * p) - 2);
				return 0.5 * f * f * f * f * f + 1;
			}
		},
		'easeInSine': function(p) {
			return Math.sin((p - 1) * (Math.PI / 2)) + 1;
		},
		'easeOutSine': function(p) {
			return Math.sin(p * (Math.PI / 2));
		},
		'easeInOutSine': function(p) {
			return 0.5 * (1 - Math.cos(p * (Math.PI / 2)));
		},
		'easeInExpo': function(p) {
			return (p == 0.0) ? p : Math.pow(2, 10 * (p - 1));
		},
		'easeOutExpo': function(p) {
			return (p == 1.0) ? p : 1 - Math.pow(2, -10 * p);
		},
		'easeInOutExpo': function(p) {
			if (p==0.0 || p==1.0)
				return p;

			if (p < 0.5)
				return 0.5 * Math.pow(2, (20 * p) - 10);
			else
				return -0.5 * Math.pow(2, (-20 * p) + 10) + 1;
		},
		'easeInCirc': function(p) {
			return 1 - Math.sqrt(1 - (p * p));
		},
		'easeOutCirc': function(p) {
			return Math.sqrt((2 - p) * p);
		},
		'easeInOutCirc': function(p) {
			if (p < 0.5)
				return 0.5 * (1 - Math.sqrt(1 - 4 * (p * p)));
			else
				return 0.5 * (Math.sqrt(-((2 * p) - 3) * ((2 * p) - 1)) + 1);
		},
		'easeInElastic': function(p) {
			return Math.sin(13 * (Math.PI / 2) * p) * Math.pow(2, 10 * (p - 1));
		},
		'easeOutElastic': function(p) {
			return Math.sin(-13 * (Math.PI / 2) * (p + 1)) * Math.pow(2, -10 * p) + 1;
		},
		'easeInOutElastic': function(p) {
			if (p < 0.5)
				return 0.5 * Math.sin(13 * (Math.PI / 2) * (2 * p))*Math.pow(2, 10 * ((2 * p) - 1));
			else
				return 0.5 * (Math.sin(-13 * (Math.PI / 2) * ((2 * p - 1) + 1)) * Math.pow(2, -10 * (2 * p - 1)) + 2);
		},
		'easeInBack': function(p) {
			return p * p * p - p * Math.sin(p * Math.PI);
		},
		'easeOutBack': function(p) {
			var f = (1 - p);
			return 1 - (f * f * f - f * Math.sin(f * Math.PI));
		},
		'easeInOutBack': function(p) {
			var f;
			if (p < 0.5) {
				f = 2 * p;
				return 0.5 * (f * f * f - f * Math.sin(f * Math.PI));
			}
			else {
				f = (1 - (2 * p - 1));
				return 0.5 * (1 - (f * f * f - f * Math.sin(f * Math.PI))) + 0.5;
			}
		},
		'easeInBounce': function(p) {
			return 1 - this.easeOutBounce(1 - p);
		},
		'easeOutBounce': function(p) {
			if (p < 4 / 11.0)
				return (121 * p * p) / 16.0;
			else if (p < 8 / 11.0)
				return (363 / 40.0 * p * p) - (99 / 10.0 * p) + 17 / 5.0;
			else if (p < 9 / 10.0)
				return (4356 / 361.0 * p * p) - (35442 / 1805.0 * p) + 16061 / 1805.0;
			else
				return (54 / 5.0 * p * p) - (513 / 25.0 * p) + 268 / 25.0;
		},
		'easeInOutBounce': function(p) {
			if (p < 0.5)
				return 0.5 * this.easeOutBounce(p * 2);
			else
				return 0.5 * this.easeOutBounce(p * 2 - 1) + 0.5;
		}
	};
	uiQuery.easing = easingFunctions;

	uiQuery.fn.animate = function(styles, duration, easing, complete) {
		var $this = this;
		$this.stop();

		var element = this;
		var step = null;
		var props = {};
		for (var propertyName in styles) {
			var propertyValue = styles[propertyName];
			switch (propertyName) {
				case 'step':
					if (ui.isFunction(propertyValue))
						step = propertyValue;
					break;
				case 'margin-left':
				case 'margin-top':
				case 'margin-right':
				case 'margin-bottom':
				case 'padding-left':
				case 'padding-top':
				case 'padding-right':
				case 'padding-bottom':
					props[propertyName] = {
						'start': parseFloat(element.css(propertyName)),
						'end': parseFloat(propertyValue),
						'unit': 'px'
					};
					break;
				case 'opacity':
					props[propertyName] = {
						'start': parseFloat(element.css(propertyName)),
						'end': parseFloat(propertyValue),
						'unit': ''
					};
					break;
				case 'left':
				case 'top':
				case 'right':
				case 'bottom':
				case 'width':
				case 'height':
				case 'font-size':
				case 'line-height':
					props[propertyName] = {
						'start': parseFloat(element.css(propertyName)),
						'end': parseFloat(propertyValue),
						'unit': ui.toString(propertyValue).replace(/^\d+/, '')
					};
					break;
			}
		}

		var startTime = (new Date()).getTime();
		nextAnimationStep();

		function nextAnimationStep() {
			var now = (new Date().getTime()) - startTime;

			var progress = ui.ensureRange(now / duration, 0, 1);
			var easingProgress = easingFunctions.hasOwnProperty(easing) ? easingFunctions[easing](progress) : progress;

			for (var propName in props) {
				var prop = props[propName];
				var value = (prop['end'] - prop['start']) * easingProgress + prop['start'];
				element.css(propName, value + prop['unit']);
			}

			if (step)
				step(progress);

			if (progress < 1) {
				$this.node['_uiAnimationTimer'] = setTimeout(nextAnimationStep, 10);
			}
			else {
				$this.stop();
				if (ui.isFunction(complete))
					complete();
			}
		}
	};

	uiQuery.fn.stop = function() {
		if (this.node['_uiAnimationTimer']) {
			clearTimeout(this.node['_uiAnimationTimer']);
			delete this.node['_uiAnimationTimer'];
		}
	};

	uiQuery.fn.fadeIn = function(duration, callback) {
		var element = this;
		element.css({
			'display': 'block',
			'opacity': 0
		});
		element.animate({
			'opacity': 1
		}, duration, 'linear', function() {
			element.css('opacity', '');
			if (ui.isFunction(callback))
				callback();
		});
	};

	uiQuery.fn.fadeOut = function(duration, callback) {
		var element = this;
		element.css({
			'opacity': 1
		});
		element.animate({
			'opacity': 0
		}, duration, 'linear', function() {
			element.css({
				'display': 'none',
				'opacity': ''
			});
			if (ui.isFunction(callback))
				callback();
		});
	};

	uiQuery.fn.fadeTo = function(duration, opacity, callback) {
		this.animate({
			'opacity': opacity
		}, duration, 'linear', callback);
	};

	uiQuery.fn.slideDown = function(duration, callback) {
		var element = this;
		if (element.css('display') != 'none') {
			if (ui.isFunction(callback))
				callback();

			return;
		}

		element.css({
			'display': 'block',
			'visibility': 'hidden',
			'overflow': 'hidden'
		});
		var height = element.height();
		element.css({
			'visibility': '',
			'height': '0px'
		});
		element.animate({
			'height': height + 'px'
		}, duration, 'linear', function() {
			element.css({
				'height': '',
				'overflow': ''
			});
			if (ui.isFunction(callback))
				callback();
		});
	};

	uiQuery.fn.slideUp = function(duration, callback) {
		var element = this;
		if (element.css('display') == 'none') {
			if (ui.isFunction(callback))
				callback();

			return;
		}

		element.css({
			'height': element.height() + 'px',
			'overflow': 'hidden'
		});
		element.animate({
			'height': '0px'
		}, duration, 'linear', function() {
			element.css({
				'display': 'none',
				'height': '',
				'overflow': ''
			});
			if (ui.isFunction(callback))
				callback();
		});
	};

	uiQuery.fn.slideToggle = function(duration, callback) {
		var element = this;
		if (element.css('display') == 'none')
			element.slideDown(duration, callback);
		else
			element.slideUp(duration, callback);
	};

	uiQuery.fn.index = function() {
		var node = this.node.previousSibling;
		var index = 0;
		while (node) {
			if (node.nodeType == 3) {
				node = node.previousSibling;
				continue;
			}

			node = node.previousSibling;
			index++;
		}
		return index;
	};

	uiQuery.fn.prev = function() {
		var node = this.node.previousSibling;
		while (node && node.nodeType == 3)
			node = node.previousSibling;
		return uiQuery(node);
	};

	uiQuery.fn.next = function() {
		var node = this.node.nextSibling;
		while (node && node.nodeType == 3)
			node = node.nextSibling;
		return uiQuery(node);
	};

	uiQuery.fn.parent = function() {
		return uiQuery(this.node.parentNode);
	};

	uiQuery.fn.val = function(value) {
		if (typeof value == 'undefined')
			return this.node.value;

		this.node.value = value;
		return null;
	};

	uiQuery.post = function(url, params, callback) {
		var xhr = new XMLHttpRequest();

		var formData = new FormData;
		for (var key in params)
			formData.append(key, params[key]);

		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200 && ui.isFunction(callback))
				callback(this.responseText);
		};
		xhr.open('POST', url, true);
		xhr.send(formData);
	};

	if (window['jQuery'])
		window['jQuery'].fn.findAll = window['jQuery'].fn.find;

	if (!window['$'])
		window['$'] = uiQuery;
	//==================================================================================================================
	//  END OF: [uiQuery]
	//==================================================================================================================

	//==================================================================================================================
	//  [uiUtility]
	//==================================================================================================================
	ui.toInt = function(value) {
		var type = (typeof value);

		if (type == 'number')
			return Math.floor(value);

		if (type == 'boolean')
			return value ? 1 : 0;

		if (type == 'string')
			return parseInt(value) || 0;

		return 0;
	};

	ui.toFloat = function(value) {
		var type = (typeof value);

		if (type == 'number')
			return value;

		if (type == 'boolean')
			return value ? 1.0 : 0.0;

		if (type == 'string')
			return parseFloat(value.replace(/e.*$/i, '')) || 0;

		return 0.0;
	};

	ui.toBoolean = function(value) {
		var type = (typeof value);

		if (type == 'number')
			return !!value;

		if (type == 'boolean')
			return value;

		if (type == 'string')
			return !!parseInt(value);

		return false;
	};

	ui.isString = function(value) {
		return (typeof value == 'string');
	};

	ui.toString = function(value) {
		var type = (typeof value);

		if (type == 'number')
			return value.toString();

		if (type == 'boolean')
			return value ? '1' : '0';

		if (type == 'string')
			return value;

		return '';
	};

	ui.trim = function(value) {
		var type = (typeof value);

		if (type == 'number')
			return value.toString();

		if (type == 'boolean')
			return value ? '1' : '0';

		if (type == 'string')
			return value.trim();

		return '';
	};

	ui.isObject = function(value) {
		return ((typeof value == 'object') && (value !== null) && !(value instanceof Array));
	};

	ui.isEmptyObject = function(value) {
		if (!ui.isObject(value))
			return false;
		for (var prop in value)
			return false;
		return true;
	};

	ui.objectKey = function(obj) {
		for (var key in obj)
			return key;

		return null;
	};

	ui.toObject = function(value) {
		return ui.isObject(value) ? value : {};
	};

	ui.isArray = function(value) {
		return ((typeof value == 'object') && (value instanceof Array));
	};

	ui.toArray = function(value) {
		return ui.isArray(value) ? value : [];
	};

	ui.makeArray = function(value) {
		return ui.isArray(value) ? value : [value];
	};

	ui.isFunction = function(value) {
		return (typeof value == 'function');
	};

	ui.toFunction = function(value) {
		return (typeof value == 'function') ? value : null;
	};

	ui.ensureRange = function(value, minValue, maxValue) {
		if (value < minValue)
			return minValue;
		if (value > maxValue)
			return maxValue;
		return value;
	};
	//==================================================================================================================
	//  END OF: [uiUtility]
	//==================================================================================================================
})();