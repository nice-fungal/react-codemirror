'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var findDOMNode = ReactDOM.findDOMNode;
var debounce = require('lodash.debounce');

var CodeMirror = React.createClass({
	displayName: 'CodeMirror',

	propTypes: {
		className: React.PropTypes.any,
		codeMirrorInstance: React.PropTypes.string,
		defaultValue: React.PropTypes.string,
		onChange: React.PropTypes.func,
		onFocusChange: React.PropTypes.func,
		onScroll: React.PropTypes.func,
		options: React.PropTypes.object,
		path: React.PropTypes.string,
		value: React.PropTypes.string
	},
	getCodeMirrorInstance: function getCodeMirrorInstance() {
		return window[this.props.codeMirrorInstance];
	},
	getDefaultProps: function getDefaultProps() {
		return {
			codeMirrorInstance: 'CodeMirror'
		};
	},
	getInitialState: function getInitialState() {
		return {
			isFocused: false
		};
	},
	componentWillMount: function componentWillMount() {
		this.componentWillReceiveProps = debounce(this.componentWillReceiveProps, 0);
	},
	componentDidMount: function componentDidMount() {
		var textareaNode = findDOMNode(this.refs.textarea);
		var codeMirrorInstance = this.getCodeMirrorInstance();
		this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode, this.props.options);
		this.codeMirror.on('change', this.codemirrorValueChanged);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.codeMirror.on('scroll', this.scrollChanged);
		this.codeMirror.setValue(this.props.defaultValue || this.props.value || '');
		this.handleUpdate = debounce(function (nextProps) {
			if (this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() !== nextProps.value) {
				this.codeMirror.setValue(nextProps.value);
			}
			if (typeof nextProps.options === 'object') {
				for (var optionName in nextProps.options) {
					if (nextProps.options.hasOwnProperty(optionName)) {
						this.codeMirror.setOption(optionName, nextProps.options[optionName]);
					}
				}
			}
		}, 0);
	},
	componentWillUnmount: function componentWillUnmount() {
		// is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror) {
			this.codeMirror.toTextArea();
		}
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.handleUpdate(nextProps);
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() !== nextProps.value) {
			this.codeMirror.setValue(nextProps.value);
		}
		if (typeof nextProps.options === 'object') {
			for (var optionName in nextProps.options) {
				if (nextProps.options.hasOwnProperty(optionName)) {
					this.codeMirror.setOption(optionName, nextProps.options[optionName]);
				}
			}
		}
	},
	getCodeMirror: function getCodeMirror() {
		return this.codeMirror;
	},
	focus: function focus() {
		if (this.codeMirror) {
			this.codeMirror.focus();
		}
	},
	focusChanged: function focusChanged(focused) {
		this.setState({
			isFocused: focused
		});
		this.props.onFocusChange && this.props.onFocusChange(focused);
	},
	scrollChanged: function scrollChanged(cm) {
		this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
	},
	codemirrorValueChanged: function codemirrorValueChanged(doc, change) {
		if (this.props.onChange && change.origin !== 'setValue') {
			this.props.onChange(doc.getValue());
		}
	},
	render: function render() {
		var classes = 'ReactCodeMirror ';
		if (this.state.isFocused) {
			classes += 'ReactCodeMirror--focused';
		}
		classes += this.props.className;
		return React.createElement(
			'div',
			{ className: classes },
			React.createElement('textarea', { ref: 'textarea', name: this.props.path, defaultValue: this.props.value, autoComplete: 'off' })
		);
	}
});

module.exports = CodeMirror;