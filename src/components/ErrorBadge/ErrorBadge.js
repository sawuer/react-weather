import React, { Component } from 'react';
import './ErrorBadge.css';

class ErrorBadge extends Component {
  render () {
    return <div className="ErrorBadge">{this.props.msg}</div>
  }
}

export default ErrorBadge;
